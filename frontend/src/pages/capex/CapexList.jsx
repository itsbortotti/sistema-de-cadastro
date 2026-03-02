import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { capexApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroListLayout.css';

function v(val) {
  return val != null && String(val).trim() !== '' ? String(val).trim() : '—';
}

function formatarMoeda(valor) {
  if (valor == null || valor === '') return '—';
  const n = Number(valor);
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);
}

const PERIODO_LABEL = { anual: 'Anual', semestral: 'Semestral', mensal: 'Mensal' };
const TIPO_LABEL = { sistema: 'Sistema', infraestrutura: 'Infraestrutura' };

export default function CapexList() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);

  const carregar = () => {
    setCarregando(true);
    setErro('');
    capexApi.listar().then(setLista).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  };
  useEffect(() => carregar(), []);

  const handleExcluir = (id, desc) => {
    if (!window.confirm(`Excluir este registro de Capex?\n${desc}`)) return;
    setExcluindo(id);
    capexApi.remover(id).then(carregar).catch((e) => setErro(e.message)).finally(() => setExcluindo(null));
  };

  if (carregando) return <p className="page-loading">Carregando...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="usuarios-page cadastro-list-page">
      <div className="page-header">
        <h1>Capex</h1>
        <Link to="/capex/novo" className="btn btn-primary">Novo Capex</Link>
      </div>
      <div className="table-wrap">
        <table className="table table-cadastro">
          <thead>
            <tr>
              <th>Área</th>
              <th>Período</th>
              <th>Tipo</th>
              <th>Fornecedor</th>
              <th>Valor (R$)</th>
              <th>Ano</th>
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr><td colSpan={7}>Nenhum cadastrado.</td></tr>
            ) : (
              lista.map((item) => (
                <tr key={item.id}>
                  <td className="td-texto" title={item.areaNome}>{v(item.areaNome)}</td>
                  <td>{PERIODO_LABEL[item.periodo] ?? item.periodo}</td>
                  <td>{TIPO_LABEL[item.tipo] ?? item.tipo}</td>
                  <td className="td-texto" title={item.fornecedorNome}>{v(item.fornecedorNome)}</td>
                  <td className="td-numero">{formatarMoeda(item.valor)}</td>
                  <td>{item.ano != null ? item.ano : '—'}</td>
                  <td className="td-acoes">
                    <Link to={`/capex/editar/${item.id}`} className="btn btn-sm">Editar</Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleExcluir(item.id, `${v(item.areaNome)} - ${PERIODO_LABEL[item.periodo]} - ${formatarMoeda(item.valor)}`)}
                      disabled={excluindo === item.id}
                    >
                      {excluindo === item.id ? '...' : 'Excluir'}
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
