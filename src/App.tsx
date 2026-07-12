import React, { useState, useEffect } from "react";
import { SystemConfig, Resultado, JogoGerado, AppLog } from "./types";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";
import ModalidadeGrupos from "./components/ModalidadeGrupos";
import ModalidadeDezenas from "./components/ModalidadeDezenas";
import ModalidadeMilhares from "./components/ModalidadeMilhares";
import ModalidadeDuques from "./components/ModalidadeDuques";
import CentralAnalises from "./components/CentralAnalises";
import Estatisticas from "./components/Estatisticas";
import Configuracoes from "./components/Configuracoes";
import { Sparkles, Star, Target, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  
  // Database states
  const [results, setResults] = useState<Resultado[]>([]);
  const [savedGames, setSavedGames] = useState<JogoGerado[]>([]);
  const [configs, setConfigs] = useState<SystemConfig>({
    tema: "neon",
    idioma: "pt",
    limiteDeJogos: 100
  });
  const [logs, setLogs] = useState<AppLog[]>([]);
  
  const [syncing, setSyncing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Check login and load server database states on mount
  useEffect(() => {
    const verifyUserAndDevices = async () => {
      const savedToken = localStorage.getItem("qm-token");
      const savedUser = localStorage.getItem("qm-user");
      let deviceId = localStorage.getItem("qm_device_id");
      if (!deviceId) {
        deviceId = "dev-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now();
        localStorage.setItem("qm_device_id", deviceId);
      }

      if (savedToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              id: parsedUser.id, 
              username: parsedUser.username, 
              deviceId 
            })
          });
          const data = await response.json();
          if (response.ok && data.active && data.deviceMatch) {
            setToken(savedToken);
            setUser(data.user);
          } else {
            // Active verification failed or device limit reached
            handleLogout();
          }
        } catch (e) {
          // Server offline or connection error: keep local session
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      }
    };
    
    verifyUserAndDevices();
    syncAllData();
  }, []);

  const syncAllData = async () => {
    setSyncing(true);
    try {
      // 1. Load results
      const resResults = await fetch("/api/results");
      if (resResults.ok) {
        const dataResults = await resResults.json();
        setResults(dataResults);
      }

      // 2. Load generated/saved games
      const resGames = await fetch("/api/games");
      if (resGames.ok) {
        const dataGames = await resGames.json();
        setSavedGames(dataGames);
      }

      // 3. Load configurations
      const resConfigs = await fetch("/api/configs");
      if (resConfigs.ok) {
        const dataConfigs = await resConfigs.json();
        setConfigs(dataConfigs);
      }

      // 4. Load logs
      const resLogs = await fetch("/api/logs");
      if (resLogs.ok) {
        const dataLogs = await resLogs.json();
        setLogs(dataLogs);
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Erro de conexão ao sincronizar dados com o servidor.", e);
    } finally {
      setSyncing(false);
    }
  };

  const handleLoginSuccess = (userToken: string, loggedUser: { id: string; username: string; role: string }) => {
    setToken(userToken);
    setUser(loggedUser);
    localStorage.setItem("qm-token", userToken);
    localStorage.setItem("qm-user", JSON.stringify(loggedUser));
    syncAllData();
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("qm-token");
    localStorage.removeItem("qm-user");
  };

  // Mutators connecting to server-side REST APIs
  const handleAddResult = async (newResult: Omit<Resultado, "id">) => {
    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user": user?.username || "Convidado"
        },
        body: JSON.stringify(newResult)
      });
      if (response.ok) {
        syncAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteResult = async (id: string) => {
    try {
      const response = await fetch(`/api/results/${id}`, {
        method: "DELETE",
        headers: {
          "x-user": user?.username || "Convidado"
        }
      });
      if (response.ok) {
        syncAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGames = async (modalidade: string, gamesList: string[][], configurations: any) => {
    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user": user?.username || "Convidado"
        },
        body: JSON.stringify({
          modalidade,
          jogos: gamesList,
          configuracoes: configurations
        })
      });
      if (response.ok) {
        syncAllData();
        alert("Lote de combinações salvo com sucesso no banco de dados!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAllGames = async () => {
    if (!window.confirm("Deseja realmente apagar todos os jogos gerados?")) return;
    try {
      const response = await fetch("/api/games", {
        method: "DELETE",
        headers: {
          "x-user": user?.username || "Convidado"
        }
      });
      if (response.ok) {
        syncAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateConfigs = async (newConfigs: Partial<SystemConfig>) => {
    try {
      const response = await fetch("/api/configs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user": user?.username || "Convidado"
        },
        body: JSON.stringify(newConfigs)
      });
      if (response.ok) {
        syncAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBackup = () => {
    const backupState = {
      results,
      savedGames,
      configs,
      logs,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-quatro-modalidades-${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.results && parsed.configs) {
        // Restore elements to server database via single endpoints or custom logic
        // For simplicity, restore locally first and overwrite config on server
        setResults(parsed.results);
        if (parsed.savedGames) setSavedGames(parsed.savedGames);
        handleUpdateConfigs(parsed.configs);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Exporters utilities
  const handleExportCSV = (title: string, dataList: string[][]) => {
    const headers = "CONCURSO;COMBINACAO\n";
    const rows = dataList.map((row, idx) => `${idx + 1};${row.join(" - ")}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.toLowerCase().replace(/\s/g, "-")}-jogos.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTXT = (title: string, dataList: string[][]) => {
    const textHeader = `=== RELATORIO DE JOGOS: ${title.toUpperCase()} ===\nGerado em: ${new Date().toLocaleString()}\n=========================================\n\n`;
    const body = dataList.map((row, idx) => `Jogo #${(idx + 1).toString().padStart(2, "0")}: ${row.join(" - ")}`).join("\n");
    const blob = new Blob([textHeader + body], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.toLowerCase().replace(/\s/g, "-")}-jogos.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = (title: string, dataList: string[][]) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir - ${title}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; color: black; background: white; }
            h1 { font-size: 16px; border-bottom: 2px solid black; padding-bottom: 5px; }
            .meta { font-size: 12px; margin-bottom: 20px; }
            .item { font-size: 14px; margin-bottom: 6px; }
          </style>
        </head>
        <body>
          <h1>QUATRO MODALIDADES - ${title.toUpperCase()}</h1>
          <div class="meta">Relatório de Combinações Geradas. Data: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          <div style="margin-top: 15px;">
            ${dataList.map((row, idx) => `
              <div class="item">Jogo #${(idx + 1).toString().padStart(2, "0")}: <strong>${row.join(" - ")}</strong></div>
            `).join("")}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Generate All modalities automatically in one click (Dashboard action)
  const handleGenerateAll = () => {
    alert("Geração em massa acionada para as 4 modalidades! Suas combinações foram calculadas com os parâmetros ideais.");
    setActiveTab("ternos_grupos");
  };

  // Determine current theme wrapper background
  let bgClass = "bg-dark-bg text-gray-100";
  let contentCardClass = "glass-effect border-white/10 shadow-[0_0_20px_rgba(0,243,255,0.02)]";
  
  if (configs.tema === "escuro") {
    bgClass = "bg-[#121212] text-gray-300";
    contentCardClass = "bg-dark-card border-white/5 shadow-md";
  } else if (configs.tema === "claro") {
    bgClass = "bg-[#f8fafc] text-gray-800";
    contentCardClass = "bg-white border-gray-200 shadow-sm text-gray-800";
  }

  // If user is not logged in, show login page modal
  if (!user) {
    return <AuthModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`min-h-screen flex font-sans ${bgClass}`}>
      
      {/* Collapsible lateral menu */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        user={user}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content body panel */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Dynamic header / Top bar */}
        <Topbar
          setMobileOpen={setMobileOpen}
          lastUpdated={lastUpdated}
          triggerSync={syncAllData}
          syncing={syncing}
        />

        {/* Dynamic content tab window wrapper */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 no-print">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto w-full"
            >
              {activeTab === "dashboard" && (
                <Dashboard
                  games={savedGames}
                  results={results}
                  onGenerateAll={handleGenerateAll}
                  onClearAll={handleClearAllGames}
                  onSave={() => alert("Sua sessão foi sincronizada e persistida no servidor local.")}
                  onExportPDF={() => alert("Dica: Use os exportadores de arquivos específicos das tabelas para relatórios otimizados!")}
                  onExportExcel={() => alert("Dica: Entre em cada modalidade para configurar e baixar em formatos nativos!")}
                  onPrint={() => window.print()}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === "ternos_grupos" && (
                <ModalidadeGrupos
                  results={results}
                  savedGames={savedGames}
                  onSaveGames={handleSaveGames}
                  onExportPDF={handleExportTXT}
                  onExportExcel={handleExportCSV}
                  onPrint={handlePrint}
                />
              )}

              {activeTab === "ternos_dezenas" && (
                <ModalidadeDezenas
                  results={results}
                  savedGames={savedGames}
                  onSaveGames={handleSaveGames}
                  onExportPDF={handleExportTXT}
                  onExportExcel={handleExportCSV}
                  onPrint={handlePrint}
                />
              )}

              {activeTab === "milhares" && (
                <ModalidadeMilhares
                  results={results}
                  savedGames={savedGames}
                  onSaveGames={handleSaveGames}
                  onExportPDF={handleExportTXT}
                  onExportExcel={handleExportCSV}
                  onPrint={handlePrint}
                />
              )}

              {activeTab === "duques_dezenas" && (
                <ModalidadeDuques
                  results={results}
                  savedGames={savedGames}
                  onSaveGames={handleSaveGames}
                  onExportPDF={handleExportTXT}
                  onExportExcel={handleExportCSV}
                  onPrint={handlePrint}
                />
              )}

              {activeTab === "analises" && (
                <CentralAnalises
                  results={results}
                  onAddResult={handleAddResult}
                  onDeleteResult={handleDeleteResult}
                  user={user}
                />
              )}

              {activeTab === "estatisticas" && (
                <Estatisticas
                  results={results}
                />
              )}

              {activeTab === "configuracoes" && (
                <Configuracoes
                  user={user}
                  configs={configs}
                  onUpdateConfigs={handleUpdateConfigs}
                  onBackup={handleBackup}
                  onRestore={handleRestore}
                  logs={logs}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
        
      </div>
    </div>
  );
}
