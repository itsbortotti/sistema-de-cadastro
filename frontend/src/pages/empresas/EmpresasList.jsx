import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { empresasApi } from '../../api/client';
import AcoesListagem from '../../components/AcoesListagem';
import ConfigColunasModal from '../../components/ConfigColunasModal';
import { useListColumns } from '../../hooks/useListColumns';
import '../usuarios/Usuarios.css';
import '../CadastroListLayout.css';
import './Empresas.css';

const v = (x) => (x != null && x !== '' ? String(x) : '—');

const COLUNAS_EMPRESAS = [
  { id: 'cnpj', label: 'CNPJ' },
  { id: 'razaoSocial', label: 'Razão Social' },
  { id: 'nomeFantasia', label: 'Nome Fantasia' },
  { id: 'situacao', label: 'Situação' },
  { id: 'porte', label: 'Porte' },
  { id: 'cidadeUf', label: 'Cidade / UF' },
  { id: 'capitalSocial', label: 'Capital Social' },
];

function formatarMoeda(valor) {
  if (valor == null || valor === '' || Number.isNaN(Number(valor))) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(valor));
}

function normalizarTexto(str) {
  return String(str ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function EmpresasList() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);
  const [busca, setBusca] = useState('');
  const { visibleIds, setVisibleIds, allColumns } = useListColumns('empresas', COLUNAS_EMPRESAS);
  const [configColunasAberto, setConfigColunasAberto] = useState(false);

  const carregar = () => {
    setCarregando(true);
    setErro('');
    empresasApi.listar().then(setLista).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  };
  useEffect(() => carregar(), []);

  const handleExcluir = (id, razao) => {
    if (!window.confirm(`Excluir a empresa "${razao || 'sem nome'}"?`)) return;
    setExcluindo(id);
    empresasApi.remover(id).then(carregar).catch((e) => setErro(e.message)).finally(() => setExcluindo(null));
  };

  const termoBusca = normalizarTexto(busca).trim();
  const listaFiltrada = termoBusca
    ? lista.filter((e) => {
        const texto = [e.cnpj, e.razaoSocial, e.nomeFantasia, e.situacaoCadastral, e.porte, e.cidade, e.uf].join(' ');
        return normalizarTexto(texto).includes(termoBusca);
      })
    : lista;

  if (carregando) return <p className="page-loading">Carregando...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="cadastro-page cadastro-list-page empresas-list-page">
      <div className="page-header">
        <h1>Empresas</h1>
        <div className="page-header-actions">
          <input
            type="search"
            className="input-busca"
            placeholder="Buscar por CNPJ, razão social, nome fantasia..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar"
          />
          <button type="button" className="btn btn-secondary btn-config-colunas" onClick={() => setConfigColunasAberto(true)} title="Escolher e ordenar colunas">⚙ Colunas</button>
          <Link to="/empresas/novo" className="btn btn-primary">Nova empresa</Link>
        </div>
      </div>
      {termoBusca && (
        <p className="busca-resultado">
          {listaFiltrada.length} de {lista.length} registro(s)
        </p>
      )}
      <div className="table-wrap">
        <table className="table table-cadastro table-empresas">
          <thead>
            <tr>
              {visibleIds.map((id) => (
                <th key={id}>{COLUNAS_EMPRESAS.find((c) => c.id === id)?.label}</th>
              ))}
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan={visibleIds.length + 1}>{lista.length === 0 ? 'Nenhuma empresa cadastrada.' : 'Nenhum resultado para a busca.'}</td>
              </tr>
            ) : (
              listaFiltrada.map((e) => (
                <tr key={e.id}>
                  {visibleIds.map((id) => {
                    if (id === 'cnpj') return <td key={id} className="td-cnpj">{v(e.cnpj)}</td>;
                    if (id === 'razaoSocial') return <td key={id} className="td-razao td-texto" title={e.razaoSocial}>{v(e.razaoSocial)}</td>;
                    if (id === 'nomeFantasia') return <td key={id} className="td-fantasia td-texto" title={e.nomeFantasia}>{v(e.nomeFantasia)}</td>;
                    if (id === 'situacao') return <td key={id}>{v(e.situacaoCadastral)}</td>;
                    if (id === 'porte') return <td key={id}>{v(e.porte)}</td>;
                    if (id === 'cidadeUf') return <td key={id}>{v(e.cidade)}{e.cidade && e.uf ? ' / ' : ''}{v(e.uf)}</td>;
                    if (id === 'capitalSocial') return <td key={id} className="td-capital">{formatarMoeda(e.capitalSocial)}</td>;
                    return null;
                  })}
                  <td className="td-acoes">
                    <AcoesListagem basePath="/empresas" id={e.id} onExcluir={() => handleExcluir(e.id, e.razaoSocial)} excluindo={excluindo === e.id} />
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
