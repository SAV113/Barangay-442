import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, AuthState, LoginPayload } from '../types';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredAuth(): { token: string | null; user: User | null } {
  const token =
    localStorage.getItem('masid_token') || sessionStorage.getItem('masid_token');
  const userJson =
    localStorage.getItem('masid_user') || sessionStorage.getItem('masid_user');
  const user = userJson ? (JSON.parse(userJson) as User) : null;
  return { token, user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize from storage
  useEffect(() => {
    const { token, user } = getStoredAuth();
    if (token && user) {
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      // Verify token validity with server
      authApi.getMe()
        .then((res) => {
          setState((prev) => ({
            ...prev,
            user: res.data,
            isLoading: false,
          }));
        })
        .catch(() => {
          // Token invalid - clear
          localStorage.removeItem('masid_token');
          localStorage.removeItem('masid_user');
          sessionStorage.removeItem('masid_token');
          sessionStorage.removeItem('masid_user');
          setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authApi.login(payload.email, payload.password);
    const { accessToken, user } = res.data;

    const storage = payload.rememberMe ? localStorage : sessionStorage;
    storage.setItem('masid_token', accessToken);
    storage.setItem('masid_user', JSON.stringify(user));

    setState({
      user,
      token: accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('masid_token');
    localStorage.removeItem('masid_user');
    sessionStorage.removeItem('masid_token');
    sessionStorage.removeItem('masid_user');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    toast.success('Logged out successfully.');
  }, []);

  const updateUser = useCallback((user: User) => {
    setState((prev) => ({ ...prev, user }));
    const storage = localStorage.getItem('masid_token') ? localStorage : sessionStorage;
    storage.setItem('masid_user', JSON.stringify(user));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
