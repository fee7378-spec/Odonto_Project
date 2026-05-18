import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Plus, 
  CheckCircle2, 
  Info,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Monitor,
  ArrowLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SystemUser, PermissionTemplate } from '../../types';
import { dataService } from '../../services/dataService';

export default function AccessProfiles() {
  const [activeSubTab, setActiveSubTab] = useState<'usuarios' | 'templates'>('usuarios');
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    profile: '',
    permissions: {} as Record<string, 'none' | 'view' | 'edit'>
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const modules = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'agenda', name: 'Agenda' },
    { id: 'pacientes', name: 'Pacientes' },
    { id: 'financeiro', name: 'Financeiro' },
    { id: 'equipe', name: 'Equipe' },
    { id: 'acesso', name: 'Perfis de Acesso' },
    { id: 'config', name: 'Configurações' },
    { id: 'estoque', name: 'Estoque' },
    { id: 'prontuario', name: 'Prontuário Digital' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'relatorios', name: 'Relatórios' }
  ];

  useEffect(() => {
    const unsubUsers = dataService.subscribeUsers(setUsers);
    const unsubTemplates = dataService.subscribeTemplates(setTemplates);
    return () => {
      unsubUsers();
      unsubTemplates();
    };
  }, []);

  // Update form permissions when profile changes
  useEffect(() => {
    if (newUserForm.profile) {
      const template = templates.find(t => t.name === newUserForm.profile);
      if (template) {
        const newPerms: Record<string, 'none' | 'view' | 'edit'> = {};
        modules.forEach(m => {
          if (template.name === 'Administrador') {
            newPerms[m.id] = 'edit';
          } else if (template.name === 'Monitor') {
            newPerms[m.id] = ['dashboard', 'agenda', 'pacientes'].includes(m.id) ? 'edit' : 'view';
          } else {
            newPerms[m.id] = 'view';
          }
        });
        setNewUserForm(prev => ({ ...prev, permissions: newPerms }));
      }
    }
  }, [newUserForm.profile, templates]);

  const handleCreateUser = async () => {
    if (!newUserForm.name || !newUserForm.email || !newUserForm.profile) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create in Firebase Auth via API
      const authResponse = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newUserForm.email, name: newUserForm.name })
      });

      const authData = await authResponse.json();
      if (!authResponse.ok) throw new Error(authData.error || 'Erro ao criar usuário');

      // 2. Save to System Users DB
      const permissionsCount = Object.values(newUserForm.permissions).filter(p => p !== 'none').length;
      
      const userData: Omit<SystemUser, 'id'> = {
        name: newUserForm.name,
        email: newUserForm.email,
        profile: newUserForm.profile,
        permissionsCount,
        isCustomized: false,
        permissions: newUserForm.permissions
      };

      await dataService.addUser(userData);
      
      setIsAddingUser(false);
      setNewUserForm({ name: '', email: '', profile: '', permissions: {} });
      alert('Usuário criado com sucesso! Ele pode agora acessar clicando em "Esqueci minha senha" para criar sua credencial.');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermission = (moduleId: string, level: 'none' | 'view' | 'edit') => {
    setNewUserForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: level
      }
    }));
  };

  const [hasSyncedAdmin, setHasSyncedAdmin] = useState(false);

  // Handle ensuring current user is in the list
  useEffect(() => {
    // Only check if we have received a response from the database (even if empty)
    // We can assume if templates are also empty or users are being listened to, 
    // but the best way is to check the length and a local flag.
    
    const email = 'fee7378@gmail.com';
    const emailExists = users.some(u => u.email === email);
    
    if (!hasSyncedAdmin && users.length >= 0) {
      // If we've got the users list and our admin doesn't exist, add it
      if (users.length > 0 && !emailExists) {
        dataService.addUser({
          name: 'Felipe Nascimento',
          email: email,
          profile: 'Administrador',
          permissionsCount: 11,
          isCustomized: false,
          permissions: modules.reduce((acc: any, m) => ({ ...acc, [m.id]: 'edit' }), {})
        });
        setHasSyncedAdmin(true);
      } else if (users.length === 0 && !emailExists) {
        // Handle case where DB is completely empty
        // We wait a bit to ensure it's not just "loading"
        const timer = setTimeout(() => {
          if (users.length === 0) {
            dataService.addUser({
              name: 'Felipe Nascimento',
              email: email,
              profile: 'Administrador',
              permissionsCount: 11,
              isCustomized: false,
              permissions: modules.reduce((acc: any, m) => ({ ...acc, [m.id]: 'edit' }), {})
            });
            setHasSyncedAdmin(true);
          }
        }, 1000);
        return () => clearTimeout(timer);
      } else if (emailExists) {
        setHasSyncedAdmin(true);
      }
    }

    // Default templates if none exist
    if (templates.length === 0) {
      const initialTemplates: Omit<PermissionTemplate, 'id'>[] = [
        { name: 'Administrador', description: 'Acesso total ao sistema', editModulesCount: 11, viewModulesCount: 0 },
        { name: 'Monitor', description: 'Acesso padrão para monitores', editModulesCount: 3, viewModulesCount: 3 },
        { name: 'Visualização', description: "Perfil apenas para visualização dos KPI's", editModulesCount: 0, viewModulesCount: 4 }
      ];
      initialTemplates.forEach(t => dataService.addTemplate(t));
    }
  }, [users.length, templates.length]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAddingUser) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAddingUser(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </button>
          <div>
            <h1 className="text-3xl font-bold font-display text-text-main dark:text-white">Criar Novo Usuário</h1>
            <p className="text-text-muted mt-1">Configure as informações básicas e permissões</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="medical-card p-6 space-y-4">
              <h3 className="font-bold text-text-main dark:text-white uppercase tracking-widest text-[10px]">Informações Básicas</h3>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Nome Completo</label>
                <input 
                  type="text"
                  value={newUserForm.name}
                  onChange={e => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: João Silva"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-text-main dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">E-mail de Acesso</label>
                <input 
                  type="email"
                  value={newUserForm.email}
                  onChange={e => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="exemplo@email.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-text-main dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Perfil Sugerido</label>
                <select 
                  value={newUserForm.profile}
                  onChange={e => setNewUserForm(prev => ({ ...prev, profile: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-text-main dark:text-white"
                >
                  <option value="">Selecione um template...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="medical-card p-6 bg-primary/5 border-primary/20 border">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">Primeiro Acesso</p>
                  <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                    O sistema criará automaticamente uma conta no autenticador. O usuário deverá utilizar o e-mail cadastrado e clicar em <strong>"Esqueci minha senha"</strong> na tela de login para definir seu acesso.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="medical-card overflow-hidden">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="font-bold text-text-main dark:text-white uppercase tracking-widest text-[10px]">Permissões Detalhadas</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-sm"></div>
                    <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase">EDIÇÃO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-sky-400 rounded-sm"></div>
                    <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase">VISUALIZAÇÃO</span>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-border">
                {modules.map((module) => (
                  <div key={module.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-text-very-muted" />
                      </div>
                      <span className="font-bold text-sm text-text-main dark:text-slate-300">{module.name}</span>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                      <button 
                        onClick={() => handleUpdatePermission(module.id, 'edit')}
                        className={cn(
                          "px-3 py-1.5 text-[10px] font-bold rounded-md transition-all",
                          newUserForm.permissions[module.id] === 'edit' ? "bg-primary text-white shadow-sm" : "text-text-very-muted hover:text-text-muted"
                        )}
                      >
                        Edição
                      </button>
                      <button 
                        onClick={() => handleUpdatePermission(module.id, 'view')}
                        className={cn(
                          "px-3 py-1.5 text-[10px] font-bold rounded-md transition-all",
                          newUserForm.permissions[module.id] === 'view' ? "bg-sky-400 text-white shadow-sm" : "text-text-very-muted hover:text-text-muted"
                        )}
                      >
                        Visualização
                      </button>
                      <button 
                        onClick={() => handleUpdatePermission(module.id, 'none')}
                        className={cn(
                          "px-3 py-1.5 text-[10px] font-bold rounded-md transition-all",
                          newUserForm.permissions[module.id] === 'none' || !newUserForm.permissions[module.id] ? "bg-slate-200 dark:bg-slate-700 text-text-muted" : "text-text-very-muted hover:text-text-muted"
                        )}
                      >
                        Nenhum
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-border flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddingUser(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-text-muted hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-display uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleCreateUser}
                  disabled={loading}
                  className="bg-primary text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all font-display uppercase tracking-widest text-[10px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Finalizar e Criar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (editingUser) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setEditingUser(null)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </button>
          <div>
            <h1 className="text-3xl font-bold font-display text-text-main dark:text-white">Gerenciar Acesso</h1>
            <p className="text-text-muted mt-1">Configurando permissões para {editingUser.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="medical-card p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold mb-4">
                {editingUser.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-text-main dark:text-white">{editingUser.name}</h2>
              <p className="text-sm text-text-very-muted">{editingUser.email}</p>
              
              <div className="mt-6 w-full space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-transparent dark:border-border/50">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Perfil Atual</span>
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase">{editingUser.profile}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-transparent dark:border-border/50">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Personalizado</span>
                  <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", editingUser.isCustomized ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300" : "bg-slate-200 dark:bg-slate-800 text-text-muted")}>
                    {editingUser.isCustomized ? 'Sim' : 'Não'}
                  </span>
                </div>
              </div>
            </div>

            <div className="medical-card p-6">
              <h3 className="font-bold text-text-main dark:text-white mb-4">Alterar Template</h3>
              <div className="space-y-3">
                {templates.map(t => (
                  <button 
                    key={t.id}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all group",
                      editingUser.profile === t.name 
                        ? "border-primary bg-primary/5 ring-2 ring-primary/10" 
                        : "border-border hover:border-text-very-muted"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className={cn("font-bold text-sm", editingUser.profile === t.name ? "text-primary" : "text-text-main dark:text-slate-300")}>
                        {t.name}
                      </span>
                      {editingUser.profile === t.name && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="medical-card overflow-hidden">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="font-bold text-text-main dark:text-white uppercase tracking-widest text-[10px]">Permissões por Módulo</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-sm"></div>
                    <span className="text-[10px] font-bold text-text-muted">EDIÇÃO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-sky-400 rounded-sm"></div>
                    <span className="text-[10px] font-bold text-text-muted">VISUALIZAÇÃO</span>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-border">
                {modules.map((module) => (
                  <div key={module.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-text-very-muted" />
                      </div>
                      <span className="font-bold text-sm text-text-main dark:text-slate-300">{module.name}</span>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                      <button className="px-3 py-1.5 text-[10px] font-bold rounded-md transition-all bg-primary text-white shadow-sm">
                        Edição
                      </button>
                      <button className="px-3 py-1.5 text-[10px] font-bold rounded-md transition-all text-text-very-muted hover:text-text-muted">
                        Visualização
                      </button>
                      <button className="px-3 py-1.5 text-[10px] font-bold rounded-md transition-all text-text-very-muted hover:text-text-muted">
                        Nenhum
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-border flex justify-end gap-3">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-text-muted hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-display uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </button>
                <button 
                  className="bg-primary text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all font-display uppercase tracking-widest text-[10px]"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-text-main dark:text-white">Perfis de acesso</h1>
          <p className="text-text-muted mt-1">Gerencie as permissões individuais de cada usuário</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAddingUser(true)}
            className="bg-primary hover:opacity-90 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-primary/20 font-display uppercase tracking-wider text-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar novo usuário</span>
          </button>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveSubTab('usuarios')}
            className={cn(
              "pb-4 text-sm font-bold transition-all relative",
              activeSubTab === 'usuarios' ? "text-primary" : "text-text-muted hover:text-text-main"
            )}
          >
            Usuários
            {activeSubTab === 'usuarios' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveSubTab('templates')}
            className={cn(
              "pb-4 text-sm font-bold transition-all relative",
              activeSubTab === 'templates' ? "text-primary" : "text-text-muted hover:text-text-main"
            )}
          >
            Templates
            {activeSubTab === 'templates' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
          </button>
        </div>
      </div>

      {activeSubTab === 'usuarios' ? (
        <div className="space-y-6">
          <div className="relative group max-w-4xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-very-muted" />
            <input 
              type="text" 
              placeholder="Buscar usuário por nome, e-mail ou login..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm text-text-main dark:text-white"
            />
          </div>

          <div className="medical-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">USUÁRIO</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">PERFIL</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">STATUS PERMISSÕES</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main dark:text-white leading-tight">{user.name}</p>
                          <p className="text-xs text-text-very-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-text-muted px-2 py-1 rounded-md uppercase tracking-widest border border-border flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full border border-text-very-muted" />
                          {user.profile}
                        </span>
                        {user.isCustomized && (
                          <span className="bg-purple-100 dark:bg-purple-900/40 text-[10px] font-bold text-purple-600 dark:text-purple-300 px-2 py-1 rounded-md uppercase tracking-widest">
                            CUSTOMIZADO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold text-primary dark:text-primary">
                        {user.permissionsCount} permissões ativas
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-4">
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                        >
                          Gerenciar
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => dataService.deleteUser(user.id)}
                          className="p-2 text-text-very-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-display text-text-main dark:text-white">Templates de Permissão</h2>
            <button className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" />
              Novo Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="medical-card p-6 group transition-all hover:translate-y-[-4px] hover:shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-text-main dark:text-white">{template.name}</h3>
                    <p className="text-xs text-text-very-muted mt-1">{template.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-text-very-muted hover:text-primary transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-text-very-muted hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-auto">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-text-muted">Módulos com edição:</span>
                    <span className={cn(template.editModulesCount > 0 ? "text-primary" : "text-text-very-muted")}>{template.editModulesCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-text-muted">Módulos com visualização:</span>
                    <span className={cn(template.viewModulesCount > 0 ? "text-sky-400" : "text-text-very-muted")}>{template.viewModulesCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
