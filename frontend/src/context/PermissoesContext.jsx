import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { permissoesApi } from '../api/client';

const PermissoesContext = createContext(null);

const ENTIDADE_LABEL = {
  usuarios: 'Usuários',
  fornecedores: 'Fornecedores',
  areas: 'Áreas',
  hospedagens: 'Hospedagens',
  'formas-acesso': 'Formas de Acesso',
  times: 'Times',
  'produtos-software': 'Produtos de Software',
};

export function PermissoesProvider({ children }) {
  const { usuario } = useAuth();
  const [lista, setLista] = useState([]);

  useEffect(() => {
    if (!usuario) {
      setLista([]);
      return;
    }
    permissoesApi
      .listarMe()
      .then(setLista)
      .catch(() => setLista([]));
  }, [usuario?.id]);

  const can = useMemo(() => {
    if (usuario?.tipo === 'admin') return () => true;
    const map = new Map();
    lista.forEach((r) => {
      map.set(`${r.entidade}:visualizar`, r.visualizar);
      map.set(`${r.entidade}:editar`, r.editar);
      map.set(`${r.entidade}:criar`, r.criar);
      map.set(`${r.entidade}:excluir`, r.excluir);
    });
    return (entidade, acao) => Boolean(map.get(`${entidade}:${acao}`));
  }, [lista, usuario?.tipo]);

  const value = useMemo(
    () => ({
      permissoes: lista,
      can,
      isAdmin: usuario?.tipo === 'admin',
      entidadeLabel: (entidade) => ENTIDADE_LABEL[entidade] || entidade,
    }),
    [lista, can, usuario?.tipo]
  );

  return (
    <PermissoesContext.Provider value={value}>
      {children}
    </PermissoesContext.Provider>
  );
}

export function usePermissoes() {
  const ctx = useContext(PermissoesContext);
  if (!ctx) throw new Error('usePermissoes deve ser usado dentro de PermissoesProvider');
  return ctx;
}
