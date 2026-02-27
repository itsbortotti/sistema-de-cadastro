import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API = '/api';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const fetchOptions = { credentials: 'include' };

  useEffect(() => {
    fetch(`${API}/auth/sessao`, fetchOptions)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUsuario(data);
        setCarregando(false);
      })
      .catch(() => {
        setUsuario(null);
        setCarregando(false);
      });
  }, []);

  const login = async (login, senha) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ login, senha }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.erro || 'Erro ao fazer login');
    setUsuario(data.usuario);
    return data.usuario;
  };

  const logout = async () => {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
