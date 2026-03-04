import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usuariosApi } from '../../api/client';
import AcoesListagem from '../../components/AcoesListagem';
import ConfigColunasModal from '../../components/ConfigColunasModal';
import { useListColumns } from '../../hooks/useListColumns';
import './Usuarios.css';
import '../CadastroListLayout.css';

const v = (x) => (x != null && x !== '' ? String(x) : '—');

const COLUNAS_USUARIOS = [
  { id: 'nome', label: 'Nome' },
  { id: 'login', label: 'Login' },
  { id: 'email', label: 'E-mail' },
  { id: 'perfil', label: 'Perfil' },
];

function normalizarTexto(str) {
  return String(str ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function UsuariosList() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);
  const [busca, setBusca] = useState('');
  const { visibleIds, setVisibleIds, allColumns } = useListColumns('usuarios', COLUNAS_USUARIOS);
  const [configColunasAberto, setConfigColunasAberto] = useState(false);

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
          <button type="button" className="btn btn-secondary btn-config-colunas" onClick={() => setConfigColunasAberto(true)} title="Escolher e ordenar colunas">
            ⚙ Colunas
          </button>
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
              {visibleIds.map((id) => (
                <th key={id}>{COLUNAS_USUARIOS.find((c) => c.id === id)?.label}</th>
              ))}
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan={visibleIds.length + 1}>{lista.length === 0 ? 'Nenhum usuário cadastrado.' : 'Nenhum resultado para a busca.'}</td>
              </tr>
            ) : (
              listaFiltrada.map((u) => (
                <tr key={u.id}>
                  {visibleIds.map((id) => {
                    if (id === 'nome') return <td key={id} className="td-texto" title={u.nome}>{v(u.nome)}</td>;
                    if (id === 'login') return <td key={id}>{v(u.login)}</td>;
                    if (id === 'email') return <td key={id} className="td-texto" title={u.email}>{v(u.email)}</td>;
                    if (id === 'perfil') {
                      const perfil = u.tipo === 'admin' ? 'Administrador' : u.tipo === 'membro' ? 'Membro' : u.tipo === 'visualizacao' ? 'Apenas visualização' : (u.tipo || 'Membro');
                      return <td key={id}>{perfil}</td>;
                    }
                    return null;
                  })}
                  <td className="td-acoes">
                    <AcoesListagem basePath="/usuarios" id={u.id} onExcluir={() => handleExcluir(u.id, u.nome)} excluindo={excluindo === u.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfigColunasModal
        open={configColunasAberto}
        onClose={() => setConfigColunasAberto(false)}
        allColumns={allColumns}
        visibleIds={visibleIds}
        onSave={setVisibleIds}
      />
    </div>
  );
}
