import React from 'react';
import type { User } from '../types';
import { EyeIcon, LogoutIcon, UserGroupIcon, ClipboardListIcon, ChartBarIcon, ArchiveBoxIcon } from './Icons';

type AdminView = 'dashboard' | 'adminPanel' | 'metrics' | 'archive';

interface NavButtonProps {
    view: AdminView,
    label: string,
    children: React.ReactNode,
    currentView: AdminView;
    onSwitchView: (view: AdminView) => void;
}

const NavButton: React.FC<NavButtonProps> = ({ view, label, children, currentView, onSwitchView }) => (
     <button 
        onClick={() => onSwitchView(view)}
        aria-pressed={currentView === view}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${currentView === view ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
      >
        {children}
        <span>{label}</span>
      </button>
);

interface HeaderProps {
  user: User;
  onLogout: () => void;
  currentView: AdminView;
  onSwitchView: (view: AdminView) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, currentView, onSwitchView }) => {
  const getRoleName = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'lab': return 'Laboratorio';
      case 'branch': return 'Sucursal';
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-20">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <EyeIcon className="h-10 w-10 text-sky-600" />
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Optica Schellhas <span className="font-light">Seguimiento de Trabajos</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role === 'branch' ? user.branchName : getRoleName(user.role)}</p>
            </div>
            
            {user.role === 'admin' && (
              <div className="flex items-center bg-slate-100 rounded-lg p-1 space-x-1">
                <NavButton view="metrics" label="Métricas" currentView={currentView} onSwitchView={onSwitchView}>
                  <ChartBarIcon className="w-5 h-5"/>
                </NavButton>
                <NavButton view="dashboard" label="Trabajos" currentView={currentView} onSwitchView={onSwitchView}>
                  <ClipboardListIcon className="w-5 h-5"/>
                </NavButton>
                <NavButton view="archive" label="Archivo" currentView={currentView} onSwitchView={onSwitchView}>
                    <ArchiveBoxIcon className="w-5 h-5"/>
                </NavButton>
                <NavButton view="adminPanel" label="Usuarios" currentView={currentView} onSwitchView={onSwitchView}>
                  <UserGroupIcon className="w-5 h-5"/>
                </NavButton>
              </div>
            )}

            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-slate-600 font-semibold px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogoutIcon className="w-5 h-5 text-slate-500" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
