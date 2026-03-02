import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formasAcessoApi } from '../../api/client';
import AcoesListagem from '../../components/AcoesListagem';
import '../usuarios/Usuarios.css';
import '../CadastroListLayout.css';

function v(val) {
  return val != null && String(val).trim() !== '' ? String(val).trim() : '—';
}

function normalizarTexto(str) {
  return String(str ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function FormasAcessoList() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);
  const [busca, setBusca] = useState('');

  const carregar = () => {
    setCarregando(true);
    setErro('');
    formasAcessoApi.listar().then(setLista).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  };
  useEffect(() => carregar(), []);

  const handleExcluir = (id, nome) => {
    if (!window.confirm(`Excluir "${nome}"?`)) return;
    setExcluindo(id);
    formasAcessoApi.remover(id).then(carregar).catch((e) => setErro(e.message)).finally(() => setExcluindo(null));
  };

  const termoBusca = normalizarTexto(busca).trim();
  const listaFiltrada = termoBusca
    ? lista.filter((item) => {
        const texto = [item.nome, item.tipo, item.descricao].join(' ');
        return normalizarTexto(texto).includes(termoBusca);
      })
    : lista;

  if (carregando) return <p className="page-loading">Carregando...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="cadastro-page cadastro-list-page">
      <div className="page-header">
        <h1>Formas de Acesso ao Sistema</h1>
        <div className="page-header-actions">
          <input
            type="search"
            className="input-busca"
            placeholder="Buscar por nome, tipo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar"
          />
          <Link to="/formas-acesso/novo" className="btn btn-primary">Nova forma de acesso</Link>
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
              <th>Tipo</th>
              <th>Descrição</th>
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr><td colSpan={4}>{lista.length === 0 ? 'Nenhum cadastrado.' : 'Nenhum resultado para a busca.'}</td></tr>
            ) : (
              listaFiltrada.map((item) => (
                <tr key={item.id}>
                  <td className="td-texto" title={item.nome}>{v(item.nome)}</td>
                  <td>{v(item.tipo)}</td>
                  <td className="td-texto" title={item.descricao}>{v(item.descricao)}</td>
                  <td className="td-acoes">
                    <AcoesListagem basePath="/formas-acesso" id={item.id} onExcluir={() => handleExcluir(item.id, item.nome)} excluindo={excluindo === item.id} />
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
