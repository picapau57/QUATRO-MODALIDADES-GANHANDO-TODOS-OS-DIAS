import React, { useState } from "react";
import { 
  Sparkles, 
  Trash2, 
  Plus, 
  BarChart3, 
  Calendar, 
  Clock, 
  ListOrdered, 
  Percent, 
  Grid, 
  Flame,
  AlertTriangle,
  History,
  FileSpreadsheet
} from "lucide-react";
import { Resultado } from "../types";
import { GRUPOS_BICHO, obterGrupoPorDezena } from "../bicho_rules";
import { computeStats } from "../utils_generation";
import { motion, AnimatePresence } from "motion/react";

interface CentralAnalisesProps {
  results: Resultado[];
  onAddResult: (newResult: Omit<Resultado, "id">) => void;
  onDeleteResult: (id: string) => void;
  user: any;
}

export default function CentralAnalises({
  results,
  onAddResult,
  onDeleteResult,
  user
}: CentralAnalisesProps) {
  // Input form states
  const [data, setData] = useState<string>(new Date().toISOString().substring(0, 10));
  const [horario, setHorario] = useState<string>("11:30");
  const [extracao, setExtracao] = useState<string>("PTM");
  const [r1, setR1] = useState<string>("");
  const [r2, setR2] = useState<string>("");
  const [r3, setR3] = useState<string>("");
  const [r4, setR4] = useState<string>("");
  const [r5, setR5] = useState<string>("");

  const [formError, setFormError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [activeAnalysisSubTab, setActiveAnalysisSubTab] = useState<string>("rankings");

  // Statistical calculations
  const stats = computeStats(results);

  // Parse registered list for tables and displays
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate 4 digit numerical requirements
    const rReg = /^\d{4}$/;
    if (!rReg.test(r1) || !rReg.test(r2) || !rReg.test(r3) || !rReg.test(r4) || !rReg.test(r5)) {
      setFormError("Todos os campos do 1° ao 5° prêmio devem conter exatamente 4 dígitos numéricos (Ex: 1965).");
      return;
    }

    if (!data || !horario || !extracao) {
      setFormError("Preencha todos os campos do formulário.");
      return;
    }

    onAddResult({
      data,
      horario,
      extracao,
      r1, r2, r3, r4, r5
    });

    // Reset fields except date and extractors
    setR1("");
    setR2("");
    setR3("");
    setR4("");
    setR5("");
    setFormError(null);
    setShowAddForm(false);
  };

  // Compute Evens vs Odds of tens in current results
  let evenCount = 0;
  let oddCount = 0;
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
        if (val % 2 === 0) evenCount++;
        else oddCount++;
      }
    });
  });
  const totalParImpar = evenCount + oddCount || 1;
  const evenPercent = Math.round((evenCount / totalParImpar) * 100);
  const oddPercent = 100 - evenPercent;

  // Render content
  return (
    <div className="space-y-6">
      
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 glass-effect">
        <div>
          <span className="text-[9px] font-black text-neon-blue uppercase tracking-widest bg-neon-blue/10 px-2.5 py-1 rounded-full italic">
            MÓDULO DE ANALÍTICA
          </span>
          <h2 className="text-xl md:text-2xl font-black uppercase text-white mt-3 italic tracking-tighter">
            Central de <span className="text-neon-blue">Análises</span> Estatísticas
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">
            Insira resultados históricos manualmente, gere tabelas dinâmicas, explore mapas de calor e visualize a frequência dos grupos e dezenas.
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-black bg-neon-green hover:brightness-110 active:scale-95 rounded-lg transition-all btn-glow-green"
            id="btn-toggle-add-result"
          >
            <Plus size={15} />
            Cadastrar Resultado
          </button>
        </div>
      </div>

      {/* Collapsible Manual Registration Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleFormSubmit}
              className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 shadow-xl"
            >
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 italic">
                <Plus size={16} className="text-neon-green" />
                Novo Concurso (Inserção Manual)
              </h3>

              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wide">
                  {formError}
                </div>
              )}

              {/* Grid 1: metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 italic">
                    Data do Sorteio
                  </label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 text-white font-mono text-xs p-2.5 rounded-lg outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 italic">
                    Horário da Extração
                  </label>
                  <select
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 text-white text-xs p-2.5 rounded-lg outline-none"
                  >
                    <option value="11:30">11:30 (PTM)</option>
                    <option value="14:30">14:30 (PT)</option>
                    <option value="16:00">16:00 (PTV)</option>
                    <option value="18:00">18:00 (PTN)</option>
                    <option value="21:30">21:30 (COR/Federal)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 italic">
                    Sigla Extração
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: PT, PTM, FED"
                    value={extracao}
                    onChange={(e) => setExtracao(e.target.value.toUpperCase())}
                    className="w-full bg-[#050505] border border-white/10 text-white font-mono text-xs p-2.5 rounded-lg outline-none"
                    required
                  />
                </div>
              </div>

              {/* Grid 2: 1 to 5 results */}
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">
                  Dezenas / Milhares do Sorteio (1° ao 5° Prêmio)
                </label>
                
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: r1, set: setR1, label: "1° Prêmio" },
                    { val: r2, set: setR2, label: "2° Prêmio" },
                    { val: r3, set: setR3, label: "3° Prêmio" },
                    { val: r4, set: setR4, label: "4° Prêmio" },
                    { val: r5, set: setR5, label: "5° Prêmio" }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Ex: 1965"
                        value={item.val}
                        onChange={(e) => item.set(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-[#050505] border border-white/10 focus:border-neon-green/40 text-white font-mono font-black text-xs text-center p-2.5 rounded-lg outline-none transition-colors"
                        required
                      />
                      <span className="block text-[8px] text-center text-gray-500 mt-1 uppercase tracking-wide font-bold">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit triggers */}
              <div className="flex justify-end gap-2 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-black bg-neon-green hover:brightness-110 active:scale-95 rounded-lg transition-all btn-glow-green"
                  id="btn-submit-result"
                >
                  Salvar e Analisar Sorteio
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistical overview sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column - stats & heatmap (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Sub Tab selection bar */}
          <div className="flex bg-[#121212] p-1 rounded-xl border border-white/10">
            {[
              { id: "rankings", label: "Rankings", icon: ListOrdered },
              { id: "heatmap", label: "Mapa de Calor", icon: Grid },
              { id: "parity", label: "Par / Ímpar", icon: Percent },
              { id: "history", label: "Histórico Concursos", icon: History }
            ].map((subTab) => {
              const SubIcon = subTab.icon;
              return (
                <button
                  key={subTab.id}
                  onClick={() => setActiveAnalysisSubTab(subTab.id)}
                  className={`flex-1 py-2.5 text-[10px] font-black tracking-wider rounded-lg transition-all uppercase flex items-center justify-center gap-1.5 italic ${
                    activeAnalysisSubTab === subTab.id 
                      ? "bg-white/10 text-white border-b-2 border-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.02)]" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                  id={`sub-tab-${subTab.id}`}
                >
                  <SubIcon size={13} />
                  <span className="hidden sm:inline">{subTab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub Tab View: Rankings */}
          {activeAnalysisSubTab === "rankings" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
              
              {/* Group Rankings (Bicho) */}
              <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-3.5 shadow-sm">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2.5 italic">
                  <Flame size={14} className="text-neon-orange animate-pulse" />
                  Ranking dos Grupos do Bicho
                </h3>

                {results.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-500 uppercase font-bold tracking-wide">
                    Cadastre resultados para calcular rankings.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {Object.keys(stats.groupFrequencies)
                      .map(Number)
                      .sort((a, b) => stats.groupFrequencies[b] - stats.groupFrequencies[a])
                      .slice(0, 10)
                      .map((num, i) => {
                        const bicho = GRUPOS_BICHO.find(g => g.numero === num);
                        const freq = stats.groupFrequencies[num];
                        const barPercent = Math.max(5, Math.min(100, (freq / results.length) * 40));

                        return (
                          <div key={num} className="space-y-1 text-xs">
                            <div className="flex justify-between items-center text-gray-300">
                              <span className="font-bold text-white uppercase text-[11px]">
                                #{i + 1} - Grupo {num.toString().padStart(2, "0")} ({bicho?.nome})
                              </span>
                              <span className="font-mono text-neon-blue font-black italic uppercase text-[11px]">
                                {freq} saídas
                              </span>
                            </div>
                            <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-white/5">
                              <div 
                                className="bg-gradient-to-r from-neon-blue to-neon-purple h-full rounded-full transition-all duration-500" 
                                style={{ width: `${barPercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Tens Rankings */}
              <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-3.5 shadow-sm">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2.5 italic">
                  <Flame size={14} className="text-neon-green" />
                  Ranking das Dezenas Mais Recorrentes
                </h3>

                {results.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-500 uppercase font-bold tracking-wide">
                    Cadastre resultados para calcular dezenas.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {Object.keys(stats.tensFrequencies)
                      .sort((a, b) => stats.tensFrequencies[b] - stats.tensFrequencies[a])
                      .slice(0, 10)
                      .map((ten, i) => {
                        const freq = stats.tensFrequencies[ten];
                        const barPercent = Math.max(5, Math.min(100, (freq / results.length) * 40));
                        const bicho = obterGrupoPorDezena(ten);

                        return (
                          <div key={ten} className="space-y-1 text-xs">
                            <div className="flex justify-between items-center text-gray-300">
                              <span className="font-bold text-white flex items-center gap-1.5 uppercase text-[11px]">
                                <span className="font-mono text-[10px] text-gray-500">#{i + 1}</span>
                                <span className="font-mono font-black text-neon-green bg-neon-green/5 border border-neon-green/10 px-1.5 py-0.5 rounded text-[10px]">
                                  {ten}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  ({bicho?.nome})
                                </span>
                              </span>
                              <span className="font-mono text-neon-green font-black italic uppercase text-[11px]">
                                {freq} saídas
                              </span>
                            </div>
                            <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-white/5">
                              <div 
                                className="bg-gradient-to-r from-neon-green to-neon-blue h-full rounded-full transition-all duration-500" 
                                style={{ width: `${barPercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Sub Tab View: Heatmap Grid 10x10 */}
          {activeAnalysisSubTab === "heatmap" && (
            <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-3.5 animate-fadeIn shadow-sm">
              <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/10 pb-2.5 flex items-center justify-between italic">
                <span>Matriz de Distribuição Térmica (Dezenas 00-99)</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Mapa de Calor</span>
              </h3>
              
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">
                A tonalidade do fundo corresponde à frequência de saída da dezena. Cores mais quentes (<span className="text-neon-orange font-black">Laranja/Neon</span>) indicam dezenas muito recorrentes.
              </p>

              <div className="grid grid-cols-10 gap-1.5 pt-2">
                {Array.from({ length: 100 }, (_, idx) => {
                  const valStr = idx.toString().padStart(2, "0");
                  const freq = stats.tensFrequencies[valStr] || 0;
                  
                  // Calculate heat opacity based on highest frequency
                  const maxFreq = Math.max(...Object.values(stats.tensFrequencies), 1);
                  const heatOpacity = freq / maxFreq;

                  let heatStyle: React.CSSProperties = {};
                  if (freq > 0) {
                    heatStyle = {
                      background: `rgba(255, 112, 0, ${0.1 + heatOpacity * 0.7})`,
                      borderColor: `rgba(255, 112, 0, ${0.2 + heatOpacity * 0.6})`,
                      boxShadow: freq === maxFreq ? "0 0 10px rgba(255, 112, 0, 0.2)" : "none"
                    };
                  }

                  return (
                    <div
                      key={idx}
                      style={heatStyle}
                      className={`aspect-square rounded flex flex-col items-center justify-center border text-center transition-all ${
                        freq > 0 
                          ? "text-white font-bold" 
                          : "bg-black/40 border-white/5 text-gray-650 font-medium"
                      }`}
                      title={`Dezena ${valStr} - ${freq} ocorrências`}
                    >
                      <span className="font-mono text-xs leading-none">{valStr}</span>
                      {freq > 0 && (
                        <span className="text-[8px] font-bold text-gray-300 leading-none mt-1 font-mono">
                          {freq}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub Tab View: Parity Indicators */}
          {activeAnalysisSubTab === "parity" && (
            <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 animate-fadeIn shadow-sm">
              <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/10 pb-2.5 italic">
                Relação Paridade (Pares vs Ímpares)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                {/* Radial Par */}
                <div className="p-5 rounded-xl bg-black border border-white/5 text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Dezenas Pares</span>
                  <div className="relative w-24 h-24 flex items-center justify-center mt-3">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#111" strokeWidth="6" fill="transparent" />
                      <circle cx="48" cy="48" r="40" stroke="#00f3ff" strokeWidth="6" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * evenPercent) / 100} />
                    </svg>
                    <span className="absolute font-mono font-black text-white text-lg">{evenPercent}%</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase mt-3">{evenCount} dezenas pares</span>
                </div>

                {/* Radial Ímpar */}
                <div className="p-5 rounded-xl bg-black border border-white/5 text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Dezenas Ímpares</span>
                  <div className="relative w-24 h-24 flex items-center justify-center mt-3">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#111" strokeWidth="6" fill="transparent" />
                      <circle cx="48" cy="48" r="40" stroke="#bc13fe" strokeWidth="6" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * oddPercent) / 100} />
                    </svg>
                    <span className="absolute font-mono font-black text-white text-lg">{oddPercent}%</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase mt-3">{oddCount} dezenas ímpares</span>
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab View: History & Dynamic Table */}
          {activeAnalysisSubTab === "history" && (
            <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 animate-fadeIn shadow-sm">
              <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/10 pb-2.5 italic">
                Histórico Dinâmico de Sorteios
              </h3>

              {results.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500 uppercase font-bold tracking-wide">
                  Nenhum concurso inserido ainda.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 uppercase font-bold tracking-wider">
                        <th className="py-2.5 px-3 font-bold uppercase tracking-wider">Data</th>
                        <th className="py-2.5 px-3 font-bold uppercase tracking-wider">Horário</th>
                        <th className="py-2.5 px-3 font-bold uppercase tracking-wider">Extração</th>
                        <th className="py-2.5 px-3 text-center font-bold uppercase tracking-wider">1° Prêmio</th>
                        <th className="py-2.5 px-3 text-center font-bold uppercase tracking-wider">2° Sorteio</th>
                        <th className="py-2.5 px-3 text-center font-bold uppercase tracking-wider">3° Sorteio</th>
                        <th className="py-2.5 px-3 text-center font-bold uppercase tracking-wider">4° Sorteio</th>
                        <th className="py-2.5 px-3 text-center font-bold uppercase tracking-wider">5° Sorteio</th>
                        {user?.role === "admin" && (
                          <th className="py-2.5 px-3 text-right font-bold uppercase tracking-wider">Ação</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {results.map((res) => (
                        <tr key={res.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-3 text-gray-300 font-mono">{res.data}</td>
                          <td className="py-3.5 px-3 text-gray-400 uppercase font-semibold">{res.horario}</td>
                          <td className="py-3.5 px-3 text-neon-blue font-black uppercase italic">{res.extracao}</td>
                          <td className="py-3.5 px-3 text-center text-neon-green font-mono font-black">{res.r1}</td>
                          <td className="py-3.5 px-3 text-center text-gray-300 font-mono">{res.r2}</td>
                          <td className="py-3.5 px-3 text-center text-gray-300 font-mono">{res.r3}</td>
                          <td className="py-3.5 px-3 text-center text-gray-300 font-mono">{res.r4}</td>
                          <td className="py-3.5 px-3 text-center text-gray-300 font-mono">{res.r5}</td>
                          {user?.role === "admin" && (
                            <td className="py-3.5 px-3 text-right">
                              <button
                                onClick={() => onDeleteResult(res.id)}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right column - warning & tips (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Support Disclaimer Panel */}
          <div className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-3 leading-relaxed shadow-sm">
            <h4 className="text-xs font-black text-yellow-500 flex items-center gap-1.5 uppercase tracking-wider border-b border-white/10 pb-2.5 italic">
              <AlertTriangle size={15} />
              Termos de Uso Analítico
            </h4>
            <p className="text-[11px] text-gray-400 uppercase font-bold leading-normal">
              O presente painel de análise foi desenvolvido unicamente para fins de organização, classificação e amostragem de dados estatísticos descritivos informados pelo usuário.
            </p>
            <p className="text-[11px] text-gray-400 uppercase font-bold leading-normal">
              <strong>Atenção:</strong> O Jogo do Bicho e demais loterias são sistemas de sorte totalmente independentes. As estatísticas passadas não influenciam os resultados futuros. Nunca prometemos previsões de sorteios, retornos financeiros ou aumento de probabilidade real.
            </p>
          </div>

          {/* Quick instructions panel */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-3.5 text-xs text-gray-300 shadow-sm">
            <h4 className="font-black uppercase tracking-wider text-white border-b border-white/10 pb-2.5 italic">
              Dicas de Alimentação
            </h4>
            <ul className="space-y-2 text-[11px] list-disc list-inside text-gray-400 font-bold uppercase tracking-wide leading-relaxed">
              <li>Mantenha as datas e extrações em ordem cronológica para que as estatísticas passadas permaneçam coerentes.</li>
              <li>Apenas administradores com privilégios de escrita podem deletar resultados incorretos do histórico.</li>
              <li>Sempre certifique-se de que os valores digitados correspondem aos concursos oficiais de sua região.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
