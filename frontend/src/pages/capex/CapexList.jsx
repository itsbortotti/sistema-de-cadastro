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

const TIPO_LABEL = { capex: 'Capex', opex: 'Opex' };
const MODELO_LABEL = { sistema: 'Sistema', infraestrutura: 'Infraestrutura' };

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
    if (!window.confirm(`Excluir este registro de Capex / Opex?\n${desc}`)) return;
    setExcluindo(id);
    capexApi.remover(id).then(carregar).catch((e) => setErro(e.message)).finally(() => setExcluindo(null));
  };

  const produtosTexto = (item) => {
    const nomes = item.produtoSoftwareNomes || item.produtoSoftwareIds || [];
    if (!Array.isArray(nomes) || nomes.length === 0) return '—';
    return nomes.slice(0, 3).join(', ') + (nomes.length > 3 ? ` +${nomes.length - 3}` : '');
  };

  if (carregando) return <p className="page-loading">Carregando...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="usuarios-page cadastro-list-page">
      <div className="page-header">
        <h1>Capex / Opex</h1>
        <Link to="/capex/novo" className="btn btn-primary">Novo Capex / Opex</Link>
      </div>
      <div className="table-wrap">
        <table className="table table-cadastro">
          <thead>
            <tr>
              <th>Área</th>
              <th>Tipo</th>
              <th>Modelo</th>
              <th>Fornecedor</th>
              <th>Valor (R$)</th>
              <th>Data inicial</th>
              <th>Data final</th>
              <th>Produtos</th>
              <th>OBS</th>
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr><td colSpan={10}>Nenhum cadastrado.</td></tr>
            ) : (
              lista.map((item) => (
                <tr key={item.id}>
                  <td className="td-texto" title={item.areaNome}>{v(item.areaNome)}</td>
                  <td>{TIPO_LABEL[item.classificacao] ?? item.classificacao ?? '—'}</td>
                  <td>{MODELO_LABEL[item.modelo] ?? item.modelo ?? '—'}</td>
                  <td className="td-texto" title={item.fornecedorNome}>{v(item.fornecedorNome)}</td>
                  <td className="td-numero">{formatarMoeda(item.valor)}</td>
                  <td>{formatarData(item.dataInicio)}</td>
                  <td>{formatarData(item.dataFim)}</td>
                  <td className="td-texto" title={(item.produtoSoftwareNomes || []).join(', ')}>{produtosTexto(item)}</td>
                  <td className="td-texto td-obs" title={item.observacoes}>{item.observacoes ? (item.observacoes.length > 20 ? item.observacoes.slice(0, 20) + '…' : item.observacoes) : '—'}</td>
                  <td className="td-acoes">
                    <Link to={`/capex/editar/${item.id}`} className="btn btn-sm">Editar</Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleExcluir(item.id, `${v(item.areaNome)} - ${formatarMoeda(item.valor)}`)}
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
