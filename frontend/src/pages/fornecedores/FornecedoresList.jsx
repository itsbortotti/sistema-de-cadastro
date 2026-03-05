import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fornecedoresApi } from '../../api/client';
import AcoesListagem from '../../components/AcoesListagem';
import ConfigColunasModal from '../../components/ConfigColunasModal';
import { useListColumns } from '../../hooks/useListColumns';
import '../usuarios/Usuarios.css';
import '../CadastroListLayout.css';

const v = (x) => (x != null && x !== '' ? String(x) : '—');

const COLUNAS_FORNECEDORES = [
  { id: 'nome', label: 'Nome / Razão Social' },
  { id: 'nomeFantasia', label: 'Nome Fantasia' },
  { id: 'cnpj', label: 'CNPJ' },
  { id: 'email', label: 'E-mail' },
  { id: 'telefone', label: 'Telefone' },
  { id: 'cidade', label: 'Cidade' },
  { id: 'uf', label: 'UF' },
];

function normalizarTexto(str) {
  return String(str ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function FornecedoresList() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);
  const [busca, setBusca] = useState('');
  const { visibleIds, setVisibleIds, allColumns } = useListColumns('fornecedores', COLUNAS_FORNECEDORES);
  const [configColunasAberto, setConfigColunasAberto] = useState(false);

  const carregar = () => {
    setCarregando(true);
    setErro('');
    fornecedoresApi.listar().then(setLista).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  };
  useEffect(() => carregar(), []);

  const handleExcluir = (id, nome) => {
    if (!window.confirm(`Excluir o fornecedor "${nome}"?`)) return;
    setExcluindo(id);
    fornecedoresApi.remover(id).then(carregar).catch((e) => setErro(e.message)).finally(() => setExcluindo(null));
  };

  const termoBusca = normalizarTexto(busca).trim();
  const listaFiltrada = termoBusca
    ? lista.filter((f) => {
        const texto = [f.nome, f.nomeFantasia, f.razaoSocial, f.cnpj, f.email, f.telefone, f.cidade, f.estado].join(' ');
        return normalizarTexto(texto).includes(termoBusca);
      })
    : lista;

  if (carregando) return <p className="page-loading">Carregando...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="cadastro-page cadastro-list-page">
      <div className="page-header">
        <div className="page-header-actions">
          <input
            type="search"
            className="input-busca"
            placeholder="Buscar por nome, CNPJ, e-mail, cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar"
          />
          <button type="button" className="btn btn-secondary btn-config-colunas" onClick={() => setConfigColunasAberto(true)} title="Escolher e ordenar colunas">⚙ Colunas</button>
          <Link to="/fornecedores/novo" className="btn btn-primary">Novo fornecedor</Link>
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
                <th key={id}>{COLUNAS_FORNECEDORES.find((c) => c.id === id)?.label}</th>
              ))}
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan={visibleIds.length + 1}>{lista.length === 0 ? 'Nenhum fornecedor cadastrado.' : 'Nenhum resultado para a busca.'}</td>
              </tr>
            ) : (
              listaFiltrada.map((f) => (
                <tr key={f.id}>
                  {visibleIds.map((id) => {
                    if (id === 'nome') return <td key={id} className="td-texto" title={f.nome}>{v(f.nome)}</td>;
                    if (id === 'nomeFantasia') return <td key={id} className="td-texto" title={f.nomeFantasia}>{v(f.nomeFantasia)}</td>;
                    if (id === 'cnpj') return <td key={id}>{v(f.cnpj)}</td>;
                    if (id === 'email') return <td key={id} className="td-texto" title={f.email}>{v(f.email)}</td>;
                    if (id === 'telefone') return <td key={id}>{v(f.telefone)}</td>;
                    if (id === 'cidade') return <td key={id}>{v(f.cidade)}</td>;
                    if (id === 'uf') return <td key={id}>{v(f.estado)}</td>;
                    return null;
                  })}
                  <td className="td-acoes">
                    <AcoesListagem basePath="/fornecedores" id={f.id} onExcluir={() => handleExcluir(f.id, f.nome)} excluindo={excluindo === f.id} />
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
