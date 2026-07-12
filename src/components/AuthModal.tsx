import React, { useState, useEffect } from "react";
import { Lock, User, Eye, EyeOff, AlertCircle, Sparkles, Smartphone, CheckCircle, Copy, ExternalLink, MessageCircle } from "lucide-react";
import { motion } from "motion/react";

interface AuthModalProps {
  onLoginSuccess: (token: string, user: { id: string; username: string; role: string }) => void;
}

export default function AuthModal({ onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Security & Licensing states
  const [deviceId, setDeviceId] = useState<string>("");
  const [activationRequired, setActivationRequired] = useState<boolean>(false);
  const [deviceLimitReached, setDeviceLimitReached] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Initialize device ID fingerprint
  useEffect(() => {
    let currentId = localStorage.getItem("qm_device_id");
    if (!currentId) {
      currentId = "dev-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now();
      localStorage.setItem("qm_device_id", currentId);
    }
    setDeviceId(currentId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
    setError(null);
    setLoading(true);
    setActivationRequired(false);
    setDeviceLimitReached(false);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, deviceId })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        if (isLogin) {
          onLoginSuccess(data.token, data.user);
        } else {
          setSuccess("Cadastro realizado com sucesso! Sua conta está aguardando ativação de licença.");
          setIsLogin(true);
          setPassword("");
        }
      } else {
        if (data.unactivated) {
          setActivationRequired(true);
        } else if (data.deviceLimitReached) {
          setDeviceLimitReached(true);
        } else {
          setError(data.message || "Ocorreu um erro. Tente novamente.");
        }
      }
    } catch (err) {
      setError("Erro ao se conectar ao servidor. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText("62984289911");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // WhatsApp Contact Direct URL with formatted activation message
  const whatsAppLink = `https://wa.me/5562985756881?text=${encodeURIComponent(
    `Olá! Acabei de realizar o cadastro/pagamento para ativação do sistema Quatro Modalidades.\n\n👤 Usuário: ${username}\n📱 Identificador do Aparelho: ${deviceId}\n\nEnvio em anexo meu comprovante de R$ 99,90!`
  )}`;

  // Activation Screen render (License Wall)
  if (activationRequired) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-neon-orange/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-neon-blue/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md p-6 md:p-8 rounded-2xl border border-neon-orange/30 bg-[#0e0f14] shadow-[0_0_50px_rgba(255,123,0,0.15)] text-center"
        >
          <div className="mx-auto w-16 h-16 bg-neon-orange/10 border border-neon-orange/30 rounded-full flex items-center justify-center text-neon-orange mb-5 animate-pulse">
            <Smartphone size={32} />
          </div>

          <span className="text-[10px] font-black text-neon-orange uppercase tracking-widest bg-neon-orange/10 px-3 py-1 rounded-full">
            Licença Pendente
          </span>

          <h2 className="text-2xl font-black text-white mt-4 uppercase italic tracking-tight">
            Ativação Necessária
          </h2>

          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Olá <strong className="text-neon-blue">{username}</strong>! Este é um sistema profissional privado. Para liberar seu acesso definitivo (no Celular e no PC), siga os passos abaixo:
          </p>

          {/* Payment Card */}
          <div className="my-5 p-4 rounded-xl border border-white/5 bg-white/5 text-left space-y-3.5">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">1. Chave PIX (Celular)</span>
              <span className="text-xs font-black text-neon-green">R$ 99,90 (Único)</span>
            </div>
            
            <div className="flex items-center justify-between bg-black/50 p-2.5 rounded-lg border border-white/10">
              <code className="text-xs font-mono font-bold text-white tracking-wider">(62) 98428-9911</code>
              <button
                onClick={handleCopyPix}
                className="p-1.5 hover:bg-white/10 text-neon-blue rounded transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
              >
                {copied ? <CheckCircle size={14} className="text-neon-green" /> : <Copy size={14} />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>

            <div className="text-[10px] text-gray-500 leading-snug">
              📍 <strong>Beneficiário:</strong> Suporte Quatro Modalidades. Envie o comprovante via WhatsApp para validação imediata do seu aparelho.
            </div>
          </div>

          {/* WhatsApp Activation Trigger */}
          <a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25d366] hover:bg-[#20ba5a] active:scale-98 text-black font-black uppercase text-xs tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mb-3.5 shadow-lg shadow-[#25d366]/10 cursor-pointer"
          >
            <MessageCircle size={18} />
            Enviar Comprovante no WhatsApp
          </a>

          <button
            onClick={() => setActivationRequired(false)}
            className="w-full py-2.5 border border-white/10 bg-transparent hover:bg-white/5 active:scale-98 text-gray-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Voltar ao Login
          </button>
        </motion.div>
      </div>
    );
  }

  // Device Limit Exceeded Screen
  if (deviceLimitReached) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md p-6 md:p-8 rounded-2xl border border-red-500/30 bg-[#0e0f14] shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center"
        >
          <div className="mx-auto w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 mb-5">
            <AlertCircle size={32} />
          </div>

          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">
            Acesso Bloqueado
          </span>

          <h2 className="text-2xl font-black text-white mt-4 uppercase italic tracking-tight">
            Limite de Aparelhos Atingido
          </h2>

          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Esta licença (<strong className="text-neon-blue">{username}</strong>) já atingiu o limite de **2 dispositivos cadastrados** (ex: seu Celular e seu PC). 
          </p>

          <p className="text-xs text-gray-400 mt-2">
            Para transferir sua licença para este novo aparelho ou resetar suas conexões, entre em contato com o administrador enviando o ID deste aparelho:
          </p>

          <div className="my-4 p-3 bg-black/60 rounded-xl border border-white/5 text-left">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">ID Deste Dispositivo:</p>
            <code className="text-[11px] font-mono font-bold text-neon-blue block break-all select-all">{deviceId}</code>
          </div>

          <a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25d366] hover:bg-[#20ba5a] active:scale-98 text-black font-black uppercase text-xs tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mb-3 cursor-pointer"
          >
            <MessageCircle size={18} />
            Solicitar Reset no WhatsApp
          </a>

          <button
            onClick={() => setDeviceLimitReached(false)}
            className="w-full py-2.5 border border-white/10 bg-transparent hover:bg-white/5 active:scale-98 text-gray-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Voltar ao Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      {/* Decorative Neon Blurs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-neon-blue/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-neon-purple/15 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-md glass-effect-neon p-6 md:p-8 rounded-2xl border border-neon-blue/20 shadow-[0_0_50px_rgba(0,243,255,0.15)]"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-green/30 bg-neon-green/5 text-neon-green text-[10px] font-bold tracking-widest uppercase mb-3 animate-pulse">
            <Sparkles size={11} />
            <span>Sistema Premium</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-neon-blue tracking-tight uppercase italic">
            QUATRO MODALIDADES
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wide">
            Gestão estatística e gerador de combinações otimizadas.
          </p>
        </div>

        {/* Action tab switches */}
        <div className="grid grid-cols-2 bg-gray-950 p-1 rounded-xl border border-white/5 mb-5">
          <button
            onClick={() => { setIsLogin(true); setError(null); setSuccess(null); }}
            className={`py-2 rounded-lg text-xs font-bold tracking-wide transition-all uppercase ${
              isLogin 
                ? "bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 text-white border border-neon-blue/30" 
                : "text-gray-500 hover:text-white"
            }`}
            id="tab-auth-login"
          >
            Acessar Conta
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); setSuccess(null); }}
            className={`py-2 rounded-lg text-xs font-bold tracking-wide transition-all uppercase ${
              !isLogin 
                ? "bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 text-white border border-neon-blue/30" 
                : "text-gray-500 hover:text-white"
            }`}
            id="tab-auth-register"
          >
            Cadastrar-se
          </button>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs leading-relaxed">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-neon-green/10 border border-neon-green/20 text-neon-green rounded-lg text-xs leading-relaxed">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Usuário (ou Nome de Acesso)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Ex: administrador"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-white/10 focus:border-neon-blue/50 text-white text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none transition-all focus:shadow-[0_0_15px_rgba(0,243,255,0.08)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Senha Secreta
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/10 focus:border-neon-blue/50 text-white text-sm pl-10 pr-10 py-2.5 rounded-xl outline-none transition-all focus:shadow-[0_0_15px_rgba(0,243,255,0.08)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                id="btn-show-password"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-orange hover:brightness-110 active:scale-98 text-black font-black uppercase text-xs tracking-wider py-3.5 rounded-xl shadow-lg shadow-neon-blue/10 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            id="btn-auth-submit"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? (
              "ENTRAR NO SISTEMA"
            ) : (
              "SOLICITAR ACESSO / CADASTRAR"
            )}
          </button>
        </form>

        {/* Divider and Support details */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0b0c10] px-3 text-gray-500 text-[10px] font-black tracking-widest">SUPORTE</span>
          </div>
        </div>

        {/* Direct WhatsApp support button */}
        <a
          href="https://wa.me/5562985756881?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20as%20licen%C3%A7as%20do%20sistema%20Quatro%20Modalidades."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-white/5 hover:bg-white/10 active:scale-98 border border-white/10 text-gray-300 font-bold text-xs py-2.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer uppercase"
          id="btn-auth-support"
        >
          <MessageCircle size={14} className="text-neon-green" />
          Falar com Administrador pelo WhatsApp
        </a>

        {/* Info labels */}
        <div className="text-[10px] text-center text-gray-500 leading-relaxed mt-5 uppercase font-bold tracking-wide">
          Este sistema possui trava de segurança de até 2 aparelhos por usuário.
          <br />
          <span className="text-[9px] text-gray-600 block mt-1">Dispositivo ID: {deviceId}</span>
        </div>
      </motion.div>
    </div>
  );
}
