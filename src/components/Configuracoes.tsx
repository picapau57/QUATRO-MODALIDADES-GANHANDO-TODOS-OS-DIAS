import React, { useRef, useState, useEffect } from "react";
import { 
  Settings, 
  Palette, 
  DownloadCloud, 
  UploadCloud, 
  Globe, 
  RefreshCcw, 
  ShieldCheck, 
  FileJson,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Users,
  UserCheck,
  UserX,
  Trash2,
  Monitor,
  Share2,
  Lock,
  MessageCircle,
  Clock
} from "lucide-react";
import { SystemConfig } from "../types";

interface ConfiguracoesProps {
  user: { id: string; username: string; role: string } | null;
  configs: SystemConfig;
  onUpdateConfigs: (newConfigs: Partial<SystemConfig>) => void;
  onBackup: () => void;
  onRestore: (file: File) => Promise<boolean>;
  logs: any[];
}

export default function Configuracoes({
  user,
  configs,
  onUpdateConfigs,
  onBackup,
  onRestore,
  logs
}: ConfiguracoesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoredOk, setRestoredOk] = useState<boolean | null>(null);
  const [restoredMsg, setRestoredMsg] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);
  const [updateMsg, setUpdateMsg] = useState<string>("");

  // PWA/Installer states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(false);
  const [isCopiedId, setIsCopiedId] = useState<boolean>(false);
  const [isInIframe, setIsInIframe] = useState<boolean>(false);

  // Admin licensing states
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  // Monitor installation prompt
  useEffect(() => {
    setIsInIframe(window.self !== window.top);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if running as PWA
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                         (navigator as any).standalone === true;
    setIsPwaInstalled(!!isStandalone);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Load licenses list for Admin
  const loadUsersList = async () => {
    if (user?.role !== "admin") return;
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) {
      console.error("Erro ao carregar lista de licenças:", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadUsersList();
    }
  }, [user]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA installation choice: ${outcome}`);
    setDeferredPrompt(null);
  };

  const handleToggleActive = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-active`, {
        method: "POST",
        headers: { "x-user": user?.username || "Admin" }
      });
      if (res.ok) {
        loadUsersList();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetDevices = async (userId: string) => {
    if (!window.confirm("Deseja realmente limpar todos os aparelhos vinculados a esta licença?")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-devices`, {
        method: "POST",
        headers: { "x-user": user?.username || "Admin" }
      });
      if (res.ok) {
        loadUsersList();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Deseja realmente remover este usuário e suspender o acesso permanentemente?")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "x-user": user?.username || "Admin" }
      });
      if (res.ok) {
        loadUsersList();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const success = await onRestore(file);
      if (success) {
        setRestoredOk(true);
        setRestoredMsg("Backup restaurado e sincronizado com sucesso!");
      } else {
        setRestoredOk(false);
        setRestoredMsg("Erro ao processar arquivo de backup. Formato incompatível.");
      }
    } catch (err) {
      setRestoredOk(false);
      setRestoredMsg("Erro de leitura do arquivo.");
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerSearchUpdates = () => {
    setUpdating(true);
    setUpdateMsg("");
    setTimeout(() => {
      setUpdating(false);
      setUpdateMsg("Seu sistema já está rodando a versão estável mais recente (v2.4.2 Premium).");
    }, 1500);
  };

  const handleCopyDeviceId = () => {
    const id = localStorage.getItem("qm_device_id") || "";
    navigator.clipboard.writeText(id);
    setIsCopiedId(true);
    setTimeout(() => setIsCopiedId(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="p-5 rounded-2xl border border-white/10 bg-white/5 glass-effect">
        <span className="text-[10px] font-black text-neon-blue uppercase tracking-widest bg-neon-blue/10 px-2.5 py-1 rounded-full">
          PAINEL DE CONTROLE
        </span>
        <h2 className="text-xl md:text-2xl font-black text-white mt-2 uppercase italic tracking-tight">
          Configurações Globais do Sistema
        </h2>
        <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wide">
          Ajuste temas visuais, gerencie backups de dados criptografados, instale o aplicativo e controle os acessos de usuários.
        </p>
      </div>

      {/* Admin Panel: Access and Licenses Control */}
      {user?.role === "admin" && (
        <div className="p-5 rounded-2xl bg-[#0e1017] border border-neon-purple/30 space-y-5 shadow-[0_0_30px_rgba(188,19,254,0.05)]">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 italic">
              <Users size={16} className="text-neon-purple" />
              Controle de Licenças e Dispositivos (Administrador)
            </h3>
            <button
              onClick={loadUsersList}
              className="p-1 text-xs text-neon-purple hover:text-white flex items-center gap-1 font-bold uppercase transition-colors"
            >
              <RefreshCcw size={12} className={loadingUsers ? "animate-spin" : ""} />
              Atualizar
            </button>
          </div>

          <p className="text-xs text-gray-400 uppercase font-bold tracking-wide leading-relaxed">
            Aqui você gerencia quem comprou o direito de usar o sistema por R$ 99,90. Cada usuário pode conectar até **2 aparelhos** (ex: celular e PC). Você pode ativar novas contas, resetar aparelhos conectados ou remover acessos.
          </p>

          <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="p-3">Usuário</th>
                  <th className="p-3">Status da Conta</th>
                  <th className="p-3">Aparelhos Vinculados</th>
                  <th className="p-3 text-right">Ações de Controle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500 uppercase font-bold">
                      {loadingUsers ? "Carregando usuários..." : "Nenhum usuário cadastrado além de você."}
                    </td>
                  </tr>
                ) : (
                  usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-white">{usr.username}</p>
                        <p className="text-[9px] text-gray-500 uppercase font-medium">{usr.role === "admin" ? "Suporte Administrador" : "Licenciário Comum"}</p>
                      </td>
                      <td className="p-3">
                        {usr.role === "admin" ? (
                          <span className="text-[10px] font-black text-neon-blue bg-neon-blue/10 px-2.5 py-0.5 rounded-full border border-neon-blue/20 uppercase tracking-wide">
                            Administrador
                          </span>
                        ) : usr.active ? (
                          <span className="text-[10px] font-black text-neon-green bg-neon-green/10 px-2.5 py-0.5 rounded-full border border-neon-green/20 uppercase tracking-wide">
                            Ativado / Pago
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-neon-orange bg-neon-orange/10 px-2.5 py-0.5 rounded-full border border-neon-orange/20 uppercase tracking-wide animate-pulse">
                            Aguardando Pagamento
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {usr.role === "admin" ? (
                          <span className="text-[10px] text-gray-500 uppercase font-bold">Aparelhos Livres</span>
                        ) : (
                          <div className="space-y-1">
                            <span className="font-mono text-[10px] font-bold text-white">
                              {usr.devices?.length || 0} de 2 cadastrados
                            </span>
                            {usr.devices?.map((devId: string, idx: number) => (
                              <p key={idx} className="text-[8px] font-mono text-gray-500 truncate max-w-[200px]" title={devId}>
                                Device #{idx + 1}: {devId}
                              </p>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {usr.role !== "admin" && (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleToggleActive(usr.id)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                                usr.active
                                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                                  : "bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/20"
                              }`}
                            >
                              {usr.active ? <UserX size={12} /> : <UserCheck size={12} />}
                              {usr.active ? "Bloquear" : "Ativar Licença"}
                            </button>
                            <button
                              onClick={() => handleResetDevices(usr.id)}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                              title="Limpar aparelhos para permitir login em outros celulares/PC"
                            >
                              <Smartphone size={12} />
                              Resetar Aparelhos
                            </button>
                            <button
                              onClick={() => handleDeleteUser(usr.id)}
                              className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
                              title="Remover permanentemente"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: General preferences (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card: PWA / App Installer (MUST show to easily install) */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-neon-blue/20 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2.5 italic">
              <Smartphone size={14} className="text-neon-blue" />
              Instalar no PC, Android ou iPhone (iOS)
            </h3>

            <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">
              Este sistema é totalmente compatível com **PWA (Progressive Web App)**. Você pode transformá-lo em um aplicativo nativo para celular e computador em segundos, garantindo inicialização veloz e ícone na tela inicial.
            </p>

            {isInIframe && (
              <div className="p-4 rounded-xl border border-neon-orange/30 bg-neon-orange/5 space-y-2.5">
                <div className="flex gap-1.5 items-center text-[10px] font-black text-neon-orange uppercase tracking-wider">
                  <AlertCircle size={15} />
                  <span>Aviso de Janela Integrada (Iframe)</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed font-semibold uppercase">
                  Você está visualizando o sistema dentro de uma janela integrada de desenvolvimento. Por questões de segurança, os navegadores **bloqueiam** o botão de instalação automática PWA de rodar dentro de painéis integrados.
                </p>
                <div className="pt-1">
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neon-blue hover:bg-neon-blue/90 active:scale-98 text-black font-black uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-neon-blue/10"
                  >
                    <Share2 size={12} />
                    Abrir em Nova Aba Standalone
                  </a>
                </div>
              </div>
            )}

            {isPwaInstalled ? (
              <div className="p-3 bg-neon-green/5 border border-neon-green/20 text-neon-green rounded-xl text-xs flex items-center gap-2 font-bold uppercase tracking-wide">
                <CheckCircle2 size={16} />
                <span>Você já está utilizando este sistema como um aplicativo instalado!</span>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {/* Native Prompt Option */}
                {deferredPrompt ? (
                  <button
                    onClick={handleInstallClick}
                    className="w-full p-4 rounded-xl border border-neon-blue/40 bg-neon-blue/5 hover:bg-neon-blue/10 active:scale-98 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="p-2 bg-neon-blue/10 text-neon-blue rounded-lg group-hover:scale-105 transition-transform">
                        <Smartphone size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-black text-white uppercase italic">Instalar Aplicativo Nativo</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5 uppercase font-bold">Clique para adicionar à tela inicial ou área de trabalho automaticamente.</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-neon-blue font-mono font-black uppercase tracking-widest bg-neon-blue/5 border border-neon-blue/10 px-2 py-1 rounded">
                      Instalar Agora
                    </span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    {!isInIframe && (
                      <p className="text-[10px] text-neon-purple font-bold uppercase tracking-wide bg-neon-purple/5 border border-neon-purple/10 px-3 py-1.5 rounded-lg">
                        ℹ️ O sinal automático de instalação do seu navegador ainda não disparou ou o sistema já está instalado. Você pode instalar manualmente usando as instruções a seguir:
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Android Instructions */}
                      <div className="p-3.5 rounded-xl border border-white/5 bg-black/40 text-left space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-neon-green uppercase">
                          <Smartphone size={14} />
                          No Android (Celular)
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed font-semibold uppercase">
                          Abra no Chrome, toque nos <strong className="text-white">3 pontinhos</strong> superiores e selecione <strong className="text-white">"Instalar aplicativo"</strong> ou <strong className="text-white">"Adicionar à tela de início"</strong>.
                        </p>
                      </div>

                      {/* iOS Instructions */}
                      <div className="p-3.5 rounded-xl border border-white/5 bg-black/40 text-left space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-neon-orange uppercase">
                          <Share2 size={14} />
                          No iPhone / iOS
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed font-semibold uppercase">
                          Abra no navegador <strong className="text-white">Safari</strong>, toque no botão de <strong className="text-white">Compartilhar</strong> (ícone de seta pra cima) e escolha <strong className="text-white">"Adicionar à Tela de Início"</strong>.
                        </p>
                      </div>

                      {/* PC/Desktop Instructions */}
                      <div className="p-3.5 rounded-xl border border-white/5 bg-black/40 text-left space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-neon-blue uppercase">
                          <Monitor size={14} />
                          No PC / Computador
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed font-semibold uppercase">
                          Clique no ícone de <strong className="text-white">computador com seta (+)</strong> no lado direito da barra de endereços do seu Chrome/Edge para instalar.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 1: Themes */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2.5 italic">
              <Palette size={14} className="text-neon-blue" />
              Estilo Visual e Temas
            </h3>

            <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">
              Escolha uma identidade visual otimizada para o seu dispositivo. O tema Neon é projetado para telas OLED de alto contraste.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { id: "neon", label: "Tema Neon Premium", desc: "Contraste Cyberpunk", border: "border-neon-blue/40 text-neon-blue bg-neon-blue/5" },
                { id: "escuro", label: "Tema Escuro Slate", desc: "Conforto Ocular", border: "border-white/10 text-gray-200 bg-white/5" },
                { id: "claro", label: "Tema Claro Neve", desc: "Clássico Corporativo", border: "border-gray-200 text-gray-800 bg-white" }
              ].map((theme) => {
                const isActive = configs.tema === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onUpdateConfigs({ tema: theme.id as any })}
                    className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                      isActive 
                        ? "ring-2 ring-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.15)] " + theme.border
                        : "border-white/5 bg-black/40 text-gray-500 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider">{theme.label}</p>
                    <p className="text-[9px] text-gray-500 mt-0.5 font-bold uppercase">{theme.desc}</p>
                    {isActive && (
                      <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Backup and Restore */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2.5 italic">
              <FileJson size={14} className="text-neon-purple" />
              Sincronização e Backup de Segurança
            </h3>

            <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">
              Exporte seus jogos favoritos, dezenas cadastradas e logs de sorteios em formato JSON criptografado para preservar seu histórico offline.
            </p>

            {restoredOk !== null && (
              <div className={`p-3 rounded-lg text-xs leading-relaxed flex items-center gap-2 uppercase font-bold tracking-wide ${
                restoredOk 
                  ? "bg-green-500/10 border border-green-500/20 text-neon-green" 
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}>
                {restoredOk ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{restoredMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Backup Trigger */}
              <button
                onClick={onBackup}
                className="p-4 rounded-xl border border-white/5 bg-black/40 text-left hover:border-neon-purple/40 group transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-neon-purple/10 text-neon-purple rounded-lg group-hover:scale-105 transition-transform">
                    <DownloadCloud size={18} />
                  </div>
                  <span className="text-[10px] text-neon-purple font-mono font-black uppercase tracking-widest bg-neon-purple/5 border border-neon-purple/10 px-1.5 py-0.5 rounded">
                    Criar JSON
                  </span>
                </div>
                <h4 className="text-xs font-black text-white mt-3 uppercase italic">Gerar Cópia de Segurança</h4>
                <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wide">Salva todos os seus dados locais de forma compactada.</p>
              </button>

              {/* Restore Trigger */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-xl border border-white/5 bg-black/40 text-left hover:border-neon-green/40 group transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-neon-green/10 text-neon-green rounded-lg group-hover:scale-105 transition-transform">
                    <UploadCloud size={18} />
                  </div>
                  <span className="text-[10px] text-neon-green font-mono font-black uppercase tracking-widest bg-neon-green/5 border border-neon-green/10 px-1.5 py-0.5 rounded">
                    Carregar
                  </span>
                </div>
                <h4 className="text-xs font-black text-white mt-3 uppercase italic">Restaurar do Arquivo</h4>
                <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wide">Carrega um arquivo JSON exportado anteriormente.</p>
              </button>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Card 3: Language and Localization */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2.5 italic">
              <Globe size={14} className="text-neon-orange" />
              Idioma e Localização
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-gray-300 uppercase italic">Idioma da Interface</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Muda os rótulos e descrições do sistema.</p>
              </div>

              <select
                value={configs.idioma}
                onChange={(e) => onUpdateConfigs({ idioma: e.target.value as any })}
                className="bg-black border border-white/10 text-white text-xs p-2.5 rounded-xl outline-none font-bold uppercase"
              >
                <option value="pt">Português (Brasil)</option>
                <option value="en">English (United States)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Right Side: Logs / Metadata (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: Device Fingerprint Details */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 shadow-sm">
            <div className="flex gap-2 items-center text-xs font-black text-white uppercase italic border-b border-white/10 pb-2">
              <Lock size={14} className="text-neon-blue" />
              Chave deste Aparelho
            </div>
            
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide leading-relaxed">
              Este identificador vincula este dispositivo à sua licença do sistema.
            </p>

            <div className="p-3 bg-black rounded-xl border border-white/5">
              <code className="text-[10px] font-mono font-bold text-neon-blue block break-all select-all">
                {localStorage.getItem("qm_device_id") || "Verificando..."}
              </code>
            </div>

            <button
              onClick={handleCopyDeviceId}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer"
            >
              {isCopiedId ? "Copiado!" : "Copiar ID do Aparelho"}
            </button>
          </div>

          {/* Card: Version updates check */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-4 text-center shadow-sm">
            <div className="mx-auto w-10 h-10 rounded-full bg-neon-blue/10 flex items-center justify-center text-neon-blue">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider italic">
                Verificação de Versão
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mt-1">
                QM Premium Engine v2.4.2 stable
              </p>
            </div>

            {updateMsg && (
              <p className="text-[10px] text-neon-green bg-neon-green/5 border border-neon-green/10 p-2 rounded-lg leading-relaxed uppercase font-bold tracking-wide">
                {updateMsg}
              </p>
            )}

            <button
              onClick={triggerSearchUpdates}
              disabled={updating}
              className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-white border border-neon-blue/20 bg-neon-blue/5 hover:bg-neon-blue/10 active:scale-98 transition-all rounded-xl cursor-pointer uppercase tracking-wider"
              id="btn-check-updates"
            >
              <RefreshCcw size={12} className={`${updating ? "animate-spin" : ""}`} />
              {updating ? "Buscando..." : "Buscar Lotes de Atualizações"}
            </button>
          </div>

          {/* Card: Compact Event Logs */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-3 shadow-sm">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2.5 italic">
              Log de Auditoria Local
            </h4>

            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {logs.slice().reverse().map((log) => (
                <div key={log.id} className="text-[10px] text-gray-400 leading-snug font-sans uppercase font-bold tracking-wide">
                  <p className="font-mono text-[9px] text-neon-blue">
                    {new Date(log.data).toLocaleTimeString()} - {log.usuario}
                  </p>
                  <p className="text-white mt-0.5">{log.acao}</p>
                  <p className="text-gray-500 leading-relaxed normal-case font-medium">{log.detalhes}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
