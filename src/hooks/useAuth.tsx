import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User, type AuthResponse, type ApiResponse } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await api.get<ApiResponse<{user: User}>>('/auth/me');
        if (data.success && data.data) {
          setUser(data.data.user);
        }
      } catch (error) {
        // Not authenticated or session expired
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    try {
      const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      if (data.success && data.data) {
        setUser(data.data.user);
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
       if (data.success && data.data) {
        setUser(data.data.user);
        toast.success('Account created successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error', error);
      // Force local logout anyway
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
