import React from "react";
import { 
  LayoutDashboard, 
  Target, 
  Hash, 
  Coins, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  user: any;
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  user,
  onLogout,
  mobileOpen,
  setMobileOpen
}: SidebarProps) {
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "ternos_grupos", label: "Ternos de Grupos", icon: Target, isModality: true },
    { id: "ternos_dezenas", label: "Ternos de Dezenas", icon: Hash, isModality: true },
    { id: "milhares", label: "Milhares", icon: Coins, isModality: true },
    { id: "duques_dezenas", label: "Duques de Dezenas", icon: Target, isModality: true },
    { id: "analises", label: "Central de Análises", icon: BarChart3 },
    { id: "estatisticas", label: "Estatísticas", icon: TrendingUp },
    { id: "configuracoes", label: "Configurações", icon: Settings },
  ];

  const handleNav = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false); // close mobile sidebar on nav
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-black text-gray-300 border-r border-gray-800 select-none">
      {/* Header logo/name */}
      <div className="flex items-center justify-between p-5 border-b border-gray-800 h-16">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <div className="text-lg font-black uppercase tracking-tighter italic text-white leading-none">
                SISTEMA <span className="text-neon-blue">PRO</span>
              </div>
              <div className="text-[9px] text-gray-500 font-bold uppercase mt-1 tracking-widest leading-none">
                Quatro Modalidades
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {collapsed && (
          <div className="text-lg font-black uppercase tracking-tighter italic text-neon-blue mx-auto">
            PRO
          </div>
        )}

        {/* Toggle desktop button */}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="hidden md:flex items-center justify-center w-6 h-6 rounded-md hover:bg-gray-800 text-gray-400 transition-colors"
          id="btn-toggle-sidebar"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User profile brief */}
      <div className="p-4 border-b border-gray-800 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center font-bold text-black text-xs uppercase shadow-md shadow-neon-blue/10">
            {user?.username?.substring(0, 2) || "CO"}
          </div>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 overflow-hidden"
            >
              <p className="text-sm font-semibold truncate text-white">{user?.username || "Convidado"}</p>
              <p className="text-xs text-gray-400 capitalize truncate">{user?.role || "Acesso Livre"}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Menu items */}
      <nav className="flex-1 py-4 px-1 space-y-1 overflow-y-auto">
        <div className="px-4 mb-2 text-[10px] text-gray-500 font-bold uppercase">Menu Principal</div>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex items-center w-full px-4 py-2.5 text-xs font-bold uppercase italic tracking-wider transition-all duration-200 group relative border-l-4 ${
                isActive 
                  ? "bg-white/5 border-neon-blue text-white" 
                  : "border-transparent text-gray-400 hover:bg-white/5 hover:border-neon-blue hover:text-white"
              }`}
              id={`nav-item-${item.id}`}
            >
              <Icon 
                size={16} 
                className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-neon-blue" : "text-gray-400 group-hover:text-neon-blue"
                }`} 
              />
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-3 truncate"
                >
                  {item.label}
                </motion.span>
              )}

              {/* Hover tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-14 scale-0 group-hover:scale-100 bg-gray-950 text-white text-xs py-1 px-2 rounded border border-gray-800 shadow-xl transition-all duration-150 z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Jogo Responsável Alert Disclaimer */}
      {!collapsed && (
        <div className="m-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 text-[10px] text-yellow-500/70 leading-relaxed">
          <div className="flex items-center gap-1.5 mb-1 font-semibold text-yellow-500/90 uppercase">
            <ShieldAlert size={12} />
            <span>Aviso de Uso</span>
          </div>
          Uso estatístico e organizativo. Este sistema não garante lucros ou prevê resultados.
        </div>
      )}

      {/* Footer log out */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-2 text-xs font-bold uppercase italic tracking-wider text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          id="btn-logout"
        >
          <LogOut size={16} />
          {!collapsed && <span className="ml-3">Sair da Sessão</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar container */}
      <aside 
        className={`hidden md:block h-screen flex-shrink-0 transition-all duration-300 z-30 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-40"
            />
            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 left-0 w-64 z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
