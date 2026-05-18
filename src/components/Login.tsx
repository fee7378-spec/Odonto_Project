import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { Stethoscope, Mail, Lock, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkUserExists = async () => {
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      // Usamos fetchSignInMethodsForEmail para verificar se o e-mail existe no Firebase Auth
      const methods = await fetchSignInMethodsForEmail(auth, email);
      
      if (methods.length > 0) {
        setStep(2);
      } else {
        // Se não existir no Auth, verificamos se é o primeiro acesso (banco vazio)
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        
        if (!snapshot.exists()) {
          // Se o banco está vazio, permitimos prosseguir para criar o primeiro usuário
          // Mas como o usuário quer que "todo login seja salvo lá", vamos apenas avisar.
          // Para simplificar e seguir a imagem:
          setStep(2); 
        } else {
          setError('Usuário não encontrado');
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-email') {
        setError('E-mail inválido');
      } else {
        setError('Erro ao verificar usuário');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Senha incorreta');
      } else if (err.code === 'auth/user-not-found') {
        setError('Usuário não encontrado');
        setStep(1);
      } else {
        setError('Falha na autenticação: ' + (err.message || 'Erro desconhecido'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A18] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0B1224] border border-white/5 rounded-[24px] p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                <Stethoscope className="text-primary w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">DenteCloud</h1>
              <p className="text-slate-400 text-sm mt-2 font-medium">
                {step === 1 ? 'Informe seu e-mail para continuar' : 'Informe sua senha'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-widest ml-1">E-mail</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && checkUserExists()}
                        placeholder="seu@email.com" 
                        className="w-full bg-[#161F35] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-bold">{error}</span>
                    </motion.div>
                  )}

                  <button 
                    onClick={checkUserExists}
                    disabled={loading || !email}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 group hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Continuar</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleLogin}
                  className="space-y-6"
                >
                  <button 
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError('');
                    }}
                    className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Alterar e-mail ({email})</span>
                  </button>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-widest ml-1">Senha</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        autoFocus
                        className="w-full bg-[#161F35] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-bold">{error}</span>
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading || !password}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      'Entrar no Sistema'
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium uppercase tracking-widest">
                Sistema Restrito <span className="opacity-30">•</span> Agendamentos e Consultas
              </p>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-8 text-center">
          <p className="text-[12px] text-white/40 font-medium">
            © Developed by Felipe Nascimento
          </p>
        </div>
      </div>
    </div>
  );
}
