import React, { useState, useEffect } from "react";
import { Menu, Wifi, WifiOff, RefreshCw, Calendar, Clock } from "lucide-react";

interface TopbarProps {
  setMobileOpen: (open: boolean) => void;
  lastUpdated: string;
  triggerSync: () => void;
  syncing: boolean;
}

export default function Topbar({
  setMobileOpen,
  lastUpdated,
  triggerSync,
  syncing
}: TopbarProps) {
  const [time, setTime] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    // Tick clock every second
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Online status event listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <header className="bg-[#0a0a0a] border-b border-gray-800 px-4 md:px-6 h-16 flex flex-col justify-center z-20 sticky top-0" id="app-topbar">
      <div className="flex items-center justify-between font-sans">
        {/* Left section: mobile menu and title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            id="btn-mobile-menu"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-[11px] md:text-sm font-black uppercase tracking-[0.15em] italic text-white leading-none">
              QUATRO MODALIDADES <span className="text-neon-green">GANHANDO TODOS OS DIAS</span>
            </h1>
            <p className="text-[9px] md:text-[10px] font-bold text-neon-blue tracking-widest uppercase leading-none mt-1.5">
              Análise Estatística Avançada
            </p>
          </div>
        </div>

        {/* Right section: System stats bar */}
        <div className="flex items-center gap-2 md:gap-4 text-gray-400">
          
          {/* Data Atual */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs">
            <Calendar size={13} className="text-neon-blue" />
            <span className="text-gray-300 font-mono text-[11px]">
              {formatDate(time)}
            </span>
          </div>

          {/* Hora Atual */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs">
            <Clock size={13} className="text-neon-blue" />
            <span className="text-white font-mono font-medium text-xs">
              {formatTime(time)}
            </span>
          </div>

          {/* Status Online */}
          <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] uppercase font-bold tracking-wider ${
            isOnline 
              ? "bg-green-500/10 border-green-500/20 text-neon-green" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-neon-green" : "bg-red-400"} animate-ping`} />
            <span className="hidden sm:inline">{isOnline ? "Online" : "Offline"}</span>
          </div>

          {/* Sincronização / Atualização */}
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase italic tracking-wider text-black bg-neon-blue hover:brightness-110 active:scale-95 transition-all duration-150 rounded-md btn-glow-blue"
            title="Atualizar dados"
            id="btn-sync-topbar"
          >
            <RefreshCw size={12} className={`${syncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
