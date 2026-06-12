/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import Patients from './components/patients/Patients';
import Agenda from './components/agenda/Agenda';
import Consultas from './components/consultas/Consultas';
import Financeiro from './components/financeiro/Financeiro';
import Staff from './components/staff/Staff';
import Configuracoes from './components/configuracoes/Configuracoes';
import Miscellaneous from './components/miscellaneous/Miscellaneous';
import Login from './components/auth/Login';
import { ToastProvider, useToast } from './components/ui/Toast';
import { onAuthStateChanged, signOut, auth, db } from './lib/firebase';
import { doc, getDocFromServer } from './lib/firebase';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [init, setInit] = useState(false);
  const [forceNewAppointment, setForceNewAppointment] = useState(false);
  const [preselectedPatient, setPreselectedPatient] = useState<any>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setInit(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!init) return null;

  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <Login onLogin={() => setIsAuthenticated(true)} />
      </ToastProvider>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'pacientes':
        return <Patients onNewAppointment={(patient) => {
          setPreselectedPatient(patient);
          setForceNewAppointment(true);
          setActiveTab('agenda');
        }} />;
      case 'agenda':
        return <Agenda 
          forceNewAppointment={forceNewAppointment} 
          preselectedPatient={preselectedPatient}
          onAppointmentHandled={() => {
            setForceNewAppointment(false);
            setPreselectedPatient(null);
          }} 
        />;
      case 'consultas':
        return <Consultas />;
      case 'financeiro':
        return <Financeiro />;
      case 'dentistas':
        return <Staff />;
      case 'miscellaneous':
        return <Miscellaneous />;
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
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout} 
          onScheduleAppointment={() => {
            setActiveTab('agenda');
            setForceNewAppointment(true);
          }}
        />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="ml-64 flex-1">
            {renderContent()}
          </main>
          <footer className="ml-64 pb-2 pt-12">
            <div className="px-8">
              <div className="w-full border-t border-slate-200 mb-2"></div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide text-center">
                © Developed by Felipe Nascimento
              </p>
            </div>
          </footer>
        </div>
      </div>
    </ToastProvider>
  );
}

