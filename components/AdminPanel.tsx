
import React, { useState } from 'react';
import type { User, ToastType } from '../types.ts';
import { KeyIcon, UserAddIcon, UserGroupIcon } from './Icons.tsx';

interface AdminPanelProps {
  users: User[];
  onUpdateUser: (userId: string, newPassword?: string) => Promise<void>;
  onAddUser: (user: User) => Promise<boolean>;
  showToast: (message: string, type: ToastType) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, onUpdateUser, onAddUser, showToast }) => {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [newUserId, setNewUserId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  const handleEnableEdit = (userId: string) => {
    setEditingUserId(userId);
    setNewPassword('');
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setNewPassword('');
  };

  const handlePasswordChange = async (userId: string) => {
    if (newPassword.length < 3) {
        showToast('La contraseña debe tener al menos 3 caracteres.', 'error');
        return;
    }
    await onUpdateUser(userId, newPassword);
    handleCancelEdit();
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!newUserId || !newUserName || !newUserPassword) {
        showToast('Todos los campos son obligatorios para crear un usuario.', 'error');
        return;
    }
    const success = await onAddUser({
        id: newUserId.toLowerCase().trim(),
        name: newUserName.trim(),
        role: 'branch',
        branchName: newUserName.trim(),
        password: newUserPassword,
    });
    if (success) {
        setNewUserId('');
        setNewUserName('');
        setNewUserPassword('');
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Manage Users Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-4">
          <UserGroupIcon className="w-7 h-7 text-sky-600"/>
          <span>Gestionar Usuarios Existentes</span>
        </h2>
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-800">{user.name} <span className="text-sm font-normal text-slate-500">({user.id})</span></p>
                <p className="text-xs text-slate-500 uppercase font-bold">{user.role}</p>
              </div>
              {editingUserId === user.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Nueva contraseña"
                    className="w-40 border-slate-300 rounded-md shadow-sm text-sm focus:ring-sky-500 focus:border-sky-500"
                    autoFocus
                  />
                  <button onClick={() => handlePasswordChange(user.id)} className="px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700">Guardar</button>
                  <button onClick={handleCancelEdit} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-300">Cancelar</button>
                </div>
              ) : (
                <button 
                  onClick={() => handleEnableEdit(user.id)}
                  className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                >
                  <KeyIcon className="w-4 h-4" />
                  <span>Cambiar Contraseña</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Create User Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-4">
          <UserAddIcon className="w-7 h-7 text-sky-600"/>
          <span>Crear Nueva Sucursal</span>
        </h2>
        <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label htmlFor="new-user-id" className="block text-sm font-medium text-slate-700 mb-1">ID de Usuario</label>
            <input type="text" id="new-user-id" value={newUserId} onChange={e => setNewUserId(e.target.value)} placeholder="ej: nuevoid" className="w-full border-slate-300 rounded-md shadow-sm text-sm focus:ring-sky-500 focus:border-sky-500" required />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="new-user-name" className="block text-sm font-medium text-slate-700 mb-1">Nombre Sucursal</label>
            <input type="text" id="new-user-name" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="ej: Nueva Sucursal" className="w-full border-slate-300 rounded-md shadow-sm text-sm focus:ring-sky-500 focus:border-sky-500" required />
          </div>
           <div className="md:col-span-1">
            <label htmlFor="new-user-pass" className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input type="password" id="new-user-pass" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} placeholder="Contraseña inicial" className="w-full border-slate-300 rounded-md shadow-sm text-sm focus:ring-sky-500 focus:border-sky-500" required />
          </div>
          <div className="md:col-span-1">
            <button type="submit" className="w-full bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-sky-700 transition-colors flex items-center justify-center gap-2">
                <UserAddIcon className="w-5 h-5"/>
                <span>Crear</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};