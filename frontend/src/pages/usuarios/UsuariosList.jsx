import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usuariosApi } from '../../api/client';
import './Usuarios.css';

export default function UsuariosList() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);

  const carregar = () => {
    setCarregando(true);
    setErro('');
    usuariosApi
      .listar()
      .then(setLista)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  };

  useEffect(() => carregar(), []);

  const handleExcluir = (id, nome) => {
    if (!window.confirm(`Excluir o usuário "${nome}"?`)) return;
    setExcluindo(id);
    usuariosApi
      .remover(id)
      .then(carregar)
      .catch((e) => setErro(e.message))
      .finally(() => setExcluindo(null));
  };

  if (carregando) return <p>Carregando usuários...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <h1>Cadastro de Usuários</h1>
        <Link to="/usuarios/novo" className="btn btn-primary">
          Novo usuário
        </Link>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Login</th>
              <th>E-mail</th>
              <th>Tipo</th>
              <th width="140">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={5}>Nenhum usuário cadastrado.</td>
              </tr>
            ) : (
              lista.map((u) => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.login}</td>
                  <td>{u.email || '—'}</td>
                  <td>
                    {u.tipo === 'admin' && 'Administrador'}
                    {u.tipo === 'membro' && 'Membro'}
                    {u.tipo === 'visualizacao' && 'Apenas visualização'}
                    {!['admin', 'membro', 'visualizacao'].includes(u.tipo) && (u.tipo || 'Membro')}
                  </td>
                  <td className="acoes-cell">
                    <Link to={`/usuarios/editar/${u.id}`} className="btn btn-sm">
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleExcluir(u.id, u.nome)}
                      disabled={excluindo === u.id}
                    >
                      {excluindo === u.id ? '...' : 'Excluir'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
