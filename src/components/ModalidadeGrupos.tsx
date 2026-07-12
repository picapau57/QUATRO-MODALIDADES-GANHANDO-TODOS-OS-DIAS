import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Trash2, 
  HelpCircle, 
  Dices, 
  Search, 
  Star, 
  ChevronRight, 
  Settings2, 
  Sliders, 
  Filter, 
  Download, 
  Printer,
  Grid
} from "lucide-react";
import { JogoGerado, Resultado } from "../types";
import { gerarTernosDeGrupos } from "../utils_generation";
import { GRUPOS_BICHO } from "../bicho_rules";
import { motion, AnimatePresence } from "motion/react";

interface ModalidadeGruposProps {
  results: Resultado[];
  savedGames: JogoGerado[];
  onSaveGames: (modalidade: 'ternos_grupos', jogos: string[][], configs: any) => void;
  onExportPDF: (modalidade: string, jogos: string[][]) => void;
  onExportExcel: (modalidade: string, jogos: string[][]) => void;
  onPrint: (modalidade: string, jogos: string[][]) => void;
}

export default function ModalidadeGrupos({
  results,
  savedGames,
  onSaveGames,
  onExportPDF,
  onExportExcel,
  onPrint
}: ModalidadeGruposProps) {
  // Config states
  const [qtyGames, setQtyGames] = useState<number>(40);
  const [qtyElements, setQtyElements] = useState<number>(3);
  const [strategy, setStrategy] = useState<string>("balanced");
  const [excludedGroups, setExcludedGroups] = useState<number[]>([]);
  const [fixedGroups, setFixedGroups] = useState<number[]>([]);
  const [favGroups, setFavGroups] = useState<number[]>([]);
  const [mixGroups, setMixGroups] = useState<boolean>(true);
  const [autoOrder, setAutoOrder] = useState<boolean>(true);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Generated state
  const [currentGames, setCurrentGames] = useState<string[][]>([]);
  const [isFavoritedLocal, setIsFavoritedLocal] = useState<Record<string, boolean>>({});

  // On mount, generate a default batch of games
  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = () => {
    const generated = gerarTernosDeGrupos(
      qtyGames,
      qtyElements,
      {
        excluidos: excludedGroups,
        fixados: fixedGroups,
        favoritos: favGroups,
        estrategia: strategy,
        misturar: mixGroups,
        ordenar: autoOrder
      },
      results
    );
    setCurrentGames(generated);
  };

  const handleToggleExclude = (num: number) => {
    if (excludedGroups.includes(num)) {
      setExcludedGroups(excludedGroups.filter(g => g !== num));
    } else {
      setExcludedGroups([...excludedGroups.filter(g => g !== num), num]);
      setFixedGroups(fixedGroups.filter(g => g !== num)); // cannot be excluded and fixed
    }
  };

  const handleToggleFixed = (num: number) => {
    if (fixedGroups.includes(num)) {
      setFixedGroups(fixedGroups.filter(g => g !== num));
    } else {
      if (fixedGroups.length >= qtyElements) return; // cannot fix more than game size
      setFixedGroups([...fixedGroups, num]);
      setExcludedGroups(excludedGroups.filter(g => g !== num)); // cannot be fixed and excluded
    }
  };

  const handleToggleFavLocal = (gameKey: string) => {
    setIsFavoritedLocal(prev => ({
      ...prev,
      [gameKey]: !prev[gameKey]
    }));
  };

  const handleSaveBatch = () => {
    if (currentGames.length === 0) return;
    onSaveGames(
      "ternos_grupos",
      currentGames,
      {
        quantidadeJogos: qtyGames,
        quantidadeElementos: qtyElements,
        filtros: [strategy],
        excluidos: excludedGroups.map(String),
        fixados: fixedGroups.map(String),
        estrategia: strategy
      }
    );
  };

  // Filter generated games by search query
  const filteredGames = currentGames.filter(game => {
    if (!searchQuery) return true;
    return game.some(groupNum => {
      const gNum = parseInt(groupNum, 10);
      const bicho = GRUPOS_BICHO.find(g => g.numero === gNum);
      return (
        groupNum.includes(searchQuery) ||
        bicho?.nome.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  });

  return (
    <div className="space-y-6">
      
      {/* Title Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 glass-effect">
        <div>
          <span className="text-[9px] font-black text-neon-blue uppercase tracking-widest bg-neon-blue/10 px-2.5 py-1 rounded-full italic">
            PRIMEIRA MODALIDADE
          </span>
          <h2 className="text-xl md:text-2xl font-black uppercase text-white mt-3 italic tracking-tighter">
            Ternos de <span className="text-neon-blue">Grupos</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">
            Gere combinações de 3 grupos distintos (01 a 25) baseadas em estratégias estatísticas inteligentes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-black bg-neon-blue hover:brightness-110 active:scale-95 rounded-lg transition-all btn-glow-blue"
            id="btn-generate-groups"
          >
            <Dices size={14} />
            Gerar Jogos
          </button>
          <button
            onClick={handleSaveBatch}
            disabled={currentGames.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-gray-300 border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            id="btn-save-groups"
          >
            Salvar Lote
          </button>
          <button
            onClick={() => onExportPDF("Ternos de Grupos", currentGames)}
            disabled={currentGames.length === 0}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            title="Exportar PDF"
            id="btn-pdf-groups"
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => onPrint("Ternos de Grupos", currentGames)}
            disabled={currentGames.length === 0}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            title="Imprimir"
            id="btn-print-groups"
          >
            <Printer size={14} />
          </button>
        </div>
      </div>

      {/* Settings Panel & Generation View split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Setup configurations (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Config Card 1: Quantities & Strategies */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2.5 italic">
              <Sliders size={13} className="text-neon-blue" />
              Parâmetros de Geração
            </h3>

            {/* Slider: Total Games */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold uppercase tracking-wide">
                <span className="text-gray-400">Quantidade de Jogos:</span>
                <span className="text-white font-mono">{qtyGames}</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={qtyGames}
                onChange={(e) => setQtyGames(Number(e.target.value))}
                className="w-full accent-neon-blue h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider: Elements per Game */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold uppercase tracking-wide">
                <span className="text-gray-400">Grupos por Jogo:</span>
                <span className="text-white font-mono">{qtyElements}</span>
              </div>
              <input
                type="range"
                min="3"
                max="5"
                value={qtyElements}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setQtyElements(val);
                  setFixedGroups(fixedGroups.slice(0, val)); // adjust fixed count
                }}
                className="w-full accent-neon-blue h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Strategy selector */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 italic">
                Estratégia Matemática
              </label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 focus:border-neon-blue/50 text-white text-xs p-2.5 rounded-lg outline-none"
              >
                <option value="balanced">Combinação Balanceada (Padrão)</option>
                <option value="random">Aleatório Inteligente</option>
                <option value="delayed">Foco em Grupos Atrasados</option>
                <option value="hot">Foco em Grupos Quentes (Mais Frequentes)</option>
                <option value="cold">Foco em Grupos Frios (Menos Frequentes)</option>
                <option value="high_freq">Maior Frequência Acumulada</option>
                <option value="low_freq">Menor Frequência Acumulada</option>
              </select>
            </div>

            {/* Checkbox triggers */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <label className="flex items-center gap-2 text-xs text-gray-300 font-bold uppercase tracking-wider cursor-pointer">
                <input
                  type="checkbox"
                  checked={mixGroups}
                  onChange={(e) => setMixGroups(e.target.checked)}
                  className="rounded border-white/10 text-neon-blue focus:ring-0 focus:ring-offset-0 bg-black w-4 h-4"
                />
                Misturar grupos
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-300 font-bold uppercase tracking-wider cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoOrder}
                  onChange={(e) => setAutoOrder(e.target.checked)}
                  className="rounded border-white/10 text-neon-blue focus:ring-0 focus:ring-offset-0 bg-black w-4 h-4"
                />
                Ordenar auto
              </label>
            </div>
          </div>

          {/* Config Card 2: Interactive Group Filters (Excluir/Fixar) */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5 italic">
                <Filter size={13} className="text-neon-green" />
                Filtros e Preferências (01-25)
              </h3>
              <button 
                onClick={() => { setExcludedGroups([]); setFixedGroups([]); }}
                className="text-[9px] font-black uppercase tracking-wider text-gray-500 hover:text-white transition-colors"
              >
                Limpar Filtros
              </button>
            </div>

            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">
              Clique simples para <span className="text-red-400">Excluir</span>. Clique duplo para <span className="text-neon-green">Fixar</span>.
            </p>

            {/* Grid selector 25 groups */}
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 25 }, (_, idx) => {
                const num = idx + 1;
                const formattedNum = num.toString().padStart(2, "0");
                const bicho = GRUPOS_BICHO.find(g => g.numero === num);
                
                const isExcluded = excludedGroups.includes(num);
                const isFixed = fixedGroups.includes(num);

                let bgClass = "bg-black border-white/5 text-gray-400 hover:bg-gray-900";
                if (isExcluded) bgClass = "bg-red-500/10 border-red-500/40 text-red-400 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]";
                if (isFixed) bgClass = "bg-neon-green/10 border-neon-green/40 text-neon-green shadow-[inset_0_0_10px_rgba(57,255,20,0.1)]";

                return (
                  <button
                    key={num}
                    onClick={() => handleToggleExclude(num)}
                    onDoubleClick={() => handleToggleFixed(num)}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${bgClass}`}
                    title={`${formattedNum} - ${bicho?.nome || ""}`}
                  >
                    <span className="font-mono text-xs font-bold">{formattedNum}</span>
                    <span className="text-[8px] truncate max-w-full text-gray-500 uppercase leading-none mt-0.5">{bicho?.nome}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 text-[10px] text-gray-400 pt-1 font-bold uppercase tracking-wide">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-red-500/20 border border-red-500/40" />
                Excluído ({excludedGroups.length})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-neon-green/20 border border-neon-green/40" />
                Fixado ({fixedGroups.length}/{qtyElements})
              </span>
            </div>
          </div>

        </div>

        {/* Right Col: Combinations list and Searcher (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search bar inside modality */}
          <div className="p-3.5 bg-[#121212] border border-white/10 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                type="text"
                placeholder="Filtrar por grupo ou nome de animal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 focus:border-neon-blue/50 text-white text-xs pl-9 pr-4 py-2 rounded-lg outline-none transition-all"
              />
            </div>
            
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Mostrando <span className="text-neon-blue">{filteredGames.length}</span> / {currentGames.length} Jogos
            </div>
          </div>

          {/* Games list viewport */}
          {filteredGames.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-[#121212]/30 text-xs text-gray-500">
              Nenhuma combinação corresponde aos filtros informados.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredGames.map((game, index) => {
                const gameKey = game.join("-");
                const isFav = isFavoritedLocal[gameKey] || false;

                return (
                  <div 
                    key={index}
                    className="p-3 bg-[#121212]/80 hover:bg-[#121212] border border-white/10 hover:border-neon-blue/45 rounded-xl transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Game Counter index */}
                      <span className="w-5 h-5 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center font-mono text-[9px] text-gray-500 font-bold">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>

                      {/* Display Groups */}
                      <div className="flex items-center gap-1.5">
                        {game.map((gNumStr) => {
                          const num = parseInt(gNumStr, 10);
                          const bicho = GRUPOS_BICHO.find(g => g.numero === num);
                          return (
                            <div 
                              key={gNumStr} 
                              className="px-2.5 py-1.5 rounded-lg bg-[#050505] border border-white/10 flex flex-col items-center min-w-[50px] shadow-sm shadow-black/10"
                            >
                              <span className="text-xs font-mono font-extrabold text-neon-blue leading-none">{gNumStr}</span>
                              <span className="text-[8px] font-bold text-gray-500 truncate leading-none mt-1 uppercase tracking-wide">
                                {bicho?.nome.substring(0, 5)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick favorite action */}
                    <button
                      onClick={() => handleToggleFavLocal(gameKey)}
                      className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${
                        isFav ? "text-neon-purple" : "text-gray-500 hover:text-gray-300"
                      }`}
                      id={`btn-fav-${gameKey}`}
                    >
                      <Star size={14} fill={isFav ? "currentColor" : "none"} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
