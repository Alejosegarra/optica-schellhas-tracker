import React, { useState, useCallback, useMemo, createContext, useContext } from 'react';
import type { User } from '../services/database.types.ts';
import { apiLogin } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

export interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const login = useCallback(async (username: string, password: string): Promise<User | null> => {
    setLoading(true);
    try {
      const user = await apiLogin(username, password);
      if (user) {
        setCurrentUser(user);
        addToast(`Bienvenido, ${user.username}!`);
        return user;
      } else {
        addToast('Credenciales inválidas.', 'error');
        setCurrentUser(null);
        return null;
      }
    } catch (error) {
      console.error("Login failed", error);
      addToast('Ocurrió un error al iniciar sesión.', 'error');
      setCurrentUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    addToast('Sesión cerrada exitosamente.');
  }, [addToast]);

  const value = useMemo(() => ({ currentUser, login, logout }), [currentUser, login, logout]);

  if (loading && !currentUser) {
     return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-100">
            <div className="text-xl font-semibold text-gray-700">Cargando...</div>
        </div>
     )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};