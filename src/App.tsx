/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import Patients from './components/patients/Patients';
import Agenda from './components/agenda/Agenda';
import Financeiro from './components/financeiro/Financeiro';
import Staff from './components/staff/Staff';
import Configuracoes from './components/configuracoes/Configuracoes';
import Login from './components/Login';
import { useAuth } from './contexts/AuthContext';
import { signIn } from './services/firebase';
import { Stethoscope } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A18] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Iniciando DenteCloud...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'pacientes':
        return <Patients />;
      case 'agenda':
        return <Agenda />;
      case 'financeiro':
        return <Financeiro />;
      case 'dentistas':
        return <Staff />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return (
          <div className="p-8 flex flex-col items-center justify-center h-full text-slate-400">
            <h2 className="text-2xl font-bold font-display uppercase tracking-widest opacity-20">Em Desenvolvimento</h2>
            <p className="mt-2 font-medium">A funcionalidade {activeTab} está sendo implementada.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="ml-[220px] flex-1 flex flex-col">
          <div className="flex-1">
            {renderContent()}
          </div>
          <footer className="p-8 pt-0 text-center pb-8">
            <p className="text-[12px] text-text-muted font-medium">
              © Developed by Felipe Nascimento
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

