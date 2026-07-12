import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from "recharts";
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieIcon, 
  Target, 
  Layers, 
  Info,
  Calendar
} from "lucide-react";
import { Resultado } from "../types";
import { GRUPOS_BICHO } from "../bicho_rules";
import { computeStats } from "../utils_generation";

interface EstatisticasProps {
  results: Resultado[];
}

export default function Estatisticas({ results }: EstatisticasProps) {
  const stats = computeStats(results);

  // 1. Prepare data for BarChart (Top 10 Groups)
  const groupBarData = Object.keys(stats.groupFrequencies)
    .map((numKey) => {
      const num = Number(numKey);
      const bicho = GRUPOS_BICHO.find(g => g.numero === num);
      return {
        grupo: `${num.toString().padStart(2, "0")} - ${bicho?.nome || ""}`,
        frequencia: stats.groupFrequencies[num],
        atraso: stats.groupDelays[num]
      };
    })
    .sort((a, b) => b.frequencia - a.frequencia)
    .slice(0, 10);

  // 2. Prepare data for PieChart (Parity ratio)
  let evens = 0;
  let odds = 0;
  results.forEach(res => {
    const tens = [
      res.r1.substring(2),
      res.r2.substring(2),
      res.r3.substring(2),
      res.r4.substring(2),
      res.r5.substring(2)
    ];
    tens.forEach(t => {
      const val = parseInt(t, 10);
      if (!isNaN(val)) {
        if (val % 2 === 0) evens++;
        else odds++;
      }
    });
  });
  
  const parityData = [
    { name: "Pares", value: evens, color: "#00f0ff" },
    { name: "Ímpares", value: odds, color: "#9d4edd" }
  ];

  // 3. Prepare data for LineChart (Timeline evolution of total results count)
  // We'll map occurrences of top drawn group over time
  const topGroupNum = Object.keys(stats.groupFrequencies)
    .map(Number)
    .sort((a, b) => stats.groupFrequencies[b] - stats.groupFrequencies[a])[0] || 1;
  const topGroupName = GRUPOS_BICHO.find(g => g.numero === topGroupNum)?.nome || "";

  const evolutionData = results
    .slice()
    .sort((a, b) => a.data.localeCompare(b.data))
    .map((res, index) => {
      // count if top group appeared in this contest
      const tens = [
        res.r1.substring(2),
        res.r2.substring(2),
        res.r3.substring(2),
        res.r4.substring(2),
        res.r5.substring(2)
      ];
      let appeared = 0;
      tens.forEach(t => {
        const num = parseInt(t, 10);
        const group = GRUPOS_BICHO.find(g => g.dezenas.includes(t));
        if (group && group.numero === topGroupNum) {
          appeared = 1;
        }
      });

      return {
        concurso: `${res.data.substring(5)} (${res.extracao})`,
        "Frequência Acumulada": appeared,
        drawIndex: index + 1
      };
    });

  // Accumulate frequency
  let runningSum = 0;
  const accumulatedEvolutionData = evolutionData.map(item => {
    runningSum += item["Frequência Acumulada"];
    return {
      ...item,
      "Frequência Acumulada": runningSum
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 rounded-2xl border border-white/10 bg-white/5 glass-effect">
        <span className="text-[10px] font-black text-neon-purple uppercase tracking-widest bg-neon-purple/10 px-2.5 py-1 rounded-full">
          GRÁFICOS E BI
        </span>
        <h2 className="text-xl md:text-2xl font-black text-white mt-2 uppercase italic tracking-tight">
          Gráficos e Estatísticas de Performance
        </h2>
        <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wide">
          Acompanhe indicadores consolidados de paridade, linhas de evolução acumulada e histogramas de frequência com tecnologia interativa.
        </p>
      </div>

      {results.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-white/10 bg-[#121212] shadow-sm">
          <Info size={24} className="text-gray-500 mx-auto mb-2" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider italic">Histórico Sem Dados</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto uppercase font-bold tracking-wide">
            Por favor, cadastre ao menos um resultado diário na Central de Análises para alimentar e desenhar as curvas gráficas estatísticas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Chart 1: Bar Chart of top 10 Groups (8 Cols) */}
          <div className="lg:col-span-8 p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-3 shadow-sm">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2.5 italic">
              <BarChart3 size={14} className="text-neon-blue" />
              Top 10 Grupos Mais Sorteados (Frequência)
            </h3>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupBarData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="grupo" tick={{ fill: '#9ca3af', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }} 
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="frequencia" fill="#00f3ff" radius={[4, 4, 0, 0]} name="Ocorrências" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Pie Chart of parity ratios (4 Cols) */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-3 flex flex-col justify-between shadow-sm">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2.5 italic">
              <PieIcon size={14} className="text-neon-purple" />
              Proporção Paridade Dezenas
            </h3>

            <div className="h-[200px] relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={parityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {parityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute text-center">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none">Total Analisado</p>
                <p className="text-xl font-mono font-black text-white mt-1 leading-none">{evens + odds}</p>
              </div>
            </div>

            <div className="flex justify-around text-xs border-t border-white/10 pt-3.5">
              <div className="text-center">
                <span className="inline-block w-2.5 h-2.5 rounded bg-neon-blue mr-1.5" />
                <span className="text-gray-400 font-bold uppercase text-[10px]">Pares:</span>
                <p className="text-white font-mono font-black text-sm mt-0.5">{evens}</p>
              </div>
              <div className="text-center">
                <span className="inline-block w-2.5 h-2.5 rounded bg-neon-purple mr-1.5" />
                <span className="text-gray-400 font-bold uppercase text-[10px]">Ímpares:</span>
                <p className="text-white font-mono font-black text-sm mt-0.5">{odds}</p>
              </div>
            </div>
          </div>

          {/* Chart 3: Line Chart Timeline Evolution (12 Cols) */}
          <div className="lg:col-span-12 p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-3 shadow-sm">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2.5 italic">
                <TrendingUp size={14} className="text-neon-green" />
                Linha Temporal de Tendência - Grupo Favorito: {topGroupName} (Acumulado)
              </h3>
              <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wide">
                Visualização do crescimento de saídas do grupo mais frequente ({topGroupName}) concurso a concurso.
              </p>
            </div>

            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accumulatedEvolutionData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="concurso" tick={{ fill: '#9ca3af', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Frequência Acumulada" 
                    stroke="#39ff14" 
                    strokeWidth={2.5} 
                    dot={{ stroke: '#39ff14', strokeWidth: 1, r: 2.5, fill: '#121212' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
