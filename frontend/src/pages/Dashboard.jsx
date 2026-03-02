import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { produtosSoftwareApi, capexApi } from '../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Treemap,
  RadialBarChart,
  RadialBar,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';

import './Dashboard.css';

function formatarMoeda(valor) {
  if (valor == null || valor === 0) return 'R$ 0';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valor);
}

/** Trunca texto para caber nos eixos dos gráficos; mantém nomeCompleto para tooltip. */
function truncar(str, max = 18) {
  if (!str || typeof str !== 'string') return str ?? '—';
  return str.length <= max ? str : str.slice(0, max - 1).trim() + '…';
}

const CORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

/** Cores para indicativo Capex vs custo real */
const CORES_CAPEX = {
  acima: '#dc2626',      /* estourou - vermelho */
  abaixo: '#16a34a',    /* abaixo - verde */
  no_limite: '#2563eb', /* bateu certinho - azul */
  default: '#94a3b8',
};

const PERIODOS = [
  { id: 'semanal', label: 'Semanal', multiplicador: 1 / 4, descricao: 'Custo semanal (média)' },
  { id: 'mensal', label: 'Mensal', multiplicador: 1, descricao: 'Custo mensal' },
  { id: 'anual', label: 'Anual', multiplicador: 12, descricao: 'Custo anual' },
];

export default function Dashboard() {
  const { usuario } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [periodoId, setPeriodoId] = useState('mensal');
  const [anoFiltro, setAnoFiltro] = useState('');
  const [capexList, setCapexList] = useState([]);
  const [detalheArea, setDetalheArea] = useState(null);

  useEffect(() => {
    let cancel = false;
    const timeout = setTimeout(() => {
      if (!cancel) {
        setCarregando(false);
        setErro('Timeout ou servidor indisponível. Verifique se o backend está em http://localhost:3001');
      }
    }, 15000);
    produtosSoftwareApi
      .listar()
      .then((listaProd) => {
        if (!cancel) {
          setErro(null);
          setProdutos(Array.isArray(listaProd) ? listaProd : []);
        }
      })
      .catch((e) => {
        if (!cancel) setErro(e?.message || 'Erro ao carregar dados');
      })
      .finally(() => {
        if (!cancel) {
          clearTimeout(timeout);
          setCarregando(false);
        }
      });
    capexApi
      .listar()
      .then((listaCapex) => {
        if (!cancel) setCapexList(Array.isArray(listaCapex) ? listaCapex : []);
      })
      .catch(() => {
        if (!cancel) setCapexList([]);
      });
    return () => {
      cancel = true;
      clearTimeout(timeout);
    };
  }, []);

  const periodoAtual = useMemo(() => PERIODOS.find((p) => p.id === periodoId) || PERIODOS[1], [periodoId]);
  const mult = periodoAtual.multiplicador;

  const anosDisponiveis = useMemo(() => {
    const set = new Set();
    produtos.forEach((p) => {
      if (p.ano != null && !Number.isNaN(Number(p.ano))) set.add(Number(p.ano));
      if (p.dataInicio) {
        const y = parseInt(String(p.dataInicio).substring(0, 4), 10);
        if (!Number.isNaN(y)) set.add(y);
      }
      if (p.dataFim) {
        const y = parseInt(String(p.dataFim).substring(0, 4), 10);
        if (!Number.isNaN(y)) set.add(y);
      }
    });
    return [...set].sort((a, b) => a - b);
  }, [produtos]);

  const produtoAplicaAoAno = (p, anoNum) => {
    if (p.ano != null && Number(p.ano) === anoNum) return true;
    if (p.dataInicio || p.dataFim) {
      const yIni = p.dataInicio ? parseInt(String(p.dataInicio).substring(0, 4), 10) : anoNum;
      const yFim = p.dataFim ? parseInt(String(p.dataFim).substring(0, 4), 10) : anoNum;
      return !Number.isNaN(yIni) && !Number.isNaN(yFim) && anoNum >= yIni && anoNum <= yFim;
    }
    return false;
  };

  const produtosFiltrados = useMemo(() => {
    if (!anoFiltro || anoFiltro === '') return produtos;
    const anoNum = Number(anoFiltro);
    return produtos.filter((p) => produtoAplicaAoAno(p, anoNum));
  }, [produtos, anoFiltro]);

  /** Comparativo Capex vs custo real por área (só quando ano está selecionado). */
  const comparativoCapex = useMemo(() => {
    if (!anoFiltro || anoFiltro === '') return { porArea: [], totais: { acima: 0, abaixo: 0, noLimite: 0 }, porAreaNome: {} };
    const anoNum = Number(anoFiltro);
    const custoPorAreaId = {};
    produtosFiltrados.forEach((p) => {
      const areaId = p.areaId ? String(p.areaId) : null;
      const nome = p.areaNome || 'Não informado';
      const sis = Number(p.custoMensalSistema) || 0;
      const inf = Number(p.custoMensalInfraestrutura) || 0;
      const custoAnual = (sis + inf) * 12;
      if (!custoPorAreaId[areaId]) custoPorAreaId[areaId] = { areaNome: nome, custoReal: 0 };
      custoPorAreaId[areaId].areaNome = nome;
      custoPorAreaId[areaId].custoReal += custoAnual;
    });
    const capexAplicaAoAno = (c, ano) => {
      if (c.ano != null && c.ano === ano) return true;
      if (c.dataInicio && c.dataFim) {
        const yIni = parseInt(String(c.dataInicio).substring(0, 4), 10);
        const yFim = parseInt(String(c.dataFim).substring(0, 4), 10);
        return !Number.isNaN(yIni) && !Number.isNaN(yFim) && ano >= yIni && ano <= yFim;
      }
      return false;
    };
    const capexPorAreaId = {};
    (capexList || []).filter((c) => capexAplicaAoAno(c, anoNum)).forEach((c) => {
      const areaId = c.areaId ? String(c.areaId) : null;
      const total = (capexPorAreaId[areaId]?.total || 0) + (Number(c.valor) || 0);
      const areaNome = c.areaNome || 'Não informado';
      capexPorAreaId[areaId] = { total, areaNome: capexPorAreaId[areaId]?.areaNome || areaNome };
    });
    const areaIds = new Set([...Object.keys(custoPorAreaId), ...Object.keys(capexPorAreaId)]);
    const porArea = [];
    const totais = { acima: 0, abaixo: 0, noLimite: 0 };
    const porAreaNome = {};
    const TOLERANCIA_PERCENT = 0.01;
    const TOLERANCIA_ABS = 100;
    areaIds.forEach((areaId) => {
      const custoReal = custoPorAreaId[areaId]?.custoReal ?? 0;
      const capexTotal = capexPorAreaId[areaId]?.total ?? 0;
      const nome = custoPorAreaId[areaId]?.areaNome || capexPorAreaId[areaId]?.areaNome || 'Não informado';
      let status = null;
      if (capexTotal > 0) {
        const diff = custoReal - capexTotal;
        const threshold = Math.max(capexTotal * TOLERANCIA_PERCENT, TOLERANCIA_ABS);
        if (Math.abs(diff) <= threshold) {
          status = 'no_limite';
          totais.noLimite += 1;
        } else if (diff > 0) {
          status = 'acima';
          totais.acima += 1;
        } else {
          status = 'abaixo';
          totais.abaixo += 1;
        }
      }
      porArea.push({ areaId, areaNome: nome, custoReal, capexTotal, status });
      porAreaNome[nome] = status;
    });
    return { porArea, totais, porAreaNome };
  }, [produtosFiltrados, capexList, anoFiltro]);

  const dadosGraficos = useMemo(() => {
    const porArea = {};
    const porHospedagem = {};
    const porSatisfacao = {};
    const porFornecedor = {};
    const custoPorProduto = [];
    const custoPorArea = {};
    const custoPorAreaSistemaInfra = {};
    const custoPorFornecedor = {};
    let custoSistema = 0;
    let custoInfra = 0;

    produtosFiltrados.forEach((p) => {
      const sis = p.custoMensalSistema != null ? Number(p.custoMensalSistema) : 0;
      const inf = p.custoMensalInfraestrutura != null ? Number(p.custoMensalInfraestrutura) : 0;
      custoSistema += sis;
      custoInfra += inf;
      const custoTotalProd = sis + inf;

      const area = p.areaNome || 'Não informado';
      porArea[area] = (porArea[area] || 0) + 1;
      custoPorArea[area] = (custoPorArea[area] || 0) + custoTotalProd;
      if (!custoPorAreaSistemaInfra[area]) custoPorAreaSistemaInfra[area] = { custoSistema: 0, custoInfra: 0 };
      custoPorAreaSistemaInfra[area].custoSistema += sis;
      custoPorAreaSistemaInfra[area].custoInfra += inf;

      const hosp = p.hospedagemNome || 'Não informado';
      porHospedagem[hosp] = (porHospedagem[hosp] || 0) + 1;

      const sat = p.grauSatisfacao ? `Nota ${p.grauSatisfacao}` : 'Não informado';
      porSatisfacao[sat] = (porSatisfacao[sat] || 0) + 1;

      const forn = p.fornecedorNome || 'Não informado';
      porFornecedor[forn] = (porFornecedor[forn] || 0) + 1;
      custoPorFornecedor[forn] = (custoPorFornecedor[forn] || 0) + custoTotalProd;

      if (custoTotalProd > 0) {
        custoPorProduto.push({
          id: p.id,
          nome: truncar(p.nomeSistema, 24),
          nomeCompleto: p.nomeSistema || '—',
          custoMensal: custoTotalProd,
          custoSistema: sis,
          custoInfra: inf,
        });
      }
    });

    const areaData = Object.entries(porArea)
      .map(([nome, total]) => ({ nome: truncar(nome, 20), total, nomeCompleto: nome }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);

    const hospedagemData = Object.entries(porHospedagem)
      .map(([nome, value]) => ({ nome: truncar(nome, 20), nomeCompleto: nome, value }))
      .sort((a, b) => b.value - a.value);

    const satisfacaoData = Object.entries(porSatisfacao)
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      .map(([name, value]) => ({ nome: truncar(name, 20), nomeCompleto: name, value }));

    const fornecedorData = Object.entries(porFornecedor)
      .map(([nome, total]) => ({ nome: truncar(nome, 20), total, nomeCompleto: nome }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const topCustoProdutos = [...custoPorProduto]
      .sort((a, b) => b.custoMensal - a.custoMensal)
      .slice(0, 15)
      .map((item) => ({
        ...item,
        custoNoPeriodo: item.custoMensal * mult,
      }));

    const sistemaVsInfra = [
      { name: 'Sistema (licenças)', value: custoSistema * mult, valor: custoSistema * mult },
      { name: 'Infraestrutura', value: custoInfra * mult, valor: custoInfra * mult },
    ].filter((d) => d.value > 0);

    const custoPorAreaData = Object.entries(custoPorArea)
      .map(([nome, custo]) => ({
        nome: truncar(nome, 20),
        nomeCompleto: nome,
        custo: custo * mult,
      }))
      .sort((a, b) => b.custo - a.custo)
      .slice(0, 12);

    const custoPorFornecedorData = Object.entries(custoPorFornecedor)
      .map(([nome, custo]) => ({
        nome: truncar(nome, 20),
        nomeCompleto: nome,
        custo: custo * mult,
      }))
      .sort((a, b) => b.custo - a.custo)
      .slice(0, 10);

    const custoPorAreaStackedData = Object.entries(custoPorAreaSistemaInfra)
      .map(([nome, o]) => ({
        nome: truncar(nome, 18),
        nomeCompleto: nome,
        custoSistema: o.custoSistema * mult,
        custoInfra: o.custoInfra * mult,
        total: (o.custoSistema + o.custoInfra) * mult,
      }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const treemapCustoArea = Object.entries(custoPorArea)
      .map(([nome, custo], i) => ({ name: nome, value: custo * mult, fill: CORES[i % CORES.length] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const top5CustoOrdenado = [...custoPorProduto]
      .sort((a, b) => b.custoMensal - a.custoMensal)
      .slice(0, 5);
    const maxCustoTop5 = top5CustoOrdenado.length > 0 ? Math.max(...top5CustoOrdenado.map((i) => i.custoMensal * mult)) : 1;
    const top5Radial = top5CustoOrdenado.map((item, i) => ({
      name: truncar(item.nomeCompleto, 18),
      nomeCompleto: item.nomeCompleto,
      value: Math.round((item.custoMensal * mult) / maxCustoTop5 * 100),
      valorReal: item.custoMensal * mult,
      fill: CORES[i % CORES.length],
    }));

    const totalCustoGeral = custoSistema * mult + custoInfra * mult;
    let acum = 0;
    const top10CustoAcumulado = [...custoPorProduto]
      .sort((a, b) => b.custoMensal - a.custoMensal)
      .slice(0, 10)
      .map((item) => {
        acum += item.custoMensal * mult;
        return {
          nome: truncar(item.nomeCompleto, 16),
          nomeCompleto: item.nomeCompleto,
          custo: item.custoMensal * mult,
          acumulado: totalCustoGeral > 0 ? Math.round((acum / totalCustoGeral) * 100) : 0,
        };
      });

    return {
      porArea: areaData,
      porHospedagem: hospedagemData,
      porSatisfacao: satisfacaoData,
      porFornecedor: fornecedorData,
      totalProdutos: produtosFiltrados.length,
      custoSistema: custoSistema * mult,
      custoInfra: custoInfra * mult,
      custoTotal: (custoSistema + custoInfra) * mult,
      topCustoProdutos,
      sistemaVsInfra,
      custoPorAreaData,
      custoPorFornecedorData,
      custoPorAreaStackedData,
      treemapCustoArea,
      top5Radial,
      top10CustoAcumulado,
    };
  }, [produtosFiltrados, mult]);

  const d = dadosGraficos || {};
  const porArea = d.porArea ?? [];
  const porHospedagem = d.porHospedagem ?? [];
  const porSatisfacao = d.porSatisfacao ?? [];
  const porFornecedor = d.porFornecedor ?? [];
  const totalProdutos = d.totalProdutos ?? 0;
  const custoTotal = d.custoTotal ?? 0;
  const custoSistema = d.custoSistema ?? 0;
  const custoInfra = d.custoInfra ?? 0;
  const topCustoProdutos = d.topCustoProdutos ?? [];
  const sistemaVsInfra = d.sistemaVsInfra ?? [];
  const custoPorAreaData = d.custoPorAreaData ?? [];
  const custoPorFornecedorData = d.custoPorFornecedorData ?? [];
  const custoPorAreaStackedData = d.custoPorAreaStackedData ?? [];
  const treemapCustoArea = d.treemapCustoArea ?? [];
  const top5Radial = d.top5Radial ?? [];
  const top10CustoAcumulado = d.top10CustoAcumulado ?? [];

  const custoPorAreaComCapex = useMemo(() => {
    const mapa = (comparativoCapex && comparativoCapex.porAreaNome) || {};
    return (custoPorAreaData || []).map((item) => ({
      ...item,
      status: mapa[item.nomeCompleto] ?? null,
    }));
  }, [custoPorAreaData, comparativoCapex]);

  const temFiltroAno = Boolean(anoFiltro);
  const totaisCapex = (comparativoCapex && comparativoCapex.totais) || { acima: 0, abaixo: 0, noLimite: 0 };

  if (carregando) {
    return (
      <div className="dashboard">
        <h1>Bem-vindo, {usuario?.nome || usuario?.login}</h1>
        <p style={{ color: '#64748b' }}>Carregando dados...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="dashboard">
        <h1>Bem-vindo, {usuario?.nome || usuario?.login}</h1>
        <p style={{ color: '#dc2626' }}>{erro}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-top">
          <div>
            <h1>Bem-vindo, {usuario?.nome || usuario?.login}</h1>
            <p className="dashboard-subtitle">Visão geral dos projetos e custos por período</p>
          </div>
          <div className="dashboard-filtros">
            <div className="dashboard-periodo">
              <span className="dashboard-periodo-label">Período dos custos:</span>
              <div className="dashboard-periodo-btns">
                {PERIODOS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`dashboard-periodo-btn ${periodoId === p.id ? 'ativo' : ''}`}
                    onClick={() => setPeriodoId(p.id)}
                    title={p.descricao}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="dashboard-periodo dashboard-ano">
              <span className="dashboard-periodo-label">Ano (referência):</span>
              <div className="dashboard-periodo-btns">
                <button
                  type="button"
                  className={`dashboard-periodo-btn ${anoFiltro === '' ? 'ativo' : ''}`}
                  onClick={() => setAnoFiltro('')}
                  title="Exibir todos os anos"
                >
                  Todos
                </button>
                {anosDisponiveis.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`dashboard-periodo-btn ${anoFiltro === String(a) ? 'ativo' : ''}`}
                    onClick={() => setAnoFiltro(String(a))}
                    title={`Filtrar por ano ${a}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="dashboard-cards">
        <div className="dashboard-card">
          <span className="dashboard-card-label">Total de projetos</span>
          <span className="dashboard-card-value">{totalProdutos}</span>
        </div>
        <div className="dashboard-card dashboard-card-destaque">
          <span className="dashboard-card-label">Custo total ({periodoAtual.label.toLowerCase()})</span>
          <span className="dashboard-card-value dashboard-card-moeda">{formatarMoeda(custoTotal)}</span>
        </div>
        <div className="dashboard-card">
          <span className="dashboard-card-label">Custo sistema ({periodoAtual.label.toLowerCase()})</span>
          <span className="dashboard-card-value dashboard-card-moeda">{formatarMoeda(custoSistema)}</span>
        </div>
        <div className="dashboard-card">
          <span className="dashboard-card-label">Custo infraestrutura ({periodoAtual.label.toLowerCase()})</span>
          <span className="dashboard-card-value dashboard-card-moeda">{formatarMoeda(custoInfra)}</span>
        </div>
      </section>

      {temFiltroAno && (totaisCapex.acima > 0 || totaisCapex.abaixo > 0 || totaisCapex.noLimite > 0) && (
        <section className="dashboard-cards dashboard-cards-capex">
          <div className="dashboard-card dashboard-card-acima">
            <span className="dashboard-card-label">Áreas acima do Capex ({anoFiltro})</span>
            <span className="dashboard-card-value">{totaisCapex.acima}</span>
            <span className="dashboard-card-hint">Estouraram o orçamento</span>
          </div>
          <div className="dashboard-card dashboard-card-abaixo">
            <span className="dashboard-card-label">Áreas abaixo do Capex ({anoFiltro})</span>
            <span className="dashboard-card-value">{totaisCapex.abaixo}</span>
            <span className="dashboard-card-hint">Dentro do orçamento</span>
          </div>
          <div className="dashboard-card dashboard-card-no-limite">
            <span className="dashboard-card-label">Áreas no limite do Capex ({anoFiltro})</span>
            <span className="dashboard-card-value">{totaisCapex.noLimite}</span>
            <span className="dashboard-card-hint">Custo igual ao orçamento</span>
          </div>
        </section>
      )}

      {totalProdutos === 0 ? (
        <p className="dashboard-vazio">Nenhum projeto cadastrado. Os gráficos aparecerão aqui quando houver dados.</p>
      ) : (
        <>
          {temFiltroAno && comparativoCapex.porArea.length > 0 && (
            <section className="dashboard-secao dashboard-capex-tabela">
              <h2 className="dashboard-secao-titulo">Capex vs custo real por área (ano {anoFiltro})</h2>
              <p className="dashboard-tabela-dica">Clique em uma área para ver os projetos vinculados a ela.</p>
              <div className="dashboard-tabela-capex-wrap">
                <table className="dashboard-tabela-capex">
                  <thead>
                    <tr>
                      <th>Área</th>
                      <th>Capex (anual)</th>
                      <th>Custo real (anual)</th>
                      <th>Indicativo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparativoCapex.porArea
                      .filter((r) => r.capexTotal > 0 || r.custoReal > 0)
                      .sort((a, b) => (b.custoReal - b.capexTotal) - (a.custoReal - a.capexTotal))
                      .map((r) => (
                        <tr
                          key={r.areaId ?? r.areaNome}
                          className="dashboard-tabela-capex-row-clicavel"
                          onClick={() => setDetalheArea({ areaId: r.areaId, areaNome: r.areaNome, status: r.status })}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(ev) => ev.key === 'Enter' && setDetalheArea({ areaId: r.areaId, areaNome: r.areaNome, status: r.status })}
                          title="Clique para ver os produtos desta área"
                        >
                          <td>{r.areaNome}</td>
                          <td>{formatarMoeda(r.capexTotal)}</td>
                          <td>{formatarMoeda(r.custoReal)}</td>
                          <td>
                            {r.status === 'acima' && <span className="dashboard-badge dashboard-badge-acima">Acima do Capex</span>}
                            {r.status === 'abaixo' && <span className="dashboard-badge dashboard-badge-abaixo">Abaixo do Capex</span>}
                            {r.status === 'no_limite' && <span className="dashboard-badge dashboard-badge-no-limite">No limite</span>}
                            {!r.status && r.capexTotal === 0 && <span className="dashboard-badge dashboard-badge-default">Sem Capex</span>}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {detalheArea && (
            <div className="dashboard-modal-overlay" onClick={() => setDetalheArea(null)} role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
              <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
                <div className="dashboard-modal-header">
                  <h2 id="modal-titulo">
                    Projetos da área: {detalheArea.areaNome}
                    {detalheArea.status === 'acima' && <span className="dashboard-badge dashboard-badge-acima" style={{ marginLeft: '0.5rem' }}>Acima do Capex</span>}
                    {detalheArea.status === 'abaixo' && <span className="dashboard-badge dashboard-badge-abaixo" style={{ marginLeft: '0.5rem' }}>Abaixo do Capex</span>}
                    {detalheArea.status === 'no_limite' && <span className="dashboard-badge dashboard-badge-no-limite" style={{ marginLeft: '0.5rem' }}>No limite</span>}
                  </h2>
                  <button type="button" className="dashboard-modal-fechar" onClick={() => setDetalheArea(null)} aria-label="Fechar">×</button>
                </div>
                <div className="dashboard-modal-body">
                  {(() => {
                    const produtosDaArea = (produtosFiltrados || []).filter((p) => String(p.areaId) === String(detalheArea.areaId));
                    if (produtosDaArea.length === 0) {
                      return <p className="dashboard-modal-vazio">Nenhum projeto vinculado a esta área no ano selecionado.</p>;
                    }
                    return (
                      <table className="dashboard-tabela-capex dashboard-modal-tabela">
                        <thead>
                          <tr>
                            <th>Projeto</th>
                            <th>Custo mensal Sistema</th>
                            <th>Custo mensal Infra</th>
                            <th>Custo anual (total)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {produtosDaArea.map((p) => {
                            const sis = Number(p.custoMensalSistema) || 0;
                            const inf = Number(p.custoMensalInfraestrutura) || 0;
                            const anual = (sis + inf) * 12;
                            return (
                              <tr key={p.id}>
                                <td>{p.nomeSistema || '—'}</td>
                                <td>{formatarMoeda(sis)}</td>
                                <td>{formatarMoeda(inf)}</td>
                                <td>{formatarMoeda(anual)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ——— Bloco: Insights de custo (dinâmicos por período) ——— */}
          <section className="dashboard-secao">
            <h2 className="dashboard-secao-titulo">Insights de custo ({periodoAtual.label.toLowerCase()})</h2>
            <div className="dashboard-graficos">
              <div className="dashboard-grafico-box dashboard-grafico-full">
                <h3 className="dashboard-grafico-titulo">Projetos que mais gastam (top 15)</h3>
                <div className="dashboard-grafico-container">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={topCustoProdutos}
                      layout="vertical"
                      margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatarMoeda(v)} />
                      <YAxis type="category" dataKey="nome" width={200} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [formatarMoeda(value), 'Custo no período']}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _}
                      />
                      <Bar dataKey="custoNoPeriodo" fill={CORES[0]} name="Custo" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="dashboard-grafico-box">
                <h3 className="dashboard-grafico-titulo">Sistema vs Infraestrutura</h3>
                <div className="dashboard-grafico-container">
                  {sistemaVsInfra.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={sistemaVsInfra} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatarMoeda(v)} />
                        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => [formatarMoeda(value), 'Custo']} />
                        <Bar dataKey="value" name="Custo" radius={[0, 4, 4, 0]}>
                          {sistemaVsInfra.map((_, i) => (
                            <Cell key={i} fill={CORES[i % CORES.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="dashboard-grafico-vazio">Sem dados de custo</p>
                  )}
                </div>
              </div>

              <div className="dashboard-grafico-box">
                <h3 className="dashboard-grafico-titulo">
                  Custo por área
                  {temFiltroAno && (
                    <span className="dashboard-grafico-legend-capex">
                      <span className="dot dot-acima" /> Acima Capex
                      <span className="dot dot-abaixo" /> Abaixo
                      <span className="dot dot-no-limite" /> No limite
                    </span>
                  )}
                </h3>
                <div className="dashboard-grafico-container">
                  {custoPorAreaComCapex.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={custoPorAreaComCapex} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatarMoeda(v)} />
                        <YAxis type="category" dataKey="nome" width={180} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value, name, props) => {
                            const payload = props?.payload;
                            const statusLabel = payload?.status === 'acima' ? ' (acima do Capex)' : payload?.status === 'abaixo' ? ' (abaixo do Capex)' : payload?.status === 'no_limite' ? ' (no limite do Capex)' : '';
                            return [formatarMoeda(value), `Custo${statusLabel}`];
                          }}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _}
                        />
                        <Bar dataKey="custo" name="Custo" radius={[0, 4, 4, 0]}>
                          {custoPorAreaComCapex.map((entry, i) => (
                            <Cell key={entry.nomeCompleto ?? i} fill={entry.status ? CORES_CAPEX[entry.status] : CORES[2]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="dashboard-grafico-vazio">Sem dados de custo por área</p>
                  )}
                </div>
              </div>

              <div className="dashboard-grafico-box">
                <h3 className="dashboard-grafico-titulo">Custo por fornecedor (top 10)</h3>
                <div className="dashboard-grafico-container">
                  {custoPorFornecedorData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={custoPorFornecedorData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatarMoeda(v)} />
                        <YAxis type="category" dataKey="nome" width={180} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value) => [formatarMoeda(value), 'Custo']}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _}
                        />
                        <Bar dataKey="custo" fill={CORES[3]} name="Custo" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="dashboard-grafico-vazio">Sem dados de custo por fornecedor</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ——— Bloco: Mais visualizações (treemap, radial, stacked, composto) ——— */}
          <section className="dashboard-secao">
            <h2 className="dashboard-secao-titulo">Mais visualizações ({periodoAtual.label.toLowerCase()})</h2>
            <div className="dashboard-graficos">
              {treemapCustoArea.length > 0 && (
                <div className="dashboard-grafico-box">
                  <h3 className="dashboard-grafico-titulo">Custo por área (treemap)</h3>
                  <div className="dashboard-grafico-container dashboard-grafico-treemap">
                    <ResponsiveContainer width="100%" height={280}>
                      <Treemap
                        data={[{ name: 'Áreas', children: treemapCustoArea }]}
                        dataKey="value"
                        nameKey="name"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                      >
                        <Tooltip formatter={(value) => [formatarMoeda(value), 'Custo']} />
                      </Treemap>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {top5Radial.length > 0 && (
                <div className="dashboard-grafico-box">
                  <h3 className="dashboard-grafico-titulo">Top 5 projetos por custo (radial)</h3>
                  <div className="dashboard-grafico-container">
                    <ResponsiveContainer width="100%" height={280}>
                      <RadialBarChart data={top5Radial} innerRadius="20%" outerRadius="90%" startAngle={180} endAngle={0}>
                        <RadialBar dataKey="value" nameKey="name" background />
                        <Legend formatter={(value, entry) => entry?.payload?.nomeCompleto ?? value} />
                        <Tooltip formatter={(_, name, props) => [formatarMoeda(props.payload?.valorReal), name ?? props.payload?.nomeCompleto]} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {custoPorAreaStackedData.length > 0 && (
                <div className="dashboard-grafico-box">
                  <h3 className="dashboard-grafico-titulo">Custo Sistema vs Infra por área (barras empilhadas)</h3>
                  <div className="dashboard-grafico-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={custoPorAreaStackedData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatarMoeda(v)} />
                        <YAxis type="category" dataKey="nome" width={160} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value, name) => [formatarMoeda(value), name === 'custoSistema' ? 'Sistema (licenças)' : 'Infraestrutura']}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _}
                        />
                        <Legend />
                        <Bar dataKey="custoSistema" stackId="a" fill={CORES[0]} name="Sistema (licenças)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="custoInfra" stackId="a" fill={CORES[1]} name="Infraestrutura" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {top10CustoAcumulado.length > 0 && (
                <div className="dashboard-grafico-box dashboard-grafico-full">
                  <h3 className="dashboard-grafico-titulo">Top 10 projetos: custo e participação acumulada (%)</h3>
                  <div className="dashboard-grafico-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={top10CustoAcumulado} margin={{ top: 8, right: 48, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="nome" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => formatarMoeda(v)} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                          formatter={(value, name) => [name === 'acumulado' ? `${value}%` : formatarMoeda(value), name === 'acumulado' ? 'Acumulado' : 'Custo']}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="custo" fill={CORES[0]} name="Custo" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="acumulado" stroke={CORES[1]} strokeWidth={2} name="Participação acumulada (%)" dot={{ r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ——— Bloco: Distribuição (quantidade) ——— */}
          <section className="dashboard-secao">
            <h2 className="dashboard-secao-titulo">Distribuição por quantidade</h2>
            <div className="dashboard-graficos">
              <div className="dashboard-grafico-box">
                <h3 className="dashboard-grafico-titulo">Projetos por área</h3>
                <div className="dashboard-grafico-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={porArea} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="nome" width={180} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [value, 'Projetos']}
                        labelFormatter={(_, payload) => payload[0]?.payload?.nomeCompleto ?? _}
                      />
                      <Bar dataKey="total" fill={CORES[0]} name="Projetos" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="dashboard-grafico-box">
                <h3 className="dashboard-grafico-titulo">Projetos por hospedagem</h3>
                <div className="dashboard-grafico-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={porHospedagem} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="nome" width={180} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [value, 'Projetos']}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _}
                      />
                      <Bar dataKey="value" name="Projetos" radius={[0, 4, 4, 0]}>
                        {porHospedagem.map((_, i) => (
                          <Cell key={i} fill={CORES[i % CORES.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="dashboard-grafico-box">
                <h3 className="dashboard-grafico-titulo">Grau de satisfação</h3>
                <div className="dashboard-grafico-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={porSatisfacao} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="nome" width={180} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [value, 'Projetos']}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _}
                      />
                      <Bar dataKey="value" name="Projetos" radius={[0, 4, 4, 0]}>
                        {porSatisfacao.map((_, i) => (
                          <Cell key={i} fill={CORES[i % CORES.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="dashboard-grafico-box dashboard-grafico-full">
                <h3 className="dashboard-grafico-titulo">Top 10 fornecedores (quantidade de projetos)</h3>
                <div className="dashboard-grafico-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={porFornecedor} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="nome" width={180} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [value, 'Projetos']}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _}
                      />
                      <Bar dataKey="total" fill={CORES[1]} name="Projetos" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
