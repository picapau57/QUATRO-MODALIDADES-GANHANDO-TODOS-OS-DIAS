import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Trash2, 
  Dices, 
  Search, 
  Star, 
  Sliders, 
  Filter, 
  Download, 
  Printer,
  Info,
  Layers
} from "lucide-react";
import { JogoGerado, Resultado } from "../types";
import { gerarMilhares } from "../utils_generation";
import { GRUPOS_BICHO } from "../bicho_rules";
import { motion } from "motion/react";

interface ModalidadeMilharesProps {
  results: Resultado[];
  savedGames: JogoGerado[];
  onSaveGames: (modalidade: 'milhares', jogos: string[][], configs: any) => void;
  onExportPDF: (modalidade: string, jogos: string[][]) => void;
  onExportExcel: (modalidade: string, jogos: string[][]) => void;
  onPrint: (modalidade: string, jogos: string[][]) => void;
}

export default function ModalidadeMilhares({
  results,
  savedGames,
  onSaveGames,
  onExportPDF,
  onExportExcel,
  onPrint
}: ModalidadeMilharesProps) {
  const [qtyGames, setQtyGames] = useState<number>(40);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [excludedGroups, setExcludedGroups] = useState<number[]>([]);
  const [fixedPrefix, setFixedPrefix] = useState<string>("");
  const [isSmartMode, setIsSmartMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [currentGames, setCurrentGames] = useState<string[][]>([]);
  const [isFavoritedLocal, setIsFavoritedLocal] = useState<Record<string, boolean>>({});

  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = () => {
    const generated = gerarMilhares(
      qtyGames,
      {
        gruposReferencia: selectedGroups,
        excluidos: excludedGroups,
        fixados: fixedPrefix ? [fixedPrefix] : [],
        misturar: true,
        inteligente: isSmartMode
      },
      results
    );
    setCurrentGames(generated);
  };

  const handleToggleGroupSelect = (num: number) => {
    if (selectedGroups.includes(num)) {
      setSelectedGroups(selectedGroups.filter(g => g !== num));
    } else {
      setSelectedGroups([...selectedGroups, num]);
      setExcludedGroups(excludedGroups.filter(g => g !== num)); // remove from excluded if selected
    }
  };

  const handleToggleGroupExclude = (num: number) => {
    if (excludedGroups.includes(num)) {
      setExcludedGroups(excludedGroups.filter(g => g !== num));
    } else {
      setExcludedGroups([...excludedGroups, num]);
      setSelectedGroups(selectedGroups.filter(g => g !== num)); // remove from selected if excluded
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
      "milhares",
      currentGames,
      {
        quantidadeJogos: qtyGames,
        filtros: [isSmartMode ? "milhares_inteligentes" : "aleatorio"],
        excluidos: excludedGroups.map(String),
        fixados: fixedPrefix ? [fixedPrefix] : [],
        estrategia: "milhares_referencia",
        gruposReferencia: selectedGroups
      }
    );
  };

  // Filter thousands by search query
  const filteredGames = currentGames.filter(game => {
    if (!searchQuery) return true;
    const milhar = game[0]; // Milhar contains a single 4-digit string
    return milhar.includes(searchQuery);
  });

  return (
    <div className="space-y-6">
      
      {/* Title Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 glass-effect">
        <div>
          <span className="text-[9px] font-black text-neon-orange uppercase tracking-widest bg-neon-orange/10 px-2.5 py-1 rounded-full italic">
            TERCEIRA MODALIDADE
          </span>
          <h2 className="text-xl md:text-2xl font-black uppercase text-white mt-3 italic tracking-tighter">
            Milhares <span className="text-neon-orange">Inteligentes</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">
            Gere milhares de 4 dígitos integrados perfeitamente com os grupos tradicionais do Jogo do Bicho.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-black bg-neon-orange hover:brightness-110 active:scale-95 rounded-lg transition-all btn-glow-orange"
            id="btn-generate-milhares"
          >
            <Dices size={14} />
            Gerar 40 Milhares
          </button>
          <button
            onClick={handleSaveBatch}
            disabled={currentGames.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-gray-300 border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            id="btn-save-milhares"
          >
            Salvar Lote
          </button>
          <button
            onClick={() => onExportPDF("Milhares", currentGames)}
            disabled={currentGames.length === 0}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            title="Exportar PDF"
            id="btn-pdf-milhares"
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => onPrint("Milhares", currentGames)}
            disabled={currentGames.length === 0}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            title="Imprimir"
            id="btn-print-milhares"
          >
            <Printer size={14} />
          </button>
        </div>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left col (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Config Block */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2.5 italic">
              <Sliders size={13} className="text-neon-orange" />
              Parâmetros dos Milhares
            </h3>

            {/* Slider Quantity */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold uppercase tracking-wider">
                <span className="text-gray-400">Quantidade de milhares:</span>
                <span className="text-white font-mono">{qtyGames}</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={qtyGames}
                onChange={(e) => setQtyGames(Number(e.target.value))}
                className="w-full accent-neon-orange h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Prefix selector */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 italic">
                Fixar Prefixo (Primeiros 2 dígitos)
              </label>
              <input
                type="text"
                maxLength={2}
                placeholder="Ex: 19 (Opcional)"
                value={fixedPrefix}
                onChange={(e) => setFixedPrefix(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-[#050505] border border-white/10 focus:border-neon-orange/50 text-white font-mono text-xs p-2.5 rounded-lg outline-none transition-all"
              />
              <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">
                Se definido, todos começam com {fixedPrefix || "XX"} (Ex: {fixedPrefix || "XX"}YY).
              </p>
            </div>

            {/* Switch Milhares Inteligentes */}
            <label className="flex items-center gap-2 text-xs text-gray-300 font-bold uppercase tracking-wider cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isSmartMode}
                onChange={(e) => setIsSmartMode(e.target.checked)}
                className="rounded border-white/10 text-neon-orange focus:ring-0 focus:ring-offset-0 bg-black w-4 h-4"
              />
              Milhares Inteligentes (Balanceado)
            </label>
          </div>

          {/* Reference Groups Selector */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5 italic">
                <Layers size={13} className="text-neon-orange" />
                Grupos de Referência (Terminações)
              </h3>
              <button 
                onClick={() => { setSelectedGroups([]); setExcludedGroups([]); }}
                className="text-[9px] font-black uppercase tracking-wider text-gray-500 hover:text-white transition-colors"
              >
                Limpar Grupos
              </button>
            </div>

            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">
              Selecione os grupos cujas dezenas finais servirão para compor as terminações dos milhares.
            </p>

            {/* Interactive Grid of Groups */}
            <div className="grid grid-cols-5 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
              {GRUPOS_BICHO.map((g) => {
                const isSelected = selectedGroups.includes(g.numero);
                const isExcluded = excludedGroups.includes(g.numero);

                let btnClass = "bg-black border-white/5 text-gray-400 hover:bg-[#1a1a1a]";
                if (isSelected) btnClass = "bg-neon-orange/20 border-neon-orange/40 text-neon-orange shadow-[inset_0_0_10px_rgba(255,112,0,0.1)]";
                if (isExcluded) btnClass = "bg-red-500/10 border-red-500/40 text-red-400";

                return (
                  <button
                    key={g.numero}
                    onClick={() => handleToggleGroupSelect(g.numero)}
                    onContextMenu={(e) => { e.preventDefault(); handleToggleGroupExclude(g.numero); }}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${btnClass}`}
                    title={`${g.numero.toString().padStart(2, "0")} - ${g.nome}`}
                  >
                    <span className="font-mono text-xs font-bold">{g.numero.toString().padStart(2, "0")}</span>
                    <span className="text-[8px] truncate max-w-full text-gray-500 uppercase leading-none mt-0.5">{g.nome}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 text-[10px] text-gray-400 pt-1 border-t border-white/10 font-bold uppercase tracking-wide">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-neon-orange/20 border border-neon-orange/40" />
                Selecionado ({selectedGroups.length})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-red-500/20 border border-red-500/40" />
                Excluído ({excludedGroups.length})
              </span>
            </div>
          </div>

        </div>

        {/* Right col: Display list (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Inner Searcher */}
          <div className="p-3.5 bg-[#121212] border border-white/10 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                type="text"
                placeholder="Filtrar milhares gerados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 focus:border-neon-orange/50 text-white text-xs pl-9 pr-4 py-2 rounded-lg outline-none transition-all"
              />
            </div>
            
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Mostrando <span className="text-neon-orange">{filteredGames.length}</span> / {currentGames.length} Jogos
            </div>
          </div>

          {/* List display */}
          {filteredGames.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-[#121212]/30 text-xs text-gray-500">
              Nenhuma combinação corresponde aos filtros informados.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredGames.map((game, index) => {
                const milhar = game[0];
                const isFav = isFavoritedLocal[milhar] || false;

                // Find corresponding group for display
                const lastTwo = milhar.substring(2);
                const bicho = GRUPOS_BICHO.find(g => g.dezenas.includes(lastTwo));

                return (
                  <div 
                    key={index}
                    className="p-3.5 bg-[#121212]/80 hover:bg-[#121212] border border-white/10 hover:border-neon-orange/45 rounded-xl transition-all flex flex-col justify-between relative group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="w-5 h-5 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center font-mono text-[9px] text-gray-500 font-bold">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>

                      {/* Favorite button */}
                      <button
                        onClick={() => handleToggleFavLocal(milhar)}
                        className={`p-1 rounded hover:bg-white/5 transition-colors ${
                          isFav ? "text-neon-orange" : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        <Star size={12} fill={isFav ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {/* Milhar display with highlighted endings */}
                    <div className="text-center py-2 border-y border-white/5 my-1 bg-black/40 rounded-lg">
                      <span className="text-sm font-mono text-gray-400">{milhar.substring(0, 2)}</span>
                      <span className="text-lg font-mono font-extrabold text-neon-orange">{milhar.substring(2)}</span>
                    </div>

                    {/* Animal Label */}
                    <div className="text-[9px] text-center text-gray-500 uppercase font-black tracking-wider truncate mt-1">
                      {bicho ? `${bicho.numero} - ${bicho.nome}` : "Outro"}
                    </div>
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
