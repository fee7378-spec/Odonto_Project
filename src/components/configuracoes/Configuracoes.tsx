import React from 'react';
import { Settings as SettingsIcon, Bell, Shield, Smartphone, Globe, Palette } from 'lucide-react';

export default function Configs() {
  const [activeTab, setActiveTab] = React.useState('Geral');

  const renderContent = () => {
    switch (activeTab) {
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
              <button className="bg-sky-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all">
                Salvar Alterações
              </button>
            </div>
          </div>
        );
      case 'Aparência':
        return (
          <div className="medical-card p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-6">Personalização de Cores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cor Primária</label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-lg bg-sky-600 shadow-lg shadow-sky-100 italic cursor-pointer ring-2 ring-sky-500 ring-offset-2"></div>
                  <div className="w-10 h-10 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-100 cursor-pointer"></div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 shadow-lg shadow-emerald-100 cursor-pointer"></div>
                  <div className="w-10 h-10 rounded-lg bg-rose-600 shadow-lg shadow-rose-100 cursor-pointer"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-bold text-slate-700">Modo Escuro</span>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
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
        <h1 className="text-3xl font-bold font-display text-slate-900">Configurações</h1>
        <p className="text-slate-500 mt-1">Personalize o sistema e gerencie preferências.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          <ConfigNav onClick={() => setActiveTab('Geral')} active={activeTab === 'Geral'} icon={Globe} label="Geral" />
          <ConfigNav onClick={() => setActiveTab('Aparência')} active={activeTab === 'Aparência'} icon={Palette} label="Aparência" />
          <ConfigNav onClick={() => setActiveTab('Notificações')} active={activeTab === 'Notificações'} icon={Bell} label="Notificações" />
          <ConfigNav onClick={() => setActiveTab('Segurança')} active={activeTab === 'Segurança'} icon={Shield} label="Segurança" />
          <ConfigNav onClick={() => setActiveTab('Integrações')} active={activeTab === 'Integrações'} icon={Smartphone} label="Integrações" />
        </div>

        <div className="lg:col-span-3 space-y-8">
          {renderContent()}

          <div className="medical-card p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Logo e Identidade</h3>
            <p className="text-sm text-slate-400 mb-6 font-medium">Esta logo será exibida nos orçamentos e recibos emitidos pelo sistema.</p>
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 transition-all">
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
      ${active ? 'bg-sky-600 text-white shadow-lg shadow-sky-100' : 'text-slate-500 hover:bg-slate-50'}
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
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
      />
    </div>
  );
}
