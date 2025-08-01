
import React, { useState } from 'react';
import { EyeIcon } from './Icons.tsx';
import type { User } from '../types.ts';

interface LoginScreenProps {
  onLogin: (id: string, pass: string) => boolean;
  users: User[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, users }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!id) {
        setError('Por favor, seleccione un usuario.');
        return;
    }
    const success = onLogin(id, password);
    if (!success) {
      setError('Usuario o contraseña incorrectos. Por favor, intente de nuevo.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-2xl rounded-2xl">
        <div className="text-center">
          <EyeIcon className="w-16 h-16 mx-auto text-sky-600" />
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Optica Schellhas</h1>
          <p className="mt-2 text-slate-600">Sistema de Seguimiento de Trabajos</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="user-id-select" className="sr-only">Usuario</label>
              <select
                id="user-id-select"
                name="id"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border bg-white border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                value={id}
                onChange={e => setId(e.target.value)}
              >
                <option value="" disabled>Seleccionar Usuario...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="password-input" className="sr-only">Contraseña</label>
              <input
                id="password-input"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border bg-white border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-center text-sm bg-red-100 p-3 rounded-md">
                {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
            >
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};