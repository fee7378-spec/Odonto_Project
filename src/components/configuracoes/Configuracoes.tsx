import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Smartphone, Globe, Palette, Users } from 'lucide-react';
import { useToast } from '../ui/Toast';

export default function Configs() {
  const { addToast } = useToast();
  const [activeConfig, setActiveConfig] = useState('Geral');

  const renderContent = () => {
    switch (activeConfig) {
      case 'Geral':
        return (
          <div className="medical-card p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-6">Informações da Clínica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Nome da Clínica" placeholder="Clínica Sorriso Moderno" />
              <InputGroup label="CNPJ" placeholder="00.000.000/0001-00" />
              <InputGroup label="Responsável Técnico" placeholder="Dr. Roberto Santos" />
              <InputGroup label="CRO Responsável" placeholder="12345-SP" />
              <div className="md:col-span-2">
                <InputGroup label="Endereço" placeholder="Av. Paulista, 1000 - São Paulo, SP" />
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => addToast('Alterações salvas com sucesso!', 'success')}
                className="bg-gold-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-gold-100 hover:bg-gold-700 transition-all"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        );
      case 'Aparência':
        return <div className="medical-card p-6 text-slate-500">Configurações de Aparência (Em breve)</div>;
      case 'Segurança':
        return <div className="medical-card p-6 text-slate-500">Configurações de Segurança (Em breve)</div>;
      case 'Perfis de Acesso':
        return <AccessProfiles />;
      default:
        return null;
    }
  };

  const AccessProfiles = () => {
    const [subTab, setSubTab] = useState('Usuários');
    return (
      <div className="medical-card p-6">
        <h3 className="font-bold text-slate-900 text-lg mb-6">Perfis de Acesso</h3>
        <div className="flex gap-4 mb-6 border-b border-slate-100">
          {['Usuários', 'Templates'].map(tab => (
            <button 
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`text-sm font-bold pb-2 ${subTab === tab ? 'text-gold-600 border-b-2 border-gold-600' : 'text-slate-500 hover:text-gold-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="text-sm text-slate-500">Gestão de {subTab} (Em breve)</div>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold font-display text-slate-900">Configurações</h1>
        <p className="text-slate-500 mt-1">Personalize o sistema e gerencie preferências.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          <ConfigNav active={activeConfig === 'Geral'} icon={Globe} label="Geral" onClick={() => setActiveConfig('Geral')} />
          <ConfigNav active={activeConfig === 'Aparência'} icon={Palette} label="Aparência" onClick={() => setActiveConfig('Aparência')} />
          <ConfigNav active={activeConfig === 'Segurança'} icon={Shield} label="Segurança" onClick={() => setActiveConfig('Segurança')} />
          <ConfigNav active={activeConfig === 'Perfis de Acesso'} icon={Users} label="Perfis de Acesso" onClick={() => setActiveConfig('Perfis de Acesso')} />
        </div>

        <div className="lg:col-span-3 space-y-8">
          {renderContent()}
          {activeConfig === 'Geral' && (
            <div className="medical-card p-6">
              <h3 className="font-bold text-slate-900 text-lg mb-4">Logo e Identidade</h3>
              <p className="text-sm text-slate-400 mb-6 font-medium">Esta logo será exibida nos orçamentos e recibos emitidos pelo sistema.</p>
              <div className="flex items-center gap-8">
                <div 
                  onClick={() => addToast('Abrindo gerenciador de arquivos...', 'info')}
                  className="w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:bg-gold-50 hover:border-gold-200 hover:text-gold-600 transition-all"
                >
                  <SettingsIcon className="w-6 h-6 opacity-40" />
                  <span className="text-[10px] font-bold uppercase">Upload</span>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-bold text-slate-700">Requisitos da Imagem</p>
                  <ul className="text-xs text-slate-400 space-y-1 ml-4 list-disc font-medium">
                    <li>Formato: PNG ou SVG</li>
                    <li>Tamanho máximo: 2MB</li>
                    <li>Resolução recomendada: 400x400px</li>
                    <li>Fundo transparente recomendado</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
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
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium
      ${active ? 'bg-gold-600 text-white shadow-lg shadow-gold-100' : 'text-slate-500 hover:bg-slate-50'}
    `}>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </div>
  );
}

function InputGroup({ label, placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type="text" 
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all font-medium"
      />
    </div>
  );
}
