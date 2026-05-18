import React from 'react';
import { Search, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Navbar() {
  const { userData } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const formatRole = (role: string) => {
    if (!role) return '';
    if (role === 'admin') return 'Administrador';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-end px-8 sticky top-0 z-30 ml-[220px] transition-all">
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border text-text-muted hover:text-primary transition-all"
          title={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-bold text-text-main dark:text-slate-200">
              {userData?.name || 'Usuário'}
            </p>
            <p className="text-[11px] text-text-muted font-medium">
              {formatRole(userData?.role)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm shadow-xl shadow-primary/30">
            {getInitials(userData?.name || 'U')}
          </div>
        </div>
      </div>
    </header>
  );
}
