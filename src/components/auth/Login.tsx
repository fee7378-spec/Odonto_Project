import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useToast } from '../ui/Toast';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Por favor, informe um email válido.', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }
    
    setLoading(true);
    try {
      if (isSignUp) {
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        await createUserWithEmailAndPassword(auth, email, password);
        addToast('Conta criada com sucesso!', 'success');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        addToast('Login realizado com sucesso!', 'success');
      }
      onLogin();
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/configuration-not-found') {
        addToast('Erro: Autenticação por Email/Senha não está habilitada no Firebase Console.', 'error');
      } else if (error.code === 'auth/invalid-credential') {
        addToast('Credenciais inválidas ou usuário não encontrado.', 'error');
      } else if (error.code === 'auth/email-already-in-use') {
        addToast('Este email já está em uso.', 'error');
      } else {
        addToast('Erro ao realizar login. ' + error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h2 className="mt-6 text-center text-3xl font-display font-bold tracking-tight text-slate-900">
          Fallon Odonto Care
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          {isSignUp ? 'Crie sua conta administrativa' : 'Acesse o painel administrativo'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label 
                htmlFor="email" 
                className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
              >
                E-mail
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/10 transition-all hover:border-slate-300"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
              >
                Senha
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/10 transition-all hover:border-slate-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs font-semibold text-gold-600 hover:text-gold-700 transition-colors"
              >
                {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gold-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-gold-600/20 hover:bg-gold-700 focus:outline-none focus:ring-4 focus:ring-gold-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <LogIn className="h-5 w-5" />
                {loading ? (isSignUp ? 'Criando...' : 'Entrando...') : (isSignUp ? 'Cadastrar' : 'Entrar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  );
}
