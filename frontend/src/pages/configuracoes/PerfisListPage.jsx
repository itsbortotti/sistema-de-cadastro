import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { perfisApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import './PermissoesPage.css';
import './PerfisListPage.css';

export default function PerfisListPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [perfis, setPerfis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    setCarregando(true);
    setErro('');
    setAcessoNegado(false);
    perfisApi
      .listar()
      .then(setPerfis)
      .catch((e) => {
        const msg = e?.message || '';
        setErro(msg);
        if (msg.includes('403') || msg.includes('negado') || msg.includes('permissão')) setAcessoNegado(true);
      })
      .finally(() => setCarregando(false));
  }, [usuario?.id]);

  const handleCriar = async (e) => {
    e.preventDefault();
    const nome = (novoNome || '').trim();
    if (!nome) return;
    setErro('');
    setSalvando(true);
    try {
      const perfil = await perfisApi.criar({ nome });
      setPerfis((prev) => [...prev, { id: perfil.id, nome: perfil.nome, usuariosCount: 0 }].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNovoNome('');
      setModalAberto(false);
      navigate(`/perfis/${perfil.id}`);
    } catch (err) {
      setErro(err.message || 'Erro ao criar perfil');
    } finally {
      setSalvando(false);
    }
  };

  if (!usuario) return null;
  if (carregando) return <p className="page-loading">Carregando perfis...</p>;
  if (acessoNegado) {
    return (
      <div className="usuarios-page permissoes-page">
        <div className="permissoes-acesso-negado">
          <p className="erro-msg">Você não tem permissão para gerenciar perfis.</p>
          <p className="page-desc">Apenas usuários com permissão na aba Perfis podem acessar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="usuarios-page perfis-list-page">
      <div className="page-header">
        <button type="button" className="btn btn-primary" onClick={() => setModalAberto(true)}>
          Novo perfil
        </button>
      </div>
      <p className="page-desc">
        Liste os <strong>perfis de usuário</strong> e clique em um perfil para definir em quais abas ele pode <strong>Ver</strong>, <strong>Editar</strong>, <strong>Criar</strong> e <strong>Excluir</strong>.
      </p>
      {erro && <p className="erro-msg">{erro}</p>}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Perfil</th>
              <th>Usuários vinculados</th>
              <th aria-hidden />
            </tr>
          </thead>
          <tbody>
            {perfis.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-cell">Nenhum perfil cadastrado. Crie um com &quot;Novo perfil&quot;.</td>
              </tr>
            ) : (
              perfis.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/perfis/${p.id}`} className="perfil-link">{p.nome}</Link>
                  </td>
                  <td>{p.usuariosCount ?? 0}</td>
                  <td>
                    <Link to={`/perfis/${p.id}`} className="btn btn-small btn-secondary">Editar</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div
          className="modal-overlay"
          onClick={() => !salvando && setModalAberto(false)}
          role="presentation"
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-novo-perfil-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-novo-perfil-title" className="modal-title">Novo perfil</h2>
            <form onSubmit={handleCriar}>
              <label className="form-label">
                Nome do perfil
                <input
                  type="text"
                  className="form-input"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Gerente de Projetos"
                  autoFocus
                  disabled={salvando}
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalAberto(false)} disabled={salvando}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={salvando || !(novoNome || '').trim()}>
                  {salvando ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
