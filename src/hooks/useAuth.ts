import { useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { AuthApi } from '@/lib/api';
import type { LoginResponse, RegisterRequest, UserProfile } from '@/lib/api';

export type UserRole = 'Admin' | 'Manager' | 'Employee' | 'Client';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  roles: string[];
  role: UserRole; // Para compatibilidade com o código existente
}

export interface AuthError {
  message: string;
  details?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
  });

  // Função para atualizar estado atomicamente
  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  }, []);

  // Verificar se já existe um token no localStorage ao inicializar
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          const userData = await getCurrentUser();
          if (userData) {
            flushSync(() => {
              updateAuthState({ 
                user: userData, 
                isAuthenticated: true, 
                isLoading: false, 
                isInitialized: true 
              });
            });
          } else {
            updateAuthState({ isLoading: false, isInitialized: true });
          }
        } catch (error) {
          console.error('Token inválido:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          updateAuthState({ isLoading: false, isInitialized: true });
        }
      } else {
        updateAuthState({ isLoading: false, isInitialized: true });
      }
    };

    if (!authState.isInitialized) {
      checkAuthStatus();
    }
  }, [authState.isInitialized, updateAuthState]);

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const userData = await AuthApi.getCurrentUser();
      
      // Determinar a role principal para compatibilidade
      const primaryRole = userData.roles.includes('Admin') ? 'Admin' :
                         userData.roles.includes('Manager') ? 'Manager' :
                         userData.roles.includes('Employee') ? 'Employee' : 'Client';

      const userObj = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        cpf: userData.cpf,
        roles: userData.roles,
        role: primaryRole as UserRole,
      };
      
      return userObj;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  };

  const login = async (emailOrCpf: string, password: string): Promise<User> => {
    try {
      updateAuthState({ isLoading: true });
      
      const loginData = await AuthApi.login(emailOrCpf, password);

      // Salvar tokens no localStorage
      debugger;
      localStorage.setItem('auth_token', loginData.access_token);
      localStorage.setItem('refresh_token', loginData.refreshToken);
      localStorage.setItem('user_id', loginData.user.id);
      localStorage.setItem('user_name', loginData.user.name);

      // Determinar a role principal para compatibilidade
      const primaryRole = loginData.user.roles.includes('Admin') ? 'Admin' :
                         loginData.user.roles.includes('Manager') ? 'Manager' :
                         loginData.user.roles.includes('Employee') ? 'Employee' : 'Client';

      const newUser: User = {
        id: loginData.user.id,
        name: loginData.user.name,
        email: loginData.user.email,
        cpf: loginData.user.cpf,
        roles: loginData.user.roles,
        role: primaryRole as UserRole,
      };

      // Use flushSync to force synchronous state update directly with setAuthState
      flushSync(() => {
        setAuthState(prev => ({
          ...prev, 
          user: newUser, 
          isAuthenticated: true, 
          isLoading: false 
        }));
      });
      
      // Force page refresh to ensure UI updates
      window.location.reload();
      
      return newUser;
    } catch (error) {
      console.error('Erro no login:', error);
      updateAuthState({ isLoading: false });
      throw error;
    }
  };

  const register = async (userData: RegisterRequest): Promise<User> => {
    try {
      updateAuthState({ isLoading: true });
      
      const registeredUser = await AuthApi.register(userData);

      // Determinar a role principal para compatibilidade
      const primaryRole = registeredUser.roles.includes('Admin') ? 'Admin' :
                         registeredUser.roles.includes('Manager') ? 'Manager' :
                         registeredUser.roles.includes('Employee') ? 'Employee' : 'Client';

      const newUser: User = {
        id: registeredUser.id,
        name: registeredUser.name,
        email: registeredUser.email,
        cpf: registeredUser.cpf,
        roles: registeredUser.roles,
        role: primaryRole as UserRole,
      };

      updateAuthState({ isLoading: false });
      return newUser;
    } catch (error) {
      console.error('Erro no registro:', error);
      updateAuthState({ isLoading: false });
      throw error;
    }
  };

  const logout = () => {
    updateAuthState({ 
      user: null, 
      isAuthenticated: false 
    });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  };

  const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };

  const isAdmin = () => authState.user?.roles.includes('Admin') || false;
  const isManager = () => authState.user?.roles.includes('Manager') || authState.user?.roles.includes('Admin') || false;
  const isEmployee = () => authState.user?.roles.includes('Employee') || authState.user?.roles.includes('Manager') || authState.user?.roles.includes('Admin') || false;

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    register,
    logout,
    getAuthToken,
    isAdmin,
    isManager,
    isEmployee,
  };
};
