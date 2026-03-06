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
  'marcas-atendidas': 'Marcas Atendidas',
  pessoas: 'Pessoas',
  'produtos-software': 'Sistemas',
  capex: 'Capex / Opex',
  empresas: 'Empresas',
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
    const list = Array.isArray(lista) ? lista : [];
    list.forEach((r) => {
      map.set(`${r.entidade}:visualizar`, r.visualizar);
      map.set(`${r.entidade}:editar`, r.editar);
      map.set(`${r.entidade}:criar`, r.criar);
      map.set(`${r.entidade}:excluir`, r.excluir);
    });
    return (entidade, acao) => Boolean(map.get(`${entidade}:${acao}`));
  }, [lista, usuario?.tipo]);

  const listaSegura = Array.isArray(lista) ? lista : [];

  const value = useMemo(
    () => ({
      permissoes: listaSegura,
      can,
      isAdmin: usuario?.tipo === 'admin',
      entidadeLabel: (entidade) => ENTIDADE_LABEL[entidade] || entidade,
    }),
    [listaSegura, can, usuario?.tipo]
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
