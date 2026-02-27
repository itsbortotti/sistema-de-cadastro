import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fornecedoresApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroListLayout.css';

const v = (x) => (x != null && x !== '' ? String(x) : '—');

export default function FornecedoresList() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);

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

  if (carregando) return <p>Carregando...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="usuarios-page cadastro-list-page">
      <div className="page-header">
        <h1>Fornecedores / Desenvolvedores</h1>
        <Link to="/fornecedores/novo" className="btn btn-primary">Novo fornecedor</Link>
      </div>
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
            {lista.length === 0 ? (
              <tr>
                <td colSpan={8}>Nenhum fornecedor cadastrado.</td>
              </tr>
            ) : (
              lista.map((f) => (
                <tr key={f.id}>
                  <td className="td-texto" title={f.nome}>{v(f.nome)}</td>
                  <td className="td-texto" title={f.nomeFantasia}>{v(f.nomeFantasia)}</td>
                  <td>{v(f.cnpj)}</td>
                  <td className="td-texto" title={f.email}>{v(f.email)}</td>
                  <td>{v(f.telefone)}</td>
                  <td>{v(f.cidade)}</td>
                  <td>{v(f.estado)}</td>
                  <td className="td-acoes">
                    <Link to={`/fornecedores/editar/${f.id}`} className="btn btn-sm">Editar</Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleExcluir(f.id, f.nome)}
                      disabled={excluindo === f.id}
                    >
                      {excluindo === f.id ? '...' : 'Excluir'}
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
