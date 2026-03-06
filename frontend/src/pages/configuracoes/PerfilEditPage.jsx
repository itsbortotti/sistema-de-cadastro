import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import BtnVoltarHeader from '../../components/BtnVoltarHeader';
import { useAuth } from '../../context/AuthContext';
import { perfisApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import './PermissoesPage.css';
import './PerfisListPage.css';

const ENTIDADE_LABEL = {
  dashboard: 'Dashboard',
  configuracoes: 'Configurações',
  usuarios: 'Usuários',
  fornecedores: 'Fornecedores',
  areas: 'Áreas',
  hospedagens: 'Hospedagens',
  'formas-acesso': 'Formas de Acesso',
  times: 'Times',
  'marcas-atendidas': 'Marcas Atendidas',
  pessoas: 'Pessoas',
  'produtos-software': 'Sistemas',
  projetos: 'Projetos',
  capex: 'Capex / Opex',
  empresas: 'Empresas',
  perfis: 'Perfis',
  logs: 'Logs',
};
const ACOES = [
  { key: 'visualizar', label: 'Ver' },
  { key: 'editar', label: 'Editar' },
  { key: 'criar', label: 'Criar' },
  { key: 'excluir', label: 'Excluir' },
];

function buildMatrix(permissoes, entidadesOrdem) {
  const matrix = {};
  (entidadesOrdem || []).forEach((entidade) => {
    const r = (permissoes || []).find((x) => x.entidade === entidade);
    matrix[entidade] = {
      visualizar: Boolean(r?.visualizar),
      editar: Boolean(r?.editar),
      criar: Boolean(r?.criar),
      excluir: Boolean(r?.excluir),
    };
  });
  return matrix;
}

function matrixToPermissoes(matrix, entidadesOrdem) {
  return (entidadesOrdem || []).map((entidade) => {
    const m = matrix[entidade] || {};
    return {
      entidade,
      visualizar: Boolean(m.visualizar),
      editar: Boolean(m.editar),
      criar: Boolean(m.criar),
      excluir: Boolean(m.excluir),
    };
  });
}

export default function PerfilEditPage() {
  const { usuario } = useAuth();
  const { id } = useParams();
  const [perfil, setPerfil] = useState(null);
  const [entidadesOrdem, setEntidadesOrdem] = useState([]);
  const [nome, setNome] = useState('');
  const [permissoes, setPermissoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const matrix = useMemo(() => buildMatrix(permissoes, entidadesOrdem), [permissoes, entidadesOrdem]);

  useEffect(() => {
    if (!usuario || !id) return;
    setCarregando(true);
    setErro('');
    setAcessoNegado(false);
    Promise.all([perfisApi.buscar(id), perfisApi.entidades()])
      .then(([p, entidades]) => {
        setPerfil(p);
        setNome(p.nome || '');
        setPermissoes(p.permissoes || []);
        setEntidadesOrdem(Array.isArray(entidades) ? entidades : []);
      })
      .catch((e) => {
        const msg = e?.message || '';
        setErro(msg);
        if (msg.includes('403') || msg.includes('negado') || msg.includes('permissão')) setAcessoNegado(true);
      })
      .finally(() => setCarregando(false));
  }, [usuario?.id, id]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!perfil) return;
    setErro('');
    setSalvando(true);
    setSalvo(false);
    try {
      const payload = {
        nome: (nome || '').trim() || perfil.nome,
        permissoes: matrixToPermissoes(matrix, entidadesOrdem),
      };
      const atualizado = await perfisApi.atualizar(perfil.id, payload);
      setPerfil(atualizado);
      setNome(atualizado.nome || '');
      setPermissoes(atualizado.permissoes || []);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    } catch (err) {
      setErro(err.message || 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  };

  const updateCell = (entidade, acao, checked) => {
    setPermissoes((prev) => {
      const idx = prev.findIndex((r) => r.entidade === entidade);
      const def = matrix[entidade] || { visualizar: false, editar: false, criar: false, excluir: false };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], [acao]: checked };
        return next;
      }
      return [...prev, { entidade, ...def, [acao]: checked }];
    });
  };

  if (!usuario) return null;
  if (carregando) return <p className="page-loading">Carregando perfil...</p>;
  if (acessoNegado) {
    return (
      <div className="usuarios-page permissoes-page">
        <div className="page-header">
          <BtnVoltarHeader to="/perfis" title="Voltar aos perfis" ariaLabel="Voltar aos perfis" />
        </div>
        <div className="permissoes-acesso-negado">
          <p className="erro-msg">Você não tem permissão para editar este perfil.</p>
        </div>
      </div>
    );
  }
  if (!perfil) {
    return (
      <div className="usuarios-page permissoes-page">
        <div className="page-header">
          <BtnVoltarHeader to="/perfis" title="Voltar aos perfis" ariaLabel="Voltar aos perfis" />
        </div>
        <p className="erro-msg">{erro || 'Perfil não encontrado.'}</p>
      </div>
    );
  }

  return (
    <div className="usuarios-page permissoes-page">
      <div className="page-header">
        <BtnVoltarHeader to="/perfis" title="Voltar aos perfis" ariaLabel="Voltar aos perfis" />
      </div>
      <p className="page-desc">
        Altere o nome do perfil e defina em quais <strong>abas</strong> os usuários com este perfil podem <strong>Ver</strong>, <strong>Editar</strong>, <strong>Criar</strong> e <strong>Excluir</strong>.
      </p>
      {erro && <p className="erro-msg">{erro}</p>}
      {salvo && <p className="sucesso-msg">Perfil salvo com sucesso.</p>}

      <form onSubmit={handleSalvar} className="permissoes-form">
        <section className="permissoes-card">
          <div className="perfil-edit-nome-wrap">
            <label htmlFor="perfil-nome-input" className="perfil-edit-nome-label">
              Nome do perfil
            </label>
            <input
              id="perfil-nome-input"
              type="text"
              className="perfil-edit-nome-input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Gerente de Projetos"
              aria-label="Nome do perfil"
            />
          </div>
          <h2 className="permissoes-card-title">Permissões por aba</h2>
          <div className="table-wrap">
            <table className="table table-permissoes">
              <thead>
                <tr>
                  <th>Aba</th>
                  {ACOES.map((a) => (
                    <th key={a.key}>{a.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entidadesOrdem.map((entidade) => {
                  const perms = matrix[entidade] || {};
                  return (
                    <tr key={entidade}>
                      <td className="permissoes-entidade">{ENTIDADE_LABEL[entidade] || entidade}</td>
                      {ACOES.map((a) => (
                        <td key={a.key} className="permissoes-cell">
                          <label className="permissoes-check-label" title={a.label}>
                            <input
                              type="checkbox"
                              checked={Boolean(perms[a.key])}
                              onChange={(e) => updateCell(entidade, a.key, e.target.checked)}
                              aria-label={`${ENTIDADE_LABEL[entidade]} - ${a.label}`}
                            />
                          </label>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        <div className="form-actions permissoes-actions">
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </div>
      </form>
    </div>
  );
}
