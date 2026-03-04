import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { timesApi } from '../../api/client';
import ConfigColunasModal from '../../components/ConfigColunasModal';
import { useListColumns } from '../../hooks/useListColumns';
import '../usuarios/Usuarios.css';
import '../CadastroListLayout.css';

const COLUNAS_TIMES = [
  { id: 'nome', label: 'Nome' },
  { id: 'lider', label: 'Líder' },
  { id: 'email', label: 'E-mail' },
  { id: 'descricao', label: 'Descrição' },
];

function v(val) {
  return val != null && String(val).trim() !== '' ? String(val).trim() : '—';
}

function normalizarTexto(str) {
  return String(str ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function TimesList() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);
  const [busca, setBusca] = useState('');
  const { visibleIds, setVisibleIds, allColumns } = useListColumns('times', COLUNAS_TIMES);
  const [configColunasAberto, setConfigColunasAberto] = useState(false);

  const carregar = () => {
    setCarregando(true);
    setErro('');
    timesApi.listar().then(setLista).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  };
  useEffect(() => carregar(), []);

  const handleExcluir = (id, nome) => {
    if (!window.confirm(`Excluir "${nome}"?`)) return;
    setExcluindo(id);
    timesApi.remover(id).then(carregar).catch((e) => setErro(e.message)).finally(() => setExcluindo(null));
  };

  const termoBusca = normalizarTexto(busca).trim();
  const listaFiltrada = termoBusca
    ? lista.filter((item) => {
        const texto = [item.nome, item.lider, item.email, item.descricao].join(' ');
        return normalizarTexto(texto).includes(termoBusca);
      })
    : lista;

  if (carregando) return <p className="page-loading">Carregando...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="cadastro-page cadastro-list-page">
      <div className="page-header">
        <h1>Times</h1>
        <div className="page-header-actions">
          <input
            type="search"
            className="input-busca"
            placeholder="Buscar por nome, líder, e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar"
          />
          <button type="button" className="btn btn-secondary btn-config-colunas" onClick={() => setConfigColunasAberto(true)} title="Escolher e ordenar colunas">⚙ Colunas</button>
          <Link to="/times/novo" className="btn btn-primary">Novo time</Link>
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
                <th key={id}>{COLUNAS_TIMES.find((c) => c.id === id)?.label}</th>
              ))}
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr><td colSpan={visibleIds.length + 1}>{lista.length === 0 ? 'Nenhum cadastrado.' : 'Nenhum resultado para a busca.'}</td></tr>
            ) : (
              listaFiltrada.map((item) => (
                <tr key={item.id}>
                  {visibleIds.map((id) => {
                    if (id === 'nome') return <td key={id} className="td-texto" title={item.nome}>{v(item.nome)}</td>;
                    if (id === 'lider') return <td key={id} className="td-texto" title={item.lider}>{v(item.lider)}</td>;
                    if (id === 'email') return <td key={id} className="td-texto" title={item.email}>{v(item.email)}</td>;
                    if (id === 'descricao') return <td key={id} className="td-texto" title={item.descricao}>{v(item.descricao)}</td>;
                    return null;
                  })}
                  <td className="td-acoes">
                    <Link to={`/times/editar/${item.id}`} className="btn btn-sm">Editar</Link>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => handleExcluir(item.id, item.nome)} disabled={excluindo === item.id}>
                      {excluindo === item.id ? '...' : 'Excluir'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfigColunasModal open={configColunasAberto} onClose={() => setConfigColunasAberto(false)} allColumns={allColumns} visibleIds={visibleIds} onSave={setVisibleIds} />
    </div>
  );
}
