import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usuariosApi } from '../../api/client';
import AcoesListagem from '../../components/AcoesListagem';
import './Usuarios.css';
import '../CadastroListLayout.css';

const v = (x) => (x != null && x !== '' ? String(x) : '—');

function normalizarTexto(str) {
  return String(str ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function UsuariosList() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);
  const [busca, setBusca] = useState('');

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

  const termoBusca = normalizarTexto(busca).trim();
  const listaFiltrada = termoBusca
    ? lista.filter((u) => {
        const tipoStr = u.tipo === 'admin' ? 'administrador' : u.tipo === 'membro' ? 'membro' : u.tipo === 'visualizacao' ? 'visualizacao' : String(u.tipo || '');
        const texto = [u.nome, u.login, u.email, tipoStr].join(' ');
        return normalizarTexto(texto).includes(termoBusca);
      })
    : lista;

  if (carregando) return <p className="page-loading">Carregando...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="cadastro-page cadastro-list-page">
      <div className="page-header">
        <h1>Cadastro de Usuários</h1>
        <div className="page-header-actions">
          <input
            type="search"
            className="input-busca"
            placeholder="Buscar por nome, login, e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar"
          />
          <Link to="/usuarios/novo" className="btn btn-primary">Novo usuário</Link>
        </div>
      </div>
      {termoBusca && (
        <p className="busca-resultado">
          {listaFiltrada.length} de {lista.length} registro(s)
        </p>
      )}
      <div className="table-wrap">
        <table className="table table-cadastro">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Login</th>
              <th>E-mail</th>
              <th>Tipo</th>
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan={5}>{lista.length === 0 ? 'Nenhum usuário cadastrado.' : 'Nenhum resultado para a busca.'}</td>
              </tr>
            ) : (
              listaFiltrada.map((u) => (
                <tr key={u.id}>
                  <td className="td-texto" title={u.nome}>{v(u.nome)}</td>
                  <td>{v(u.login)}</td>
                  <td className="td-texto" title={u.email}>{v(u.email)}</td>
                  <td>
                    {u.tipo === 'admin' && 'Administrador'}
                    {u.tipo === 'membro' && 'Membro'}
                    {u.tipo === 'visualizacao' && 'Apenas visualização'}
                    {!['admin', 'membro', 'visualizacao'].includes(u.tipo) && (u.tipo || 'Membro')}
                  </td>
                  <td className="td-acoes">
                    <AcoesListagem basePath="/usuarios" id={u.id} onExcluir={() => handleExcluir(u.id, u.nome)} excluindo={excluindo === u.id} />
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
