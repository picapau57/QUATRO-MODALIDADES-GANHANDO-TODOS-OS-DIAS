import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Trash2, 
  HelpCircle, 
  Dices, 
  Search, 
  Star, 
  ChevronRight, 
  Sliders, 
  Filter, 
  Download, 
  Printer,
  Grid,
  Info
} from "lucide-react";
import { JogoGerado, Resultado } from "../types";
import { gerarTernosDeDezenas } from "../utils_generation";
import { motion, AnimatePresence } from "motion/react";

interface ModalidadeDezenasProps {
  results: Resultado[];
  savedGames: JogoGerado[];
  onSaveGames: (modalidade: 'ternos_dezenas', jogos: string[][], configs: any) => void;
  onExportPDF: (modalidade: string, jogos: string[][]) => void;
  onExportExcel: (modalidade: string, jogos: string[][]) => void;
  onPrint: (modalidade: string, jogos: string[][]) => void;
}

export default function ModalidadeDezenas({
  results,
  savedGames,
  onSaveGames,
  onExportPDF,
  onExportExcel,
  onPrint
}: ModalidadeDezenasProps) {
  // Generate a standard seed list of 60 tens (e.g. 05, 12, 17, 23, ...)
  const generateInitialBase = () => {
    const list: string[] = [];
    const seedVals = [
      2, 4, 7, 8, 10, 11, 13, 14, 16, 19, 21, 22, 24, 25, 27, 28, 30, 31, 33, 35,
      36, 38, 40, 41, 42, 44, 45, 47, 49, 50, 52, 53, 55, 56, 58, 60, 61, 62, 64, 65,
      67, 69, 70, 72, 73, 75, 77, 78, 80, 81, 83, 85, 87, 88, 90, 91, 93, 95, 97, 99
    ];
    return seedVals.map(v => v.toString().padStart(2, "0"));
  };

  const [qtyGames, setQtyGames] = useState<number>(50);
  const [baseTens, setBaseTens] = useState<string[]>(generateInitialBase());
  const [strategy, setStrategy] = useState<string>("mistura");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentGames, setCurrentGames] = useState<string[][]>([]);
  const [isFavoritedLocal, setIsFavoritedLocal] = useState<Record<string, boolean>>({});
  const [showBaseEditor, setShowBaseEditor] = useState<boolean>(false);

  useEffect(() => {
    handleGenerate();
  }, [baseTens]);

  const handleGenerate = () => {
    const generated = gerarTernosDeDezenas(
      qtyGames,
      baseTens,
      { estrategia: strategy },
      results
    );
    setCurrentGames(generated);
  };

  const handleToggleBaseTen = (ten: string) => {
    if (baseTens.includes(ten)) {
      if (baseTens.length <= 3) return; // Need at least 3 tens to generate
      setBaseTens(baseTens.filter(t => t !== ten));
    } else {
      if (baseTens.length >= 80) return; // Cap at 80 for statistical balance
      setBaseTens([...baseTens, ten].sort((a, b) => a.localeCompare(b)));
    }
  };

  const handleRandomizeBase = () => {
    const numbers = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, "0"));
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    setBaseTens(shuffled.slice(0, 60).sort((a, b) => a.localeCompare(b)));
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
      "ternos_dezenas",
      currentGames,
      {
        quantidadeJogos: qtyGames,
        filtros: [strategy],
        excluidos: [],
        fixados: [],
        estrategia: strategy,
        base60Dezenas: baseTens
      }
    );
  };

  const filteredGames = currentGames.filter(game => {
    if (!searchQuery) return true;
    return game.some(ten => ten.includes(searchQuery));
  });

  return (
    <div className="space-y-6">
      
      {/* Title Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 glass-effect">
        <div>
          <span className="text-[9px] font-black text-neon-purple uppercase tracking-widest bg-neon-purple/10 px-2.5 py-1 rounded-full italic">
            SEGUNDA MODALIDADE
          </span>
          <h2 className="text-xl md:text-2xl font-black uppercase text-white mt-3 italic tracking-tighter">
            Ternos de <span className="text-neon-purple">Dezenas</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">
            Gere combinações de 3 dezenas (00 a 99) extraídas de uma base exclusiva de 60 dezenas pré-selecionadas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-white bg-neon-purple hover:brightness-110 active:scale-95 rounded-lg transition-all btn-glow-purple"
            id="btn-generate-tens"
          >
            <Dices size={14} />
            Gerar 50 Jogos
          </button>
          <button
            onClick={handleSaveBatch}
            disabled={currentGames.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-gray-300 border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            id="btn-save-tens"
          >
            Salvar Lote
          </button>
          <button
            onClick={() => onExportPDF("Ternos de Dezenas", currentGames)}
            disabled={currentGames.length === 0}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            title="Exportar PDF"
            id="btn-pdf-tens"
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => onPrint("Ternos de Dezenas", currentGames)}
            disabled={currentGames.length === 0}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            title="Imprimir"
            id="btn-print-tens"
          >
            <Printer size={14} />
          </button>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Base Ten Editor Button */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-gray-300 uppercase tracking-wider italic">
                  Base de Dezenas Ativas
                </h4>
                <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">
                  Ativadas: <span className="text-neon-purple font-mono font-black">{baseTens.length}</span> dezenas.
                </p>
              </div>
              <button
                onClick={() => setShowBaseEditor(!showBaseEditor)}
                className="text-xs font-bold text-neon-purple hover:underline uppercase italic"
                id="btn-toggle-base-editor"
              >
                {showBaseEditor ? "Recolher" : "Personalizar"}
              </button>
            </div>

            <AnimatePresence>
              {showBaseEditor && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden pt-2.5 border-t border-white/10"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Clique nas dezenas para ativar/desativar:</span>
                    <button
                      onClick={handleRandomizeBase}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white font-black text-[9px] uppercase tracking-wider rounded"
                    >
                      Embaralhar 60
                    </button>
                  </div>

                  {/* Grid 100 numbers */}
                  <div className="grid grid-cols-10 gap-1 max-h-[220px] overflow-y-auto pr-1">
                    {Array.from({ length: 100 }, (_, idx) => {
                      const valueStr = idx.toString().padStart(2, "0");
                      const isActive = baseTens.includes(valueStr);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleToggleBaseTen(valueStr)}
                          className={`p-1 rounded text-[10px] font-mono font-bold border transition-colors ${
                            isActive 
                              ? "bg-neon-purple/20 border-neon-purple/40 text-neon-purple shadow-[0_0_8px_rgba(157,78,221,0.1)]" 
                              : "bg-black border-white/5 text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          {valueStr}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Configuration block */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2.5 italic">
              <Sliders size={13} className="text-neon-purple" />
              Parâmetros e Filtros
            </h3>

            {/* Slider Games */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold uppercase tracking-wider">
                <span className="text-gray-400">Quantidade de Jogos:</span>
                <span className="text-white font-mono">{qtyGames}</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={qtyGames}
                onChange={(e) => setQtyGames(Number(e.target.value))}
                className="w-full accent-neon-purple h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Filters selectors list */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">
                Filtro de Seleção Inteligente
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "mistura", label: "Mistura Inteligente (Padrão)" },
                  { id: "pares", label: "Somente Pares" },
                  { id: "impares", label: "Somente Ímpares" },
                  { id: "altas", label: "Altas (50-99)" },
                  { id: "baixas", label: "Baixas (00-49)" },
                  { id: "mais_sorteadas", label: "Mais Sorteadas (Estatística)" },
                  { id: "menos_sorteadas", label: "Menos Sorteadas" },
                  { id: "atrasadas", label: "Dezenas Atrasadas" },
                  { id: "quentes", label: "Dezenas Quentes" }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setStrategy(opt.id); }}
                    className={`p-2.5 rounded-lg border text-left text-[11px] font-bold uppercase tracking-wide transition-all ${
                      strategy === opt.id 
                        ? "bg-neon-purple/15 border-neon-purple/40 text-white shadow-[inset_0_0_10px_rgba(157,78,221,0.05)]" 
                        : "bg-black border-white/5 text-gray-400 hover:bg-gray-900 hover:text-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-[10px] text-gray-500 leading-relaxed flex items-start gap-2">
              <Info size={14} className="text-neon-purple flex-shrink-0 mt-0.5" />
              <span>O sistema garante que nenhum terno gerado seja repetido no mesmo lote de combinações, otimizando a cobertura estatística.</span>
            </div>
          </div>

        </div>

        {/* Right column: list (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Inner Search block */}
          <div className="p-3.5 bg-[#121212] border border-white/10 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                type="text"
                placeholder="Filtrar por dezena específica..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 focus:border-neon-purple/50 text-white text-xs pl-9 pr-4 py-2 rounded-lg outline-none transition-all"
              />
            </div>
            
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Mostrando <span className="text-neon-purple">{filteredGames.length}</span> / {currentGames.length} Jogos
            </div>
          </div>

          {/* List display */}
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
                    className="p-3 bg-[#121212]/80 hover:bg-[#121212] border border-white/10 hover:border-neon-purple/45 rounded-xl transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Game Counter index */}
                      <span className="w-5 h-5 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center font-mono text-[9px] text-gray-500 font-bold">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>

                      {/* Display Tens */}
                      <div className="flex items-center gap-1.5">
                        {game.map((ten) => (
                          <div 
                            key={ten} 
                            className="px-3.5 py-1.5 rounded-lg bg-[#050505] border border-white/10 text-center shadow-sm shadow-black/10 min-w-[42px]"
                          >
                            <span className="text-xs font-mono font-extrabold text-neon-purple leading-none">{ten}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick favorite action */}
                    <button
                      onClick={() => handleToggleFavLocal(gameKey)}
                      className={`p-1.5 rounded-md hover:bg-white/5 transition-colors ${
                        isFav ? "text-neon-purple" : "text-gray-500 hover:text-gray-300"
                      }`}
                      id={`btn-fav-tens-${gameKey}`}
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
