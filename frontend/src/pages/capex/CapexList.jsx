import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { capexApi } from '../../api/client';
import AcoesListagem from '../../components/AcoesListagem';
import '../usuarios/Usuarios.css';
import '../CadastroListLayout.css';
import './CapexList.css';

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

function somaEntradas(entradas) {
  if (!Array.isArray(entradas)) return 0;
  return entradas.reduce((acc, e) => acc + (Number(e.valor) || 0), 0);
}

const ABA_SEM = 'sem';
const ABA_COM_SALDO = 'com_saldo';
const ABA_USADO = 'usado';

export default function CapexList({ tipo = 'capex' }) {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState(ABA_SEM);

  const carregar = () => {
    setCarregando(true);
    setErro('');
    capexApi.listar().then(setLista).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  };
  useEffect(() => carregar(), []);

  const handleExcluir = (id, desc) => {
    const labelTipo = tipo === 'capex' ? 'Capex' : 'Opex';
    if (!window.confirm(`Excluir este registro de ${labelTipo}?\n${desc}`)) return;
    setExcluindo(id);
    capexApi.remover(id).then(carregar).catch((e) => setErro(e.message)).finally(() => setExcluindo(null));
  };

  const labelTipo = tipo === 'capex' ? 'Capex' : 'Opex';
  const listaPorTipo = lista.filter((item) => (item.classificacao || 'capex') === tipo);

  const { semValores, comSaldoDisponivel, saldoUsado } = useMemo(() => {
    const sem = [];
    const comSaldo = [];
    const usado = [];
    const valorNum = (item) => Number(item.valor) || 0;
    for (const item of listaPorTipo) {
      const total = valorNum(item);
      const lancado = somaEntradas(item.entradas);
      if (lancado === 0) sem.push(item);
      else if ((total > 0 && lancado >= total) || (total === 0 && lancado > 0)) usado.push(item);
      else comSaldo.push(item); // lancado > 0 e ainda há saldo (lancado < total)
    }
    return { semValores: sem, comSaldoDisponivel: comSaldo, saldoUsado: usado };
  }, [listaPorTipo]);

  const associadosTexto = (item) => {
    const nomes = tipo === 'capex' ? (item.projetoNomes || item.projetoIds || []) : (item.produtoSoftwareNomes || item.produtoSoftwareIds || []);
    if (!Array.isArray(nomes) || nomes.length === 0) return '—';
    return nomes.slice(0, 3).join(', ') + (nomes.length > 3 ? ` +${nomes.length - 3}` : '');
  };

  const normalizarTexto = (str) =>
    String(str ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const filtrarPorBusca = (arr) => {
    const termo = normalizarTexto(busca).trim();
    if (!termo) return arr;
    return arr.filter((item) => {
      const associados = tipo === 'capex' ? (item.projetoNomes || []) : (item.produtoSoftwareNomes || []);
      const texto = [item.areaNome, item.fornecedorNome, item.valor, item.observacoes, ...associados].join(' ') || '';
      return normalizarTexto(texto).includes(termo);
    });
  };

  const listasPorAba = {
    [ABA_SEM]: filtrarPorBusca(semValores),
    [ABA_COM_SALDO]: filtrarPorBusca(comSaldoDisponivel),
    [ABA_USADO]: filtrarPorBusca(saldoUsado),
  };
  const listaAtiva = listasPorAba[abaAtiva];
  const termoBusca = normalizarTexto(busca).trim();
  const totalAbaAtiva = abaAtiva === ABA_SEM ? semValores.length : abaAtiva === ABA_COM_SALDO ? comSaldoDisponivel.length : saldoUsado.length;

  if (carregando) return <p className="page-loading">Carregando...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="cadastro-page cadastro-list-page capex-list-page">
      <div className="page-header">
        <h1>{labelTipo}</h1>
        <div className="page-header-actions">
          <input
            type="search"
            className="input-busca"
            placeholder={tipo === 'capex' ? 'Buscar por área, fornecedor, projetos, observações...' : 'Buscar por área, fornecedor, sistemas, observações...'}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar"
          />
          <Link to={`/${tipo}/novo`} className="btn btn-primary">Novo {labelTipo}</Link>
        </div>
      </div>

      <div className="tabs-horizontal">
        <button
          type="button"
          className={`tab-item ${abaAtiva === ABA_SEM ? 'active' : ''}`}
          onClick={() => setAbaAtiva(ABA_SEM)}
          aria-selected={abaAtiva === ABA_SEM}
        >
          {labelTipo} sem valores lançados <span className="tab-badge">{semValores.length}</span>
        </button>
        <button
          type="button"
          className={`tab-item ${abaAtiva === ABA_COM_SALDO ? 'active' : ''}`}
          onClick={() => setAbaAtiva(ABA_COM_SALDO)}
          aria-selected={abaAtiva === ABA_COM_SALDO}
        >
          {labelTipo} com saldo disponível <span className="tab-badge">{comSaldoDisponivel.length}</span>
        </button>
        <button
          type="button"
          className={`tab-item ${abaAtiva === ABA_USADO ? 'active' : ''}`}
          onClick={() => setAbaAtiva(ABA_USADO)}
          aria-selected={abaAtiva === ABA_USADO}
        >
          {labelTipo} com saldo totalmente usado <span className="tab-badge">{saldoUsado.length}</span>
        </button>
      </div>

      {termoBusca && (
        <p className="busca-resultado">
          {listaAtiva.length} de {totalAbaAtiva} registro(s) nesta aba
        </p>
      )}

      <div className="table-wrap">
        <table className="table table-cadastro">
          <thead>
            <tr>
              <th>Área</th>
              <th>Fornecedor</th>
              <th>Valor (R$)</th>
              <th>Data inicial</th>
              <th>Data final</th>
              <th>{tipo === 'capex' ? 'Projetos' : 'Sistemas'}</th>
              <th>OBS</th>
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaAtiva.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  {totalAbaAtiva === 0
                    ? (abaAtiva === ABA_SEM
                      ? `Nenhum ${labelTipo} sem valores lançados.`
                      : abaAtiva === ABA_COM_SALDO
                        ? `Nenhum ${labelTipo} com saldo disponível.`
                        : `Nenhum ${labelTipo} com saldo totalmente usado.`)
                    : 'Nenhum resultado para a busca.'}
                </td>
              </tr>
            ) : (
              listaAtiva.map((item) => (
                <tr key={item.id}>
                  <td className="td-texto" title={item.areaNome}>{v(item.areaNome)}</td>
                  <td className="td-texto" title={item.fornecedorNome}>{v(item.fornecedorNome)}</td>
                  <td className="td-numero">{formatarMoeda(item.valor)}</td>
                  <td>{formatarData(item.dataInicio)}</td>
                  <td>{formatarData(item.dataFim)}</td>
                  <td className="td-texto" title={(tipo === 'capex' ? (item.projetoNomes || []) : (item.produtoSoftwareNomes || [])).join(', ')}>{associadosTexto(item)}</td>
                  <td className="td-texto td-obs" title={item.observacoes}>{item.observacoes ? (item.observacoes.length > 20 ? item.observacoes.slice(0, 20) + '…' : item.observacoes) : '—'}</td>
                  <td className="td-acoes">
                    <AcoesListagem basePath={`/${tipo}`} id={item.id} onExcluir={() => handleExcluir(item.id, `${v(item.areaNome)} - ${formatarMoeda(item.valor)}`)} excluindo={excluindo === item.id} />
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
