import { createContext, useContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  is_admin?: boolean;
  is_banned: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/me', {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          setUser(null); // 401 é esperado, não mostrar nada
        } else {
          setUser(null);
          console.error(error); // Outros erros devem ser visíveis
        }
      } finally {
        setLoading(false);
      }
    };

    // Verificar se há um código de autorização retornado do Google OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const googleCode = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (googleCode && state === localStorage.getItem('googleOAuthState')) {
      // Se tiver código do Google, processa-o e remove dos parâmetros da URL
      handleGoogleCallback(googleCode);
      // Limpa o estado armazenado após uso
      localStorage.removeItem('googleOAuthState');
      // Remove os parâmetros da URL para não confundir o usuário
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Caso contrário, verificação normal de autenticação
      checkAuth();
    }
  }, []);

  // Função para processar o retorno do OAuth do Google
  const handleGoogleCallback = async (code: string) => {
    setLoading(true);
    try {
      const response = await axios.post(
        '/api/auth/google/callback',
        { code },
        { withCredentials: true }
      );
      setUser(response.data);
    } catch (error) {
      console.error('Error processing Google authentication:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(
        '/api/auth/login',
        { email, password },
        { withCredentials: true }
      );
      setUser(response.data);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // Gerar um estado aleatório para segurança contra CSRF
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('googleOAuthState', state);
      
      // Obter a URL de autorização do Google do backend
      const response = await axios.get('/api/auth/google/url', {
        params: { state },
        withCredentials: true,
      });
      
      console.log('Google Auth URL:', response.data.url); // Para debugging
      
      // Redirecionar para a página de login do Google
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error initiating Google login:', error);
      setLoading(false);
    }
  };
  

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(
        '/api/auth/register',
        { username, email, password },
        { withCredentials: true }
      );
      setUser(response.data);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
