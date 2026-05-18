import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Smartphone, Globe, Palette, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

export default function Configs() {
  const [activeTab, setActiveTab] = useState('Geral');
  const { primaryColor, setPrimaryColor, isDarkMode, toggleDarkMode } = useTheme();

  const colors = [
    { id: 'sky', bg: 'bg-sky-600', shadow: 'shadow-sky-100', ring: 'ring-sky-500' },
    { id: 'indigo', bg: 'bg-indigo-600', shadow: 'shadow-indigo-100', ring: 'ring-indigo-500' },
    { id: 'emerald', bg: 'bg-emerald-600', shadow: 'shadow-emerald-100', ring: 'ring-emerald-500' },
    { id: 'rose', bg: 'bg-rose-600', shadow: 'shadow-rose-100', ring: 'ring-rose-500' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Geral':
        return (
          <div className="medical-card p-6">
            <h3 className="font-bold text-text-main text-lg mb-6 dark:text-white">Informações da Clínica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Nome da Clínica" placeholder="Clínica Sorriso Moderno" />
              <InputGroup label="CNPJ" placeholder="00.000.000/0001-00" />
              <InputGroup label="Responsável Técnico" placeholder="Dr. Roberto Santos" />
              <InputGroup label="CRO Responsável" placeholder="12345-SP" />
              <div className="md:col-span-2">
                <InputGroup label="Endereço" placeholder="Av. Paulista, 1000 - São Paulo, SP" />
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-border flex justify-end">
              <button 
                onClick={() => alert('Informações salvas com sucesso!')}
                className="bg-primary text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all font-display uppercase tracking-wider"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        );
      case 'Aparência':
        return (
          <div className="medical-card p-6">
            <h3 className="font-bold text-text-main text-lg mb-6 dark:text-white">Personalização de Cores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Cor Primária</label>
                <div className="flex items-center gap-4 mt-3">
                  {colors.map((c) => (
                    <div 
                      key={c.id}
                      onClick={() => setPrimaryColor(c.id as any)}
                      className={`
                        w-12 h-12 rounded-2xl cursor-pointer transition-all flex items-center justify-center
                        ${c.bg} ${primaryColor === c.id ? `ring-4 ring-offset-2 ${c.ring} shadow-xl scale-110` : 'hover:scale-105 opacity-80'}
                      `}
                    >
                      {primaryColor === c.id && <Check className="w-6 h-6 text-white" />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Modo Noturno</label>
                <div 
                  onClick={toggleDarkMode}
                  className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-border cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface dark:bg-slate-800 flex items-center justify-center shadow-sm border border-border">
                      <Palette className={`w-6 h-6 ${isDarkMode ? 'text-amber-400' : 'text-text-very-muted'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-main dark:text-white">Modo Escuro</p>
                      <p className="text-[10px] text-text-muted font-medium">Tema {isDarkMode ? 'atualmente ativo' : 'desativado'}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-14 h-8 rounded-full relative transition-all duration-300 p-1",
                    isDarkMode ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                  )}>
                    <div className={cn(
                      "w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform",
                      isDarkMode ? 'translate-x-6' : 'translate-x-0'
                    )}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="medical-card p-12 flex flex-col items-center justify-center text-center opacity-50">
            <SettingsIcon className="w-12 h-12 text-slate-300 mb-4" />
            <p className="font-medium text-slate-500">Funcionalidade de {activeTab} em desenvolvimento...</p>
          </div>
        );
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold font-display text-text-main dark:text-white">Configurações</h1>
        <p className="text-text-muted mt-1">Personalize o sistema e gerencie preferências.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-3">
          <ConfigNav onClick={() => setActiveTab('Geral')} active={activeTab === 'Geral'} icon={Globe} label="Geral" />
          <ConfigNav onClick={() => setActiveTab('Aparência')} active={activeTab === 'Aparência'} icon={Palette} label="Aparência" />
          <ConfigNav onClick={() => setActiveTab('Notificações')} active={activeTab === 'Notificações'} icon={Bell} label="Notificações" />
          <ConfigNav onClick={() => setActiveTab('Segurança')} active={activeTab === 'Segurança'} icon={Shield} label="Segurança" />
          <ConfigNav onClick={() => setActiveTab('Integrações')} active={activeTab === 'Integrações'} icon={Smartphone} label="Integrações" />
        </div>

        <div className="lg:col-span-3 space-y-8">
          {renderContent()}

          <div className="medical-card p-6">
            <h3 className="font-bold text-text-main text-lg mb-4 dark:text-white">Logo e Identidade</h3>
            <p className="text-sm text-text-muted mb-6 font-medium">Esta logo será exibida nos orçamentos e recibos emitidos pelo sistema.</p>
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-border flex flex-col items-center justify-center text-text-very-muted gap-2 cursor-pointer hover:bg-primary/5 hover:border-primary hover:text-primary transition-all group">
                <SettingsIcon className="w-6 h-6 opacity-40 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-bold text-text-main dark:text-slate-300">Requisitos da Imagem</p>
                <ul className="text-xs text-text-muted space-y-1 ml-4 list-disc font-medium">
                  <li>Formato: PNG ou SVG</li>
                  <li>Tamanho máximo: 2MB</li>
                  <li>Resolução recomendada: 400x400px</li>
                  <li>Fundo transparente recomendado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigNav({ icon: Icon, label, active, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`
      flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all cursor-pointer font-bold text-sm group
      ${active ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'text-text-muted hover:bg-slate-50 dark:hover:bg-slate-900/50 dark:text-text-muted dark:hover:text-text-main'}
    `}>
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-text-very-muted'}`} />
      <span>{label}</span>
    </div>
  );
}

function InputGroup({ label, placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">{label}</label>
      <input 
        type="text" 
        placeholder={placeholder}
        className="w-full bg-white dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-text-main dark:text-white"
      />
    </div>
  );
}

