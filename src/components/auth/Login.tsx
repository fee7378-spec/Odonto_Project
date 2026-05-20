import React, { useState } from 'react';
import { Mail, Lock, LogIn, ChevronRight, UserPlus, ArrowLeft, Key } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { checkUserByEmail, updateDoc, usersCollection } from '../../services/firebaseService';
import Logo from '../ui/Logo';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const { addToast } = useToast();

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Por favor, informe um email válido.', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await checkUserByEmail(email);
      if (!user) {
        // Special bypass for the owner email to allow initial access/bootstrap
        if (email.toLowerCase() === 'fee7378@gmail.com') {
          setUserData({ 
            id: 'master_admin', 
            email: email.toLowerCase(), 
            name: 'Felipe Nascimento', 
            status: 'active',
            profileId: 'admin' 
          });
          setStep(2);
          return;
        }
        addToast('Acesso negado. Este e-mail não está cadastrado no sistema.', 'error');
        setLoading(false);
        return;
      }
      setUserData(user);
      setStep(2);
    } catch (error: any) {
      addToast('Erro ao validar e-mail: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalAction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userData.status === 'pending' || userData.id === 'master_admin') {
      if (password.length < 6) {
        addToast('A senha deve ter pelo menos 6 caracteres.', 'error');
        return;
      }
      if (userData.status === 'pending' && password !== confirmPassword) {
        addToast('As senhas não coincidem.', 'error');
        return;
      }
    } else {
      if (!password) {
        addToast('Informe sua senha.', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      if (userData.status === 'pending') {
        // First access: Create the user in Firebase Auth
        await createUserWithEmailAndPassword(auth, email, password);
        // Update user status in Firestore
        await updateDoc(usersCollection, userData.id, { status: 'active' });
        addToast('Senha configurada com sucesso! Bem-vindo.', 'success');
      } else {
        // Regular login
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (signInError: any) {
          if (userData.id === 'master_admin' && (signInError.code === 'auth/invalid-credential' || signInError.code === 'auth/user-not-found' || signInError.code === 'auth/wrong-password')) {
            // Master admin might not exist yet, attempt to create
            try {
              await createUserWithEmailAndPassword(auth, email, password);
            } catch (createError: any) {
              if (createError.code === 'auth/email-already-in-use') {
                throw signInError; // It was indeed a wrong password
              }
              throw createError;
            }
          } else {
            throw signInError;
          }
        }
        
        // If this was the master admin bootstrap, ensure the DB entries exist
        if (userData.id === 'master_admin') {
          try {
            const { createDoc, profilesCollection, usersCollection } = await import('../../services/firebaseService');
            // Create Admin Profile if it doesn't exist (simulated check by trying to create if we don't have one)
            // For now, just ensure the user exists in system_users
            const existingUser = await checkUserByEmail(email);
            if (!existingUser) {
              // Create a default admin profile
              const service = await import('../../services/firebaseService');
              const profiles = await service.getAllDocs<any>(profilesCollection) || [];
              let adminProfileId = (profiles as any[]).find(p => p.name === 'Administrador')?.id;
              
              if (!adminProfileId) {
                const adminPermissions: Record<string, 'edit'> = {};
                ['dashboard', 'monitorar', 'analistas', 'esteiras', 'historico', 'log', 'perfis', 'perfil', 'processamento'].forEach(m => {
                  adminPermissions[m] = 'edit';
                });

                const newProfile = await createDoc(profilesCollection, {
                  name: 'Administrador',
                  description: 'Acesso total ao sistema',
                  permissions: adminPermissions
                }) as any;
                adminProfileId = newProfile.id;
              }

              await createDoc(usersCollection, {
                name: 'Felipe Nascimento',
                email: email.toLowerCase(),
                profileId: adminProfileId,
                status: 'active',
                createdAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.error('Bootstrap error', e);
          }
        }
        
        addToast('Login realizado com sucesso!', 'success');
      }
      onLogin();
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        addToast('Credenciais inválidas. Verifique seu e-mail e senha e tente novamente.', 'error');
      } else if (error.code === 'auth/email-already-in-use') {
        // This could happen if the user was created in Auth but status was still pending
        // Try to sign in instead
        try {
          await signInWithEmailAndPassword(auth, email, password);
          await updateDoc(usersCollection, userData.id, { status: 'active' });
          onLogin();
        } catch {
          addToast('Este e-mail já possui uma conta configurada.', 'error');
        }
      } else {
        addToast('Erro ao realizar login: ' + error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center justify-center mb-8">
          <Logo className="h-[68px]" />
        </div>
        <p className="mt-2 text-center text-sm text-slate-500">
          Painel de Acesso do Colaborador
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleNext}>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  E-mail de Acesso
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/10 transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gold-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-gold-600/20 hover:bg-gold-700 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Validando...' : 'Continuar'}
                <ChevronRight className="h-5 w-5" />
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleFinalAction}>
              <div className="flex items-center gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gold-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Acessando como</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{email}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-gold-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {userData.status === 'pending' ? (
                <div className="space-y-4">
                  <div className="bg-gold-50 border border-gold-100 p-4 rounded-xl flex gap-3">
                    <UserPlus className="w-5 h-5 text-gold-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gold-700">Primeiro Acesso</p>
                      <p className="text-[10px] text-gold-600 mt-0.5">Crie sua senha para ativar sua conta na plataforma.</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Criar Senha</label>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Key className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/10 transition-all"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Confirmar Senha</label>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/10 transition-all"
                        placeholder="Repita a senha"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Digite sua Senha</label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onKeyDown={(e) => e.key === 'Enter' && handleFinalAction(e)}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/10 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gold-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-gold-600/20 hover:bg-gold-700 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <LogIn className="h-5 w-5" />
                {loading ? 'Processando...' : (userData.status === 'pending' ? 'Ativar Conta' : 'Entrar')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
