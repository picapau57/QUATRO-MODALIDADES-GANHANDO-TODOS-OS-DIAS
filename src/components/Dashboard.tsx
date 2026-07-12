import React, { useState } from "react";
import { 
  Sparkles, 
  Trash2, 
  Save, 
  FileDown, 
  Printer, 
  Dices, 
  TrendingUp, 
  Star, 
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { JogoGerado, Resultado } from "../types";
import { motion } from "motion/react";

interface DashboardProps {
  games: JogoGerado[];
  results: Resultado[];
  onGenerateAll: () => void;
  onClearAll: () => void;
  onSave: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({
  games,
  results,
  onGenerateAll,
  onClearAll,
  onSave,
  onExportPDF,
  onExportExcel,
  onPrint,
  setActiveTab
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Statistics calculations
  const totalGamesToday = games.length > 0 
    ? games.reduce((acc, curr) => acc + curr.jogos.length, 0)
    : 0;
  
  const totalResults = results.length;
  
  const favoriteGamesCount = games.reduce(
    (acc, curr) => acc + curr.jogos.filter((_, idx) => curr.favoritado).length, 0
  );

  // Search filter for results
  const filteredResults = results.filter(res => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      res.data.includes(term) ||
      res.extracao.toLowerCase().includes(term) ||
      res.horario.includes(term) ||
      res.r1.includes(term) ||
      res.r2.includes(term) ||
      res.r3.includes(term) ||
      res.r4.includes(term) ||
      res.r5.includes(term)
    );
  }).slice(0, 10); // Show top 10

  return (
    <div className="space-y-6">
      
      {/* Top Action Panel (Dashboard-exclusive actions) */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#121212] border border-white/10 shadow-[0_0_20px_rgba(0,243,255,0.03)] glass-effect">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black uppercase italic text-white flex items-center gap-2">
              <Sparkles size={20} className="text-neon-blue animate-pulse" />
              Painel Geral de <span className="text-neon-blue">Operações</span>
            </h2>
            <p className="text-[11px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
              Gere jogos em massa em todas as modalidades e gerencie seus relatórios rapidamente.
            </p>
          </div>

          {/* Action buttons list */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onGenerateAll}
              className="flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-black bg-neon-green hover:brightness-110 active:scale-95 rounded-lg transition-all btn-glow-green"
              id="btn-generate-all"
            >
              <Dices size={15} />
              Gerar Todos os Jogos
            </button>
            
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 active:scale-95 rounded-lg transition-all"
              id="btn-clear-all"
            >
              <Trash2 size={15} />
              Limpar Tudo
            </button>

            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-neon-blue border border-neon-blue/20 bg-neon-blue/5 hover:bg-neon-blue/10 active:scale-95 rounded-lg transition-all"
              id="btn-save-all"
            >
              <Save size={15} />
              Salvar
            </button>

            <div className="h-6 w-px bg-gray-800 hidden sm:block" />

            <button
              onClick={onExportPDF}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-gray-300 border border-gray-700 bg-gray-800/40 hover:bg-gray-800 active:scale-95 rounded-lg transition-all"
              id="btn-export-pdf"
            >
              <FileDown size={14} />
              PDF
            </button>

            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-gray-300 border border-gray-700 bg-gray-800/40 hover:bg-gray-800 active:scale-95 rounded-lg transition-all"
              id="btn-export-excel"
            >
              <FileDown size={14} />
              Excel
            </button>

            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-gray-300 border border-gray-700 bg-gray-800/40 hover:bg-gray-800 active:scale-95 rounded-lg transition-all"
              id="btn-print-games"
            >
              <Printer size={14} />
              Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Stat Card 1 */}
        <div className="stat-card bg-[#121212] border border-white/10 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                Jogos Gerados Hoje
              </p>
              <h3 className="text-4xl font-black text-white mt-2 italic tracking-tighter">
                {totalGamesToday}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-neon-green/10 text-neon-green btn-glow-green">
              <Dices size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 flex items-center gap-1.5 font-bold uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-ping" />
            Válido para as 4 modalidades
          </p>
        </div>

        {/* Stat Card 2 */}
        <div className="stat-card bg-[#121212] border border-white/10 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                Resultados Cadastrados
              </p>
              <h3 className="text-4xl font-black text-white mt-2 italic tracking-tighter">
                {totalResults}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-neon-blue/10 text-neon-blue btn-glow-blue">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 flex items-center gap-1 font-bold uppercase tracking-wide">
            Central de Análises Ativa
          </p>
        </div>

        {/* Stat Card 3 */}
        <div className="stat-card bg-[#121212] border border-white/10 group sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                Favoritos Salvos
              </p>
              <h3 className="text-4xl font-black text-white mt-2 italic tracking-tighter">
                {favoriteGamesCount}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-neon-purple/10 text-neon-purple">
              <Star size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 flex items-center gap-1 font-bold uppercase tracking-wide">
            Combinações Estreladas
          </p>
        </div>
      </div>

      {/* Main Grid: Modalidades Quick Access & Latest Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Modalidades Quick Access (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider italic">
            Acesso Rápido às Modalidades
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Modalidade 1 Card */}
            <div 
              onClick={() => setActiveTab("ternos_grupos")}
              className="p-5 rounded-2xl bg-[#121212] border border-white/10 hover:border-neon-blue/40 hover:scale-[1.01] cursor-pointer group transition-all duration-300"
            >
              <p className="text-[9px] font-black text-neon-blue uppercase tracking-widest italic">Primeira Modalidade</p>
              <h4 className="text-base font-black text-white mt-1 flex items-center justify-between uppercase italic">
                Ternos de Grupos
                <ArrowRight size={14} className="text-gray-500 group-hover:translate-x-1 group-hover:text-neon-blue transition-all" />
              </h4>
              <p className="text-xs text-gray-400 mt-2">40 jogos automáticos com 3 grupos exclusivos de 1 a 25.</p>
            </div>

            {/* Modalidade 2 Card */}
            <div 
              onClick={() => setActiveTab("ternos_dezenas")}
              className="p-5 rounded-2xl bg-[#121212] border border-white/10 hover:border-neon-purple/40 hover:scale-[1.01] cursor-pointer group transition-all duration-300"
            >
              <p className="text-[9px] font-black text-neon-purple uppercase tracking-widest italic">Segunda Modalidade</p>
              <h4 className="text-base font-black text-white mt-1 flex items-center justify-between uppercase italic">
                Ternos de Dezenas
                <ArrowRight size={14} className="text-gray-500 group-hover:translate-x-1 group-hover:text-neon-purple transition-all" />
              </h4>
              <p className="text-xs text-gray-400 mt-2">50 jogos com 3 dezenas selecionadas de uma base de 60.</p>
            </div>

            {/* Modalidade 3 Card */}
            <div 
              onClick={() => setActiveTab("milhares")}
              className="p-5 rounded-2xl bg-[#121212] border border-white/10 hover:border-neon-orange/40 hover:scale-[1.01] cursor-pointer group transition-all duration-300"
            >
              <p className="text-[9px] font-black text-neon-orange uppercase tracking-widest italic">Terceira Modalidade</p>
              <h4 className="text-base font-black text-white mt-1 flex items-center justify-between uppercase italic">
                Milhares
                <ArrowRight size={14} className="text-gray-500 group-hover:translate-x-1 group-hover:text-neon-orange transition-all" />
              </h4>
              <p className="text-xs text-gray-400 mt-2">40 milhares de 4 dígitos integrados com grupos do Bicho.</p>
            </div>

            {/* Modalidade 4 Card */}
            <div 
              onClick={() => setActiveTab("duques_dezenas")}
              className="p-5 rounded-2xl bg-[#121212] border border-white/10 hover:border-neon-green/40 hover:scale-[1.01] cursor-pointer group transition-all duration-300"
            >
              <p className="text-[9px] font-black text-neon-green uppercase tracking-widest italic">Quarta Modalidade</p>
              <h4 className="text-base font-black text-white mt-1 flex items-center justify-between uppercase italic">
                Duques de Dezenas
                <ArrowRight size={14} className="text-gray-500 group-hover:translate-x-1 group-hover:text-neon-green transition-all" />
              </h4>
              <p className="text-xs text-gray-400 mt-2">40 duques com filtros avançados baseados nas dezenas quentes.</p>
            </div>

          </div>

          {/* Quick Disclaimer banner */}
          <div className="p-4 rounded-xl border border-yellow-500/15 bg-yellow-500/5 text-yellow-500/80 leading-relaxed text-xs">
            <h4 className="font-black flex items-center gap-1 text-[10px] uppercase tracking-wider mb-1 italic">
              ⚠️ Isenção de Probabilidade Real
            </h4>
            Esta plataforma é estritamente uma ferramenta matemática organizativa e de visualização estatística de dados inseridos de forma offline. Ela não possui capacidade de prever sorteios, garantir retornos financeiros ou interferir nas probabilidades matemáticas reais dos concursos. Use com consciência e responsabilidade.
          </div>
        </div>

        {/* Right Col: Latest Results Searcher & Table (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider italic">
              Últimos Resultados Cadastrados
            </h3>
            <button
              onClick={() => setActiveTab("analises")}
              className="text-xs font-bold text-neon-blue hover:underline flex items-center gap-1 uppercase italic"
            >
              Ver Central
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                type="text"
                placeholder="Pesquisar por data, horário ou dezenas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 focus:border-neon-blue/50 text-white text-xs pl-9 pr-4 py-2 rounded-lg outline-none transition-all"
              />
            </div>

            {/* Results list */}
            {filteredResults.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500">
                Nenhum resultado correspondente cadastrado. Vá até a Central de Análises para cadastrar dados.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {filteredResults.map((res) => (
                  <div 
                    key={res.id} 
                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white flex items-center gap-1 uppercase italic">
                        <Calendar size={11} className="text-neon-purple" />
                        {res.data}
                      </span>
                      <span className="text-gray-400 font-bold uppercase tracking-wider">
                        {res.horario} • <span className="text-neon-blue font-black italic">{res.extracao}</span>
                      </span>
                    </div>

                    {/* R1 - R5 Numbers list */}
                    <div className="grid grid-cols-5 gap-1.5 text-center mt-1">
                      {[res.r1, res.r2, res.r3, res.r4, res.r5].map((num, i) => (
                        <div key={i} className="p-1 rounded bg-black/60 border border-white/10">
                          <p className="text-[9px] font-bold text-gray-500 uppercase">
                            {i + 1}°
                          </p>
                          <p className="text-xs font-mono font-bold text-neon-green">
                            {num}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
