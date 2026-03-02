import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { empresasApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroListLayout.css';
import './Empresas.css';

const v = (x) => (x != null && x !== '' ? String(x) : '—');

function formatarMoeda(valor) {
  if (valor == null || valor === '' || Number.isNaN(Number(valor))) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(valor));
}

export default function EmpresasList() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);

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

  if (carregando) return <p className="page-loading">Carregando...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="usuarios-page cadastro-list-page empresas-list-page">
      <div className="page-header">
        <h1>Empresas</h1>
        <Link to="/empresas/novo" className="btn btn-primary">Nova empresa</Link>
      </div>
      <div className="table-wrap">
        <table className="table table-cadastro table-empresas">
          <thead>
            <tr>
              <th>CNPJ</th>
              <th>Razão Social</th>
              <th>Nome Fantasia</th>
              <th>Situação</th>
              <th>Porte</th>
              <th>Cidade / UF</th>
              <th>Capital Social</th>
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={8}>Nenhuma empresa cadastrada.</td>
              </tr>
            ) : (
              lista.map((e) => (
                <tr key={e.id}>
                  <td className="td-cnpj">{v(e.cnpj)}</td>
                  <td className="td-razao td-texto" title={e.razaoSocial}>{v(e.razaoSocial)}</td>
                  <td className="td-fantasia td-texto" title={e.nomeFantasia}>{v(e.nomeFantasia)}</td>
                  <td>{v(e.situacaoCadastral)}</td>
                  <td>{v(e.porte)}</td>
                  <td>{v(e.cidade)}{e.cidade && e.uf ? ' / ' : ''}{v(e.uf)}</td>
                  <td className="td-capital">{formatarMoeda(e.capitalSocial)}</td>
                  <td className="td-acoes">
                    <Link to={`/empresas/editar/${e.id}`} className="btn btn-sm">Editar</Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleExcluir(e.id, e.razaoSocial)}
                      disabled={excluindo === e.id}
                    >
                      {excluindo === e.id ? '...' : 'Excluir'}
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
