import type { User } from './services/database.types.ts';

export * from './services/database.types.ts';

export interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
}
