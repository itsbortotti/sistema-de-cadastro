import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projetosApi } from '../../api/client';
import AcoesListagem from '../../components/AcoesListagem';
import ConfigColunasModal from '../../components/ConfigColunasModal';
import { useListColumns } from '../../hooks/useListColumns';
import '../usuarios/Usuarios.css';
import '../CadastroListLayout.css';

const COLUNAS_PROJETOS = [
  { id: 'nome', label: 'Nome' },
  { id: 'sistemas', label: 'Sistemas' },
  { id: 'empresa', label: 'Empresa' },
  { id: 'status', label: 'Status' },
  { id: 'dataInicio', label: 'Data início' },
  { id: 'dataFim', label: 'Data fim' },
  { id: 'descricao', label: 'Descrição' },
];

function v(val) {
  return val != null && String(val).trim() !== '' ? String(val).trim() : '—';
}

function formatarData(str) {
  if (!str || typeof str !== 'string') return '—';
  try {
    const d = new Date(str + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return str;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return str;
  }
}

function normalizarTexto(str) {
  return String(str ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function ProjetosList() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);
  const [busca, setBusca] = useState('');
  const { visibleIds, setVisibleIds, allColumns } = useListColumns('projetos', COLUNAS_PROJETOS);
  const [configColunasAberto, setConfigColunasAberto] = useState(false);

  const carregar = () => {
    setCarregando(true);
    setErro('');
    projetosApi.listar().then(setLista).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  };
  useEffect(() => carregar(), []);

  const handleExcluir = (id, nome) => {
    if (!window.confirm(`Excluir o projeto "${nome || 'sem nome'}"?`)) return;
    setExcluindo(id);
    projetosApi.remover(id).then(carregar).catch((e) => setErro(e.message)).finally(() => setExcluindo(null));
  };

  const termoBusca = normalizarTexto(busca).trim();
  const listaFiltrada = termoBusca
    ? lista.filter((item) => {
        const sistemaStr = (item.sistemaNomes || []).join(' ');
        const texto = [item.nome, item.empresaNome, item.status, item.descricao, sistemaStr].join(' ');
        return normalizarTexto(texto).includes(termoBusca);
      })
    : lista;

  if (carregando) return <p className="page-loading">Carregando...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="cadastro-page cadastro-list-page">
      <div className="page-header">
        <h1>Projetos</h1>
        <div className="page-header-actions">
          <input
            type="search"
            className="input-busca"
            placeholder="Buscar por nome, empresa, status, sistema..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar"
          />
          <button type="button" className="btn btn-secondary btn-config-colunas" onClick={() => setConfigColunasAberto(true)} title="Escolher e ordenar colunas">⚙ Colunas</button>
          <Link to="/projetos/novo" className="btn btn-primary">Novo projeto</Link>
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
                <th key={id}>{COLUNAS_PROJETOS.find((c) => c.id === id)?.label}</th>
              ))}
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr><td colSpan={visibleIds.length + 1}>{lista.length === 0 ? 'Nenhum projeto cadastrado.' : 'Nenhum resultado para a busca.'}</td></tr>
            ) : (
              listaFiltrada.map((item) => (
                <tr key={item.id}>
                  {visibleIds.map((id) => {
                    if (id === 'nome') return <td key={id} className="td-texto" title={item.nome}>{v(item.nome)}</td>;
                    if (id === 'sistemas') return <td key={id} className="td-texto" title={(item.sistemaNomes || []).join(', ')}>{(item.sistemaNomes && item.sistemaNomes.length > 0) ? item.sistemaNomes.join(', ') : '—'}</td>;
                    if (id === 'empresa') return <td key={id}>{v(item.empresaNome)}</td>;
                    if (id === 'status') return <td key={id}>{v(item.status)}</td>;
                    if (id === 'dataInicio') return <td key={id}>{formatarData(item.dataInicio)}</td>;
                    if (id === 'dataFim') return <td key={id}>{formatarData(item.dataFim)}</td>;
                    if (id === 'descricao') return <td key={id} className="td-texto" title={item.descricao}>{v(item.descricao)}</td>;
                    return null;
                  })}
                  <td className="td-acoes">
                    <AcoesListagem basePath="/projetos" id={item.id} onExcluir={() => handleExcluir(item.id, item.nome)} excluindo={excluindo === item.id} />
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
