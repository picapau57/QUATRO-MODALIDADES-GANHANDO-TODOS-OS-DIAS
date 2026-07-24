import React, { useState } from "react";
import { Lock, User, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle, MessageCircle, ShieldCheck } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError("Por favor, preencha o usuário e a senha.");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUser, password: cleanPass })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (isLogin) {
          onLoginSuccess(data.token, data.user);
        } else {
          // If register provides direct token, log user in immediately!
          if (data.token && data.user) {
            setSuccess("Cadastro realizado com sucesso! Entrando no sistema...");
            setTimeout(() => {
              onLoginSuccess(data.token, data.user);
            }, 600);
          } else {
            setSuccess("Cadastro realizado com sucesso! Você já pode entrar com seu usuário e senha.");
            setIsLogin(true);
            setPassword("");
          }
        }
      } else {
        setError(data.message || "Ocorreu um erro ao processar. Tente novamente.");
      }
    } catch (err) {
      setError("Erro ao se conectar ao servidor. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const fillAdminPreset = () => {
    setUsername("admin");
    setPassword("admin123");
    setIsLogin(true);
    setError(null);
    setSuccess("Credenciais de Administrador preenchidas! Clique em 'Entrar no Sistema'.");
  };

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
            <span>Sistema VIP de Gestão</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-neon-blue tracking-tight uppercase italic">
            QUATRO MODALIDADES
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wide">
            Acesso ao Gerador Estatístico de Combinações
          </p>
        </div>

        {/* Action tab switches */}
        <div className="grid grid-cols-2 bg-gray-950 p-1 rounded-xl border border-white/5 mb-5">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); setSuccess(null); }}
            className={`py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all uppercase cursor-pointer ${
              isLogin 
                ? "bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 text-white border border-neon-blue/30 shadow-md" 
                : "text-gray-500 hover:text-white"
            }`}
            id="tab-auth-login"
          >
            Acessar Conta
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); setSuccess(null); }}
            className={`py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all uppercase cursor-pointer ${
              !isLogin 
                ? "bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 text-white border border-neon-blue/30 shadow-md" 
                : "text-gray-500 hover:text-white"
            }`}
            id="tab-auth-register"
          >
            Cadastrar-se
          </button>
        </div>

        {/* Admin Quick Preset Option */}
        <div className="mb-4 text-center">
          <button
            type="button"
            onClick={fillAdminPreset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neon-blue/30 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue text-[11px] font-bold transition-all cursor-pointer"
            id="btn-admin-preset"
          >
            <ShieldCheck size={14} />
            <span>Usar Acesso Admin (admin / admin123)</span>
          </button>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs leading-relaxed">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-neon-green/10 border border-neon-green/20 text-neon-green rounded-lg text-xs leading-relaxed">
            <CheckCircle size={15} className="flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Usuário de Acesso
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Ex: admin ou seu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-black/80 border border-white/10 focus:border-neon-blue/60 text-white text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none transition-all focus:shadow-[0_0_15px_rgba(0,243,255,0.12)]"
                id="input-username"
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
                required
                className="w-full bg-black/80 border border-white/10 focus:border-neon-blue/60 text-white text-sm pl-10 pr-10 py-2.5 rounded-xl outline-none transition-all focus:shadow-[0_0_15px_rgba(0,243,255,0.12)]"
                id="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
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
              "CADASTRAR E ENTRAR AGORA"
            )}
          </button>
        </form>

        {/* Divider and Support details */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0e0f14] px-3 text-gray-500 text-[10px] font-black tracking-widest">SUPORTE</span>
          </div>
        </div>

        {/* Direct WhatsApp support button */}
        <a
          href="https://wa.me/5562985756881?text=Ol%C3%A1!%20Estou%20com%20d%C3%BAvida%20sobre%20o%20acesso%20ao%20sistema%20Quatro%20Modalidades."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-white/5 hover:bg-white/10 active:scale-98 border border-white/10 text-gray-300 font-bold text-xs py-2.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer uppercase"
          id="btn-auth-support"
        >
          <MessageCircle size={14} className="text-neon-green" />
          Falar no WhatsApp
        </a>
      </motion.div>
    </div>
  );
}
