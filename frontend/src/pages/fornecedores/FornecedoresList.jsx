import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fornecedoresApi } from '../../api/client';
import AcoesListagem from '../../components/AcoesListagem';
import '../usuarios/Usuarios.css';
import '../CadastroListLayout.css';

const v = (x) => (x != null && x !== '' ? String(x) : '—');

function normalizarTexto(str) {
  return String(str ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function FornecedoresList() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);
  const [busca, setBusca] = useState('');

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
        <h1>Fornecedores / Desenvolvedores</h1>
        <div className="page-header-actions">
          <input
            type="search"
            className="input-busca"
            placeholder="Buscar por nome, CNPJ, e-mail, cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar"
          />
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
              <th>Nome / Razão Social</th>
              <th>Nome Fantasia</th>
              <th>CNPJ</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Cidade</th>
              <th>UF</th>
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan={8}>{lista.length === 0 ? 'Nenhum fornecedor cadastrado.' : 'Nenhum resultado para a busca.'}</td>
              </tr>
            ) : (
              listaFiltrada.map((f) => (
                <tr key={f.id}>
                  <td className="td-texto" title={f.nome}>{v(f.nome)}</td>
                  <td className="td-texto" title={f.nomeFantasia}>{v(f.nomeFantasia)}</td>
                  <td>{v(f.cnpj)}</td>
                  <td className="td-texto" title={f.email}>{v(f.email)}</td>
                  <td>{v(f.telefone)}</td>
                  <td>{v(f.cidade)}</td>
                  <td>{v(f.estado)}</td>
                  <td className="td-acoes">
                    <AcoesListagem basePath="/fornecedores" id={f.id} onExcluir={() => handleExcluir(f.id, f.nome)} excluindo={excluindo === f.id} />
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
