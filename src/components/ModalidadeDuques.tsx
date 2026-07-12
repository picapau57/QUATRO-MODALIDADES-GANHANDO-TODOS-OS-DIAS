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
  Info
} from "lucide-react";
import { JogoGerado, Resultado } from "../types";
import { gerarDuquesDeDezenas } from "../utils_generation";
import { motion } from "motion/react";

interface ModalidadeDuquesProps {
  results: Resultado[];
  savedGames: JogoGerado[];
  onSaveGames: (modalidade: 'duques_dezenas', jogos: string[][], configs: any) => void;
  onExportPDF: (modalidade: string, jogos: string[][]) => void;
  onExportExcel: (modalidade: string, jogos: string[][]) => void;
  onPrint: (modalidade: string, jogos: string[][]) => void;
}

export default function ModalidadeDuques({
  results,
  savedGames,
  onSaveGames,
  onExportPDF,
  onExportExcel,
  onPrint
}: ModalidadeDuquesProps) {
  // Generate default list of 60 tens for Duques
  const generateInitialBase = () => {
    const list: string[] = [];
    const seedVals = [
      1, 3, 5, 6, 9, 12, 15, 17, 18, 20, 22, 23, 26, 29, 30, 32, 34, 37, 39, 41,
      43, 44, 46, 48, 50, 51, 54, 57, 59, 61, 63, 66, 68, 70, 71, 74, 76, 78, 79, 81,
      82, 84, 86, 88, 89, 91, 92, 94, 95, 96, 97, 98, 99, 0, 2, 4, 7, 8, 10, 11
    ];
    return seedVals.map(v => v.toString().padStart(2, "0"));
  };

  const [qtyGames, setQtyGames] = useState<number>(40);
  const [baseTens, setBaseTens] = useState<string[]>(generateInitialBase());
  const [strategy, setStrategy] = useState<string>("balanceadas");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [currentGames, setCurrentGames] = useState<string[][]>([]);
  const [isFavoritedLocal, setIsFavoritedLocal] = useState<Record<string, boolean>>({});

  useEffect(() => {
    handleGenerate();
  }, [baseTens]);

  const handleGenerate = () => {
    const generated = gerarDuquesDeDezenas(
      qtyGames,
      baseTens,
      { estrategia: strategy },
      results
    );
    setCurrentGames(generated);
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
      "duques_dezenas",
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
          <span className="text-[9px] font-black text-neon-green uppercase tracking-widest bg-neon-green/10 px-2.5 py-1 rounded-full italic">
            QUARTA MODALIDADE
          </span>
          <h2 className="text-xl md:text-2xl font-black uppercase text-white mt-3 italic tracking-tighter">
            Duques de <span className="text-neon-green">Dezenas</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">
            Gere combinações de 2 dezenas (00 a 99) com base em filtros avançados e ocorrências recentes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-black bg-neon-green hover:brightness-110 active:scale-95 rounded-lg transition-all btn-glow-green"
            id="btn-generate-duques"
          >
            <Dices size={14} />
            Gerar 40 Duques
          </button>
          <button
            onClick={handleSaveBatch}
            disabled={currentGames.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-[10px] font-black uppercase italic tracking-wider text-gray-300 border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            id="btn-save-duques"
          >
            Salvar Lote
          </button>
          <button
            onClick={() => onExportPDF("Duques de Dezenas", currentGames)}
            disabled={currentGames.length === 0}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            title="Exportar PDF"
            id="btn-pdf-duques"
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => onPrint("Duques de Dezenas", currentGames)}
            disabled={currentGames.length === 0}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            title="Imprimir"
            id="btn-print-duques"
          >
            <Printer size={14} />
          </button>
        </div>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left col (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Config card */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2.5 italic">
              <Sliders size={13} className="text-neon-green" />
              Parâmetros e Filtros
            </h3>

            {/* Slider quantity */}
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
                className="w-full accent-neon-green h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Filters grid */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">
                Estratégia dos Duques
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "balanceadas", label: "Combinações Balanceadas" },
                  { id: "mais_frequentes", label: "Mais Frequentes" },
                  { id: "menos_frequentes", label: "Menos Frequentes" },
                  { id: "atrasadas", label: "Mais Atrasadas" },
                  { id: "recentes", label: "Recorrentes e Recentes" },
                  { id: "pares", label: "Pares do Tabuleiro" },
                  { id: "impares", label: "Ímpares do Tabuleiro" },
                  { id: "sequenciais", label: "Dezenas Sequenciais" },
                  { id: "aleatorias", label: "Totalmente Aleatórias" }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setStrategy(opt.id); }}
                    className={`p-2.5 rounded-lg border text-left text-[11px] font-bold uppercase tracking-wide transition-all ${
                      strategy === opt.id 
                        ? "bg-neon-green/15 border-neon-green/40 text-white shadow-[inset_0_0_10px_rgba(57,255,20,0.05)]" 
                        : "bg-black border-white/5 text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-[10px] text-gray-500 leading-relaxed flex items-start gap-2">
              <Info size={14} className="text-neon-green flex-shrink-0 mt-0.5" />
              <span>Ao gerar duques, o algoritmo evita a repetição de duplas idênticas no mesmo lote gerado, maximizando a variedade combinatória.</span>
            </div>
          </div>

        </div>

        {/* Right col: display list (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search bar */}
          <div className="p-3.5 bg-[#121212] border border-white/10 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                type="text"
                placeholder="Filtrar por dezena contida no duque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 focus:border-neon-green/50 text-white text-xs pl-9 pr-4 py-2 rounded-lg outline-none transition-all"
              />
            </div>
            
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Mostrando <span className="text-neon-green">{filteredGames.length}</span> / {currentGames.length} Jogos
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
                    className="p-3 bg-[#121212]/80 hover:bg-[#121212] border border-white/10 hover:border-neon-green/45 rounded-xl transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Counter */}
                      <span className="w-5 h-5 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center font-mono text-[9px] text-gray-500 font-bold">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>

                      {/* Display 2 Tens */}
                      <div className="flex items-center gap-1.5">
                        {game.map((ten) => (
                          <div 
                            key={ten} 
                            className="px-4 py-1.5 rounded-lg bg-[#050505] border border-white/10 text-center shadow-sm shadow-black/10 min-w-[45px]"
                          >
                            <span className="text-xs font-mono font-extrabold text-neon-green leading-none">{ten}</span>
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
                      id={`btn-fav-duques-${gameKey}`}
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
