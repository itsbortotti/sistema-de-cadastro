import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { permissoesApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import './PermissoesPage.css';

const TIPOS_ORDEM = ['admin', 'membro', 'visualizacao'];
const TIPO_LABEL = {
  admin: 'Administrador',
  membro: 'Membro',
  visualizacao: 'Apenas visualização',
};
const ENTIDADES_ORDEM = [
  'usuarios',
  'fornecedores',
  'areas',
  'hospedagens',
  'formas-acesso',
  'times',
  'produtos-software',
];
const ENTIDADE_LABEL = {
  usuarios: 'Usuários',
  fornecedores: 'Fornecedores',
  areas: 'Áreas',
  hospedagens: 'Hospedagens',
  'formas-acesso': 'Formas de Acesso',
  times: 'Times',
  'produtos-software': 'Produtos de Software',
};
const ACOES = [
  { key: 'visualizar', label: 'Ver' },
  { key: 'editar', label: 'Editar' },
  { key: 'criar', label: 'Criar' },
  { key: 'excluir', label: 'Excluir' },
];

function buildMatrix(regras) {
  const matrix = {};
  TIPOS_ORDEM.forEach((tipo) => {
    matrix[tipo] = {};
    ENTIDADES_ORDEM.forEach((entidade) => {
      const r = (regras || []).find((x) => x.tipo === tipo && x.entidade === entidade);
      matrix[tipo][entidade] = {
        visualizar: Boolean(r?.visualizar),
        editar: Boolean(r?.editar),
        criar: Boolean(r?.criar),
        excluir: Boolean(r?.excluir),
      };
    });
  });
  return matrix;
}

function matrixToRegras(matrix) {
  const regras = [];
  TIPOS_ORDEM.forEach((tipo) => {
    ENTIDADES_ORDEM.forEach((entidade) => {
      const m = matrix[tipo]?.[entidade] || {};
      regras.push({
        tipo,
        entidade,
        visualizar: Boolean(m.visualizar),
        editar: Boolean(m.editar),
        criar: Boolean(m.criar),
        excluir: Boolean(m.excluir),
      });
    });
  });
  return regras;
}

export default function PermissoesPage() {
  const { usuario } = useAuth();
  const [regras, setRegras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const matrix = useMemo(() => buildMatrix(regras), [regras]);

  useEffect(() => {
    if (!usuario) return;
    setCarregando(true);
    setErro('');
    setAcessoNegado(false);
    permissoesApi
      .listar()
      .then((data) => {
        setRegras(data);
      })
      .catch((e) => {
        const msg = e?.message || '';
        setErro(msg);
        if (msg.includes('403') || msg.includes('negado') || msg.includes('administrador')) {
          setAcessoNegado(true);
        }
      })
      .finally(() => setCarregando(false));
  }, [usuario?.id]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    setSalvo(false);
    try {
      const paraSalvar = matrixToRegras(matrix);
      const atualizado = await permissoesApi.salvar(paraSalvar);
      setRegras(atualizado);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const updateCell = (tipo, entidade, acao, checked) => {
    setRegras((prev) => {
      const idx = prev.findIndex((r) => r.tipo === tipo && r.entidade === entidade);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], [acao]: checked };
        return next;
      }
      const def = matrix[tipo]?.[entidade] || { visualizar: false, editar: false, criar: false, excluir: false };
      return [...prev, { tipo, entidade, ...def, [acao]: checked }];
    });
  };

  if (!usuario) return null;
  if (carregando) return <p className="page-loading">Carregando permissões...</p>;
  if (acessoNegado) {
    return (
      <div className="permissoes-page">
        <div className="page-header">
          <h1>Configurações — Permissões</h1>
          <Link to="/" className="btn btn-secondary">Voltar ao início</Link>
        </div>
        <div className="permissoes-acesso-negado">
          <p className="erro-msg">Acesso negado. Apenas administradores podem configurar permissões.</p>
          <p className="page-desc">Se você é administrador, faça logout e login novamente para atualizar suas permissões.</p>
        </div>
      </div>
    );
  }
  if (erro && regras.length === 0) {
    return (
      <div className="permissoes-page">
        <div className="page-header">
          <h1>Configurações — Permissões</h1>
          <Link to="/" className="btn btn-secondary">Voltar ao início</Link>
        </div>
        <p className="erro-msg">{erro}</p>
      </div>
    );
  }

  return (
    <div className="permissoes-page">
      <div className="page-header">
        <h1>Configurações — Permissões</h1>
        <Link to="/" className="btn btn-secondary">Voltar ao início</Link>
      </div>
      <p className="page-desc">
        Altere as permissões de cada tipo de usuário por cadastro. Marque o que cada tipo pode fazer:
        <strong> Ver</strong> (ver lista e detalhes), <strong>Editar</strong>, <strong>Criar</strong> e <strong>Excluir</strong>.
      </p>

      {erro && <p className="erro-msg">{erro}</p>}
      {salvo && <p className="sucesso-msg">Permissões salvas com sucesso.</p>}

      <form onSubmit={handleSalvar} className="permissoes-form">
        {TIPOS_ORDEM.map((tipo) => (
          <section key={tipo} className="permissoes-card">
            <h2 className="permissoes-card-title">{TIPO_LABEL[tipo]}</h2>
            <p className="permissoes-card-desc">
              {tipo === 'admin' && 'Usuários administradores têm acesso total; você pode restringir por cadastro se desejar.'}
              {tipo === 'membro' && 'Membros podem ter permissão para editar e criar, mas não necessariamente excluir.'}
              {tipo === 'visualizacao' && 'Usuários com apenas visualização só podem ver listas e detalhes, sem alterar dados.'}
            </p>
            <div className="table-wrap">
              <table className="table table-permissoes">
                <thead>
                  <tr>
                    <th>Cadastro</th>
                    {ACOES.map((a) => (
                      <th key={a.key}>{a.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ENTIDADES_ORDEM.map((entidade) => {
                    const perms = matrix[tipo]?.[entidade] || {};
                    return (
                      <tr key={entidade}>
                        <td className="permissoes-entidade">{ENTIDADE_LABEL[entidade] || entidade}</td>
                        {ACOES.map((a) => (
                          <td key={a.key} className="permissoes-cell">
                            <label className="permissoes-check-label" title={a.label}>
                              <input
                                type="checkbox"
                                checked={Boolean(perms[a.key])}
                                onChange={(e) => updateCell(tipo, entidade, a.key, e.target.checked)}
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
        ))}

        <div className="permissoes-actions">
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar permissões'}
          </button>
        </div>
      </form>
    </div>
  );
}
