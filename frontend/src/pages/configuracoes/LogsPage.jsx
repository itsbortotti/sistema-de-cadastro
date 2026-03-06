import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { logsApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import './LogsPage.css';

const TIPO_LABEL = {
  login: 'Login',
  edicao: 'Edição',
  criacao: 'Criação',
  exclusao: 'Exclusão',
};

function formatarDataHora(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function LogsPage() {
  const { usuario } = useAuth();
  const [logs, setLogs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    if (!usuario) return;
    setCarregando(true);
    setErro('');
    const params = filtroTipo ? { tipo: filtroTipo, limite: 300 } : { limite: 300 };
    logsApi
      .listar(params)
      .then(setLogs)
      .catch((e) => {
        setErro(e?.message || 'Erro ao carregar logs');
        setLogs([]);
      })
      .finally(() => setCarregando(false));
  }, [usuario?.id, filtroTipo]);

  if (!usuario) return null;
  if (carregando) return <p className="page-loading">Carregando logs...</p>;

  return (
    <div className="usuarios-page cadastro-page logs-page">
      <div className="page-header logs-page-header">
        <div className="page-header-actions">
          <label htmlFor="logs-filtro-tipo" className="logs-filtro-label">Tipo</label>
          <select
            id="logs-filtro-tipo"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="form-input logs-filtro-tipo"
            aria-label="Filtrar por tipo"
          >
            <option value="">Todos os tipos</option>
            {Object.entries(TIPO_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="page-desc">
        Registro de acessos (login) e alterações (criação, edição e exclusão) realizadas no sistema, com data, hora e usuário.
      </p>
      {erro && <p className="erro-msg">{erro}</p>}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Data e hora</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Usuário</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-cell">Nenhum registro de log encontrado.</td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id}>
                  <td className="logs-datetime">{formatarDataHora(l.createdAt)}</td>
                  <td><span className={`logs-tipo logs-tipo-${l.tipo}`}>{TIPO_LABEL[l.tipo] || l.tipo}</span></td>
                  <td className="td-texto" title={l.descricao}>{l.descricao || '—'}</td>
                  <td>{l.usuarioNome || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
