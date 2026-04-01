import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Shield, Lock, Mail, Loader2, Sparkles, Key } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        // 1. Validar código de invitación
        if (!accessCode) throw new Error('Se requiere un código de acceso para registrarse.');
        
        const { data: codeData, error: codeErr } = await supabase
          .from('codigos_registro')
          .select('*')
          .eq('codigo', accessCode.trim())
          .eq('is_used', false)
          .single();

        if (codeErr || !codeData) {
          throw new Error('El código de acceso no es válido o ya ha sido utilizado.');
        }

        // 2. Intentar registrar al usuario
        const signupData = await signUp(email, password, { 
          invitation_code: accessCode.trim() 
        });

        const userId = signupData?.user?.id;

        // 3. Marcar código como usado si el registro fue exitoso
        if (userId) {
          await supabase
            .from('codigos_registro')
            .update({ 
              is_used: true, 
              used_by: userId, 
              used_at: new Date().toISOString() 
            })
            .eq('id', codeData.id);
        }

        setError('¡Cuenta creada! Revisa tu correo o intenta ingresar.');
        setIsSignUp(false);
        setAccessCode('');
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || (isSignUp ? 'Error al crear la cuenta.' : 'Credenciales incorrectas.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-primary-dark relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md px-6 z-10"
      >
        <div className="glass-panel p-8 rounded-4xl border-white/10 shadow-2xl relative overflow-hidden">
          {/* Decorative Sparkle */}
          <div className="absolute top-4 right-4 text-emerald-500/40">
            <Sparkles size={24} />
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-linear-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg mb-4 border border-white/20">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">AuditFlow <span className="text-emerald-400">Pro</span></h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              {isSignUp ? 'Crear Nueva Cuenta' : 'Plataforma de Control de Observaciones'}
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mb-6 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                error.includes('¡Cuenta creada!') 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${error.includes('¡Cuenta creada!') ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  placeholder="ejemplo@integrum.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isSignUp && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest pl-1">Código de Acceso Pro</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                  <input
                    type="text"
                    required={isSignUp}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
                    placeholder="AUDIT-XXX-XXX"
                  />
                </div>
                <p className="text-[9px] text-slate-500 pl-1">Este código es necesario para activar tu licencia profesional.</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>{isSignUp ? 'Registrarme ahora' : 'Ingresar al Sistema'}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-200 group-hover:animate-ping" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex justify-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors uppercase tracking-widest"
            >
              {isSignUp ? '¿Ya tienes cuenta? Ingresa aquí' : '¿No tienes cuenta? Crea una'}
            </button>
          </div>

          <div className="mt-10 border-t border-white/5 pt-6 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">© 2026 García Integrum</span>
            <div className="flex gap-4">
              <a href="#" className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Ayuda</a>
              <a href="#" className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Seguridad</a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
