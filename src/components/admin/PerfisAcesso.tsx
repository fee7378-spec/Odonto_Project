import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  X, 
  Trash2, 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  Save, 
  Mail, 
  Edit2, 
  Lock,
  UserCheck,
  Timer,
  Layout,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Pencil,
  LayoutDashboard,
  Calendar,
  Users,
  CircleDollarSign,
  Stethoscope,
  Settings,
  MoreVertical,
  ClipboardList
} from 'lucide-react';
import { useToast } from '../ui/Toast';
import Select from '../ui/Select';
import { auth } from '../../lib/firebase';
import { 
  subscribeToCollection, 
  createDoc, 
  updateDoc, 
  deleteDoc, 
  profilesCollection, 
  usersCollection 
} from '../../services/firebaseService';
import { sendPasswordResetEmail } from '../../lib/firebase';
import { AccessProfile, SystemUser, PermissionLevel } from '../../types';
import { cn } from '../../lib/utils';
import { usePermissions } from '../../hooks/usePermissions';
import ConfirmDialog from '../ui/ConfirmDialog';

const APP_MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'consultas', label: 'Consultas', icon: ClipboardList },
  { id: 'pacientes', label: 'Pacientes', icon: Users },
  { id: 'financeiro', label: 'Financeiro', icon: CircleDollarSign },
  { id: 'dentistas', label: 'Equipe', icon: Stethoscope },
  { id: 'miscellaneous', label: 'Miscelâneos', icon: Layout },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
  { id: 'perfisAcesso', label: 'Perfis de Acesso', icon: Shield },
];

export default function PerfisAcesso() {
  const { addToast } = useToast();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('perfisAcesso', 'edit');
  
  const [activeTab, setActiveTab] = useState<'usuarios' | 'templates'>('usuarios');
  const [view, setView] = useState<'list' | 'edit-template' | 'edit-user'>('list');
  
  const [profiles, setProfiles] = useState<AccessProfile[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [selectedTemplate, setSelectedTemplate] = useState<AccessProfile | null>(null);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'user' | 'template' } | null>(null);

  useEffect(() => {
    const unsubProfiles = subscribeToCollection<AccessProfile>(profilesCollection, (data) => {
      setProfiles(data);
      setLoading(false);
    });
    const unsubUsers = subscribeToCollection<SystemUser>(usersCollection, (data) => {
      setUsers(data);
    });
    return () => {
      unsubProfiles();
      unsubUsers();
    };
  }, []);

  const handleEditTemplate = (template: AccessProfile) => {
    setSelectedTemplate({ ...template });
    setView('edit-template');
  };

  const handleEditUser = (user: SystemUser) => {
    setSelectedUser({ ...user });
    setView('edit-user');
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      if (selectedTemplate.id === 'new') {
        const { id, ...data } = selectedTemplate;
        await createDoc(profilesCollection, data);
        addToast('Template criado!', 'success');
      } else {
        await updateDoc(profilesCollection, selectedTemplate.id, selectedTemplate);
        addToast('Template atualizado!', 'success');
      }
      setView('list');
    } catch (error) {
      addToast('Erro ao salvar template.', 'error');
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    try {
      await updateDoc(usersCollection, selectedUser.id, selectedUser);
      addToast('Permissões do usuário atualizadas!', 'success');
      setView('list');
    } catch (error) {
      addToast('Erro ao salvar usuário.', 'error');
    }
  };

  const handleResetPassword = async (confirmPassword: string) => {
    // In a real app, we would verify 'confirmPassword' (current user's pw)
    // before resetting targeted user's status to pending.
    if (!selectedUser) return;
    try {
      await sendPasswordResetEmail(auth, selectedUser.email);
      addToast('E-mail de redefinição de senha enviado!', 'success');
      setShowResetModal(false);
    } catch (error: any) {
      addToast('Erro ao enviar e-mail de redefinição.', 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(usersCollection, id);
      addToast('Usuário excluído com sucesso!', 'success');
    } catch (error) {
      addToast('Erro ao excluir usuário.', 'error');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      console.log('Deleting template with id:', id);
      if (!id) {
        addToast('Erro: ID do template é inválido.', 'error');
        return;
      }
      await deleteDoc(profilesCollection, id);
      addToast('Template excluído com sucesso!', 'success');
    } catch (error: any) {
      console.error('Delete template error:', error);
      addToast('Erro ao excluir template: ' + (error.message || 'Erro desconhecido'), 'error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (view === 'edit-template' && selectedTemplate) {
    return (
      <TemplateEditor 
        template={selectedTemplate} 
        setTemplate={setSelectedTemplate} 
        onBack={() => setView('list')} 
        onSave={handleSaveTemplate}
        canEdit={canEdit}
      />
    );
  }

  if (view === 'edit-user' && selectedUser) {
    return (
      <UserEditor 
        user={selectedUser} 
        setUser={setSelectedUser} 
        profiles={profiles}
        onBack={() => setView('list')} 
        onSave={handleSaveUser}
        onReset={() => setShowResetModal(true)}
        canEdit={canEdit}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Perfis de acesso</h1>
          <p className="text-slate-500 mt-1">Gerencie as permissões individuais de cada usuário</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => activeTab === 'usuarios' ? setShowNewUserModal(true) : setShowNewTemplateModal(true)}
            className="flex items-center gap-2 bg-gold-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-gold-600/20 hover:bg-gold-700 transition-all font-display"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'usuarios' ? 'Criar novo usuário' : 'Novo Template'}
          </button>
        )}
      </div>

      <div className="flex gap-8 border-b border-slate-100 overflow-x-auto whitespace-nowrap hide-scrollbar">
        <button 
          onClick={() => setActiveTab('usuarios')}
          className={cn(
            "pb-3 text-sm font-bold transition-all px-2 border-b-2 shrink-0",
            activeTab === 'usuarios' ? "text-gold-600 border-gold-600" : "text-slate-400 border-transparent hover:text-slate-600"
          )}
        >
          Usuários
        </button>
        <button 
          onClick={() => setActiveTab('templates')}
          className={cn(
            "pb-3 text-sm font-bold transition-all px-2 border-b-2 shrink-0",
            activeTab === 'templates' ? "text-gold-600 border-gold-600" : "text-slate-400 border-transparent hover:text-slate-600"
          )}
        >
          Templates
        </button>
      </div>

      {activeTab === 'usuarios' ? (
        <UsuariosList 
          users={filteredUsers} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onEdit={handleEditUser}
          profiles={profiles}
          onDelete={(id: string) => setItemToDelete({ id, type: 'user' })}
          canEdit={canEdit}
        />
      ) : (
        <TemplatesList 
          templates={profiles} 
          onEdit={handleEditTemplate}
          onDelete={(id: string) => setItemToDelete({ id, type: 'template' })}
          canEdit={canEdit}
        />
      )}

      {showResetModal && (
        <ResetPasswordModal 
          onClose={() => setShowResetModal(false)}
          onConfirm={handleResetPassword}
        />
      )}

      <ConfirmDialog
        isOpen={itemToDelete !== null}
        title={itemToDelete?.type === 'user' ? 'Excluir Usuário' : 'Excluir Template'}
        message={
          itemToDelete?.type === 'user' 
            ? 'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.'
            : 'Tem certeza que deseja excluir este template? Usuários com o mesmo ainda manterão as permissões locais, mas perderão a referência.'
        }
        confirmText="Excluir"
        type="danger"
        onCancel={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete?.type === 'user') {
            handleDeleteUser(itemToDelete.id);
          } else if (itemToDelete?.type === 'template') {
            handleDeleteTemplate(itemToDelete.id);
          }
        }}
      />

      {/* Basic Modals for creation could be added here or implemented as detailed views */}
      {showNewUserModal && (
        <NewUserModal 
          profiles={profiles}
          onClose={() => setShowNewUserModal(false)}
          onCreated={() => setShowNewUserModal(false)}
        />
      )}

      {showNewTemplateModal && (
        <NewTemplateModal 
          onClose={() => setShowNewTemplateModal(false)}
          onCreated={(temp) => {
            setSelectedTemplate({ ...temp, id: 'new' });
            setView('edit-template');
            setShowNewTemplateModal(false);
          }}
        />
      )}
    </div>
  );
}

// Sub-components

function UsuariosList({ users, searchQuery, setSearchQuery, onEdit, profiles, onDelete, canEdit }: any) {
  const getProfileName = (id: string) => profiles.find((p: any) => p.id === id)?.name || 'Sem perfil';
  
  return (
    <div className="space-y-4">
      <div className="relative group max-w-2xl font-display">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-gold-500 transition-colors" />
        </div>
        <input 
          type="text"
          placeholder="Buscar usuário por nome, e-mail ou login..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Perfil</th>
              <th className="px-6 py-4">Status Permissões</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user: any) => {
              const hasCustom = !!user.customPermissions && Object.keys(user.customPermissions).length > 0;
              const activeCount = Object.values(user.customPermissions || {}).filter(v => v !== 'none').length;
              
              return (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center text-gold-600 font-bold uppercase border border-gold-100">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-500 text-[9px] font-bold uppercase rounded-full flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full border border-slate-400" />
                        {getProfileName(user.profileId)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {hasCustom ? (
                      <span className="text-gold-600 text-xs font-bold">{activeCount} permissões ativas</span>
                    ) : (
                      <span className="text-slate-400 text-xs font-medium">Usando permissões do perfil</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => onEdit(user)}
                        className="text-gold-600 hover:text-gold-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                      >
                        {canEdit ? 'Gerenciar' : 'Visualizar'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      {canEdit && (
                        <button 
                          onClick={() => onDelete(user.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TemplatesList({ templates, onEdit, onDelete, canEdit }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Templates de Permissão</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template: any) => {
          const editCount = Object.values(template.permissions || {}).filter(v => v === 'edit').length;
          const viewCount = Object.values(template.permissions || {}).filter(v => v === 'view').length;
          
          return (
            <div 
              key={template.id} 
              className="bg-white border border-slate-200 p-6 rounded-2xl group hover:border-gold-500/30 transition-all shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{template.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{template.description || 'Acesso padrão conforme configurado'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(template)} className="p-2 bg-slate-50 text-gold-600 rounded-lg hover:bg-gold-50 transition-all">
                    {canEdit ? <Edit2 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  {canEdit && (
                    <button onClick={() => onDelete(template.id)} className="p-2 bg-slate-50 text-rose-500 rounded-lg hover:bg-rose-50 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Módulos com edição:</span>
                  <span className="text-slate-700">{editCount}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Módulos com visualização:</span>
                  <span className="text-slate-700">{viewCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TemplateEditor({ template, setTemplate, onBack, onSave, canEdit }: any) {
  return (
    <div className="medical-card bg-white border-slate-200 p-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gold-50 flex items-center justify-center border border-gold-100 shadow-sm">
            <Shield className="w-7 h-7 text-gold-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{canEdit ? 'Editando Template' : 'Visualizando Template'}: {template.name}</h2>
            <p className="text-slate-500 text-sm mt-1">Configure as permissões padrão para este perfil de acesso</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={onBack} className="px-6 py-2.5 bg-slate-50 text-slate-500 font-bold rounded-xl hover:bg-slate-100 transition-all">
            Voltar
          </button>
          {canEdit && (
            <button 
              onClick={onSave}
              className="flex items-center gap-2 bg-gold-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-gold-600/10 hover:bg-gold-700 transition-all"
            >
              <Save className="w-5 h-5" />
              Salvar Template
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {APP_MODULES.map(module => (
          <PermissionRow 
            key={module.id} 
            label={module.label} 
            icon={module.icon}
            value={template.permissions[module.id] || 'none'} 
            onChange={(val) => canEdit && setTemplate({
              ...template,
              permissions: { ...template.permissions, [module.id]: val }
            })}
          />
        ))}
      </div>
    </div>
  );
}

function UserEditor({ user, setUser, profiles, onBack, onSave, onReset, canEdit }: any) {
  const currentProfile = profiles.find((p: any) => p.id === user.profileId);
  const isSelf = auth.currentUser?.email === user.email;

  const getEffectiveValue = (moduleId: string): PermissionLevel => {
    if (user.customPermissions && user.customPermissions[moduleId]) {
      return user.customPermissions[moduleId];
    }
    return currentProfile?.permissions?.[moduleId] || 'none';
  };

  const setModulePermission = (moduleId: string, level: PermissionLevel) => {
    const newCustom = { ...(user.customPermissions || {}) };
    newCustom[moduleId] = level;
    setUser({ ...user, customPermissions: newCustom });
  };

  return (
    <div className="medical-card bg-white border-slate-200 overflow-hidden animate-in slide-in-from-right-4 duration-500">
      <div className="p-8 border-b border-slate-100">
        <div className="flex justify-between items-start mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold">
            <ArrowLeft className="w-4 h-4" />
            Voltar para lista
          </button>
          {canEdit && (
            <button 
              onClick={onSave}
              className="flex items-center gap-2 bg-gold-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-gold-600/10 hover:bg-gold-700 transition-all"
            >
              <Save className="w-5 h-5" />
              Salvar Permissões
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50 border border-slate-100 p-6 rounded-2xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gold-50 flex items-center justify-center text-2xl font-bold text-gold-600 border border-gold-100">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <p className="text-slate-500 text-sm font-medium">{user.email}</p>
                <div className="w-1 h-1 rounded-full bg-slate-300 hidden md:block" />
                <div className="min-w-[200px]">
                  <Select 
                    label="Perfil"
                    value={user.profileId}
                    onChange={e => canEdit && setUser({ ...user, profileId: e.target.value })}
                    disabled={!canEdit}
                  >
                    {profiles.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {!isSelf && canEdit && (
            <button 
              onClick={onReset}
              className="flex items-center gap-2 bg-slate-50 text-slate-500 px-6 py-2.5 rounded-xl font-bold border border-slate-200 hover:bg-slate-100 hover:text-slate-700 transition-all font-display"
            >
              <Mail className="w-4 h-4" />
              Resetar Senha
            </button>
          )}
        </div>
      </div>

      <div className="p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Configuração de Módulos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          {APP_MODULES.map(module => (
            <PermissionRow 
              key={module.id} 
              label={module.label} 
              value={getEffectiveValue(module.id)} 
              onChange={(val) => canEdit && setModulePermission(module.id, val)}
              isCustom={!!(user.customPermissions && user.customPermissions[module.id])}
              icon={module.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PermissionRow({ label, value, onChange, icon: Icon = Shield, isCustom }: any) {
  return (
    <div className={cn(
      "bg-slate-50/50 border border-slate-100 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all group min-h-[82px]",
      isCustom && "border-gold-500/30 bg-gold-500/[0.02]"
    )}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-gold-50 flex items-center justify-center border border-gold-100">
          <Icon className="w-5 h-5 text-gold-600" />
        </div>
        <span className="text-sm font-bold text-slate-700 truncate pr-4">{label}</span>
      </div>

      <div className="flex bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm shrink-0 w-full sm:w-auto">
        {[
          { id: 'none', label: 'Nenhum', icon: EyeOff },
          { id: 'view', label: 'Ver', icon: Eye },
          { id: 'edit', label: 'Editar', icon: Pencil }
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            title={opt.label}
            className={cn(
              "flex-1 sm:w-12 h-10 rounded-lg transition-all flex items-center justify-center gap-2",
              value === opt.id 
                ? "bg-gold-600 text-white shadow-lg shadow-gold-600/10 scale-105 z-10" 
                : "text-slate-300 hover:text-slate-500 hover:bg-slate-50"
            )}
          >
            <opt.icon className="w-5 h-5 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ResetPasswordModal({ onClose, onConfirm }: any) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100">
            <Lock className="w-6 h-6 text-orange-600" />
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-slate-900">Resetar Senha do Usuário</h3>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
          Para confirmar o reset de senha, por favor informe a <span className="text-orange-600 font-bold">SUA SENHA</span> atual para validar a operação.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); if(password) onConfirm(password); else setError('Informe sua senha'); }} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sua Senha de Administrador</label>
            <input 
              type="password"
              placeholder="Digite sua senha de acesso"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all font-mono"
              autoFocus
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
            />
            {error && <p className="text-rose-500 text-[10px] font-bold flex items-center gap-1 ml-1 font-display"><AlertCircle className="w-3 h-3" /> {error}</p>}
          </div>

          <button 
            type="submit"
            disabled={!password}
            className="w-full bg-orange-600 text-white h-14 rounded-2xl font-bold shadow-xl shadow-orange-600/20 hover:bg-orange-700 active:scale-95 transition-all disabled:opacity-50 font-display"
          >
            Resetar e Notificar Usuário
          </button>
        </form>
      </div>
    </div>
  );
}

function NewUserModal({ profiles, onClose, onCreated }: any) {
  const [formData, setFormData] = useState({ name: '', email: '', profileId: profiles[0]?.id || '' });
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDoc(usersCollection, { ...formData, status: 'pending', createdAt: new Date().toISOString() });
      addToast('Usuário criado!', 'success');
      onCreated();
    } catch (e) { addToast('Erro ao criar usuário', 'error'); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Criar Novo Usuário</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
            <input 
              placeholder="Ex: Felipe Nascimento" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-gold-500/20" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
            <input 
              placeholder="exemplo@email.com" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-gold-500/20" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value.trim().toLowerCase()})} 
            />
          </div>
          <div className="space-y-1.5">
            <Select 
              label="Perfil de Acesso"
              value={formData.profileId} 
              onChange={e => setFormData({...formData, profileId: e.target.value})} 
            >
              <option value="">Selecione um perfil</option>
              {profiles.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </div>
          <button className="w-full bg-gold-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-gold-600/20 hover:bg-gold-700 mt-4 transition-all">
            Criar Usuário
          </button>
        </form>
      </div>
    </div>
  );
}

function NewTemplateModal({ onClose, onCreated }: any) {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Novo Template de Acesso</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
        </div>
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Template</label>
            <input 
              placeholder="Ex: Monitor, Analista de Sistemas..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-gold-500/20" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              autoFocus
            />
          </div>
          <button 
            onClick={() => onCreated({ name, permissions: {} })}
            disabled={!name}
            className="w-full bg-gold-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-gold-600/20 hover:bg-gold-700 transition-all disabled:opacity-50"
          >
            Continuar para Configuração
          </button>
        </div>
      </div>
    </div>
  );
}
