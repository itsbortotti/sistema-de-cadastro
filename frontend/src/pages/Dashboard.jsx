import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { produtosSoftwareApi, capexApi, projetosApi } from '../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import './Dashboard.css';

function formatarMoeda(valor) {
  if (valor == null || valor === 0) return 'R$ 0';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valor);
}

function truncar(str, max = 18) {
  if (!str || typeof str !== 'string') return str ?? '—';
  return str.length <= max ? str : str.slice(0, max - 1).trim() + '…';
}

const CORES = ['#02b0c6', '#131b71', '#ff401a', '#2E7D32', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#6366f1'];
const COR_CAPEX = '#131b71';
const COR_OPEX = '#02b0c6';
const CORES_CAPEX = {
  acima: '#dc2626',
  abaixo: '#16a34a',
  no_limite: '#2563eb',
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
  const [projetos, setProjetos] = useState([]);
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
        setErro('Não foi possível conectar ao servidor. Verifique sua conexão.');
      }
    }, 15000);
    Promise.all([
      produtosSoftwareApi.listar(),
      capexApi.listar(),
      projetosApi.listar().catch(() => []),
    ])
      .then(([listaProd, listaCapex, listaProjetos]) => {
        if (!cancel) {
          setErro(null);
          setProdutos(Array.isArray(listaProd) ? listaProd : []);
          setCapexList(Array.isArray(listaCapex) ? listaCapex : []);
          setProjetos(Array.isArray(listaProjetos) ? listaProjetos : []);
        }
      })
      .catch((e) => {
        if (!cancel) setErro(e?.message || 'Erro ao carregar dados. Tente novamente.');
      })
      .finally(() => {
        if (!cancel) {
          clearTimeout(timeout);
          setCarregando(false);
        }
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
    (capexList || []).forEach((c) => {
      if (c.dataInicio) {
        const y = parseInt(String(c.dataInicio).substring(0, 4), 10);
        if (!Number.isNaN(y)) set.add(y);
      }
    });
    return [...set].sort((a, b) => a - b);
  }, [produtos, capexList]);

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
    return produtos.filter((p) => produtoAplicaAoAno(p, Number(anoFiltro)));
  }, [produtos, anoFiltro]);

  const projetoAplicaAoAno = (p, anoNum) => {
    if (!p) return false;
    const ini = p.dataInicio ? parseInt(String(p.dataInicio).substring(0, 4), 10) : null;
    const fim = p.dataFim ? parseInt(String(p.dataFim).substring(0, 4), 10) : null;
    if (ini != null && fim != null && !Number.isNaN(ini) && !Number.isNaN(fim)) return anoNum >= ini && anoNum <= fim;
    return true;
  };

  const projetosFiltrados = useMemo(() => {
    if (!anoFiltro || anoFiltro === '') return projetos;
    return projetos.filter((p) => projetoAplicaAoAno(p, Number(anoFiltro)));
  }, [projetos, anoFiltro]);

  const capexAplicaAoAno = (c, ano) => {
    if (c.ano != null && c.ano === ano) return true;
    if (c.dataInicio && c.dataFim) {
      const yIni = parseInt(String(c.dataInicio).substring(0, 4), 10);
      const yFim = parseInt(String(c.dataFim).substring(0, 4), 10);
      return !Number.isNaN(yIni) && !Number.isNaN(yFim) && ano >= yIni && ano <= yFim;
    }
    return false;
  };

  /** Totais e dados por sistema/produto para insights OPEX e CAPEX */
  const insightsOpexCapex = useMemo(() => {
    const anoNum = anoFiltro ? Number(anoFiltro) : null;
    const listaCapex = (capexList || []).filter((c) => !anoNum || capexAplicaAoAno(c, anoNum));

    let totalOpexSistemas = 0;   // OPEX real (infra) dos sistemas
    let totalCapexSistemas = 0;  // CAPEX real (licenças) dos sistemas
    let totalOpexPlanejado = 0;  // soma registros tipo opex
    let totalCapexPlanejado = 0; // soma registros tipo capex

    const opexPorSistema = {};
    const capexPorSistema = {};
    const opexPlanejadoPorSistema = {};
    const capexPlanejadoPorProjeto = {};
    const mapaProjetos = {};
    projetos.forEach((pr) => { mapaProjetos[pr.id] = pr.nome || pr.id; });

    produtosFiltrados.forEach((p) => {
      const nome = p.nomeSistema || p.id || '—';
      const opex = Number(p.custoMensalInfraestrutura) || 0;
      const capex = Number(p.custoMensalSistema) || 0;
      totalOpexSistemas += opex;
      totalCapexSistemas += capex;
      opexPorSistema[p.id] = { id: p.id, nome, nomeCompleto: nome, valor: opex * mult };
      if (!capexPorSistema[p.id]) capexPorSistema[p.id] = { id: p.id, nome: truncar(nome, 20), nomeCompleto: nome, valor: 0 };
      capexPorSistema[p.id].valor += capex * mult;
    });

    listaCapex.forEach((c) => {
      const valor = Number(c.valor) || 0;
      if ((c.classificacao || 'capex') === 'opex') {
        totalOpexPlanejado += valor;
        const ids = c.produtoSoftwareIds || [];
        const n = Math.max(ids.length, 1);
        ids.forEach((sid) => {
          const id = String(sid).trim();
          if (!id) return;
          opexPlanejadoPorSistema[id] = (opexPlanejadoPorSistema[id] || 0) + valor / n;
        });
      } else {
        totalCapexPlanejado += valor;
        const ids = c.projetoIds || [];
        const n = Math.max(ids.length, 1);
        ids.forEach((pid) => {
          const id = String(pid).trim();
          if (!id) return;
          capexPlanejadoPorProjeto[id] = (capexPlanejadoPorProjeto[id] || 0) + valor / n;
        });
      }
    });

    const opexPorSistemaArray = Object.values(opexPorSistema)
      .filter((x) => x.valor > 0)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 15)
      .map((x) => ({ ...x, nome: truncar(x.nomeCompleto, 22) }));

    const capexPorSistemaArray = Object.values(capexPorSistema)
      .filter((x) => x.valor > 0)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 15)
      .map((x) => ({ ...x, nome: truncar(x.nomeCompleto, 22) }));

    const opexPlanejadoPorSistemaArray = Object.entries(opexPlanejadoPorSistema)
      .map(([id, valor]) => {
        const p = produtos.find((x) => String(x.id) === id);
        const nome = p?.nomeSistema || id;
        return { id, nome: truncar(nome, 22), nomeCompleto: nome, valor };
      })
      .filter((x) => x.valor > 0)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 15);

    const capexPlanejadoPorProjetoArray = Object.entries(capexPlanejadoPorProjeto)
      .map(([id, valor]) => ({ id, nome: truncar(mapaProjetos[id] || id, 22), nomeCompleto: mapaProjetos[id] || id, valor }))
      .filter((x) => x.valor > 0)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 12);

    const comparativoPorSistema = produtosFiltrados
      .map((p) => {
        const nome = p.nomeSistema || p.id || '—';
        const opex = (Number(p.custoMensalInfraestrutura) || 0) * mult;
        const capex = (Number(p.custoMensalSistema) || 0) * mult;
        return {
          id: p.id,
          nome: truncar(nome, 18),
          nomeCompleto: nome,
          opex,
          capex,
          total: opex + capex,
        };
      })
      .filter((x) => x.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);

    /** Comparativo OPEX cadastrado (orçamento) vs usado (custo real) – em base anual */
    const opexUsadoAnualPorSistema = {};
    produtosFiltrados.forEach((p) => {
      const id = String(p.id);
      const usadoAnual = (Number(p.custoMensalInfraestrutura) || 0) * 12;
      opexUsadoAnualPorSistema[id] = { id, nome: p.nomeSistema || p.id || '—', usadoAnual };
    });
    const TOLERANCIA_OPEX = 0.02;
    const TOLERANCIA_OPEX_ABS = 50;
    const idsOpex = new Set([...Object.keys(opexUsadoAnualPorSistema), ...Object.keys(opexPlanejadoPorSistema)]);
    const comparativoOpexCadastradoVsUsado = [];
    let totaisOpexComparativo = { cadastrado: 0, usado: 0, acima: 0, abaixo: 0, noLimite: 0 };
    idsOpex.forEach((id) => {
      const cadastrado = opexPlanejadoPorSistema[id] || 0;
      const usado = opexUsadoAnualPorSistema[id]?.usadoAnual ?? 0;
      if (cadastrado === 0 && usado === 0) return;
      const p = produtosFiltrados.find((x) => String(x.id) === id);
      const nomeCompleto = p?.nomeSistema || id;
      totaisOpexComparativo.cadastrado += cadastrado;
      totaisOpexComparativo.usado += usado;
      const diferenca = usado - cadastrado;
      let status = null;
      if (cadastrado > 0) {
        const threshold = Math.max(cadastrado * TOLERANCIA_OPEX, TOLERANCIA_OPEX_ABS);
        if (Math.abs(diferenca) <= threshold) {
          status = 'no_limite';
          totaisOpexComparativo.noLimite += 1;
        } else if (diferenca > 0) {
          status = 'acima';
          totaisOpexComparativo.acima += 1;
        } else {
          status = 'abaixo';
          totaisOpexComparativo.abaixo += 1;
        }
      }
      comparativoOpexCadastradoVsUsado.push({
        id,
        nome: truncar(nomeCompleto, 22),
        nomeCompleto,
        opexCadastrado: cadastrado,
        opexUsado: usado,
        diferenca,
        status,
      });
    });
    comparativoOpexCadastradoVsUsado.sort((a, b) => Math.abs(b.diferenca) - Math.abs(a.diferenca));
    const comparativoOpexParaGrafico = comparativoOpexCadastradoVsUsado.slice(0, 12);
    const anoRefOpex = anoFiltro || 'Todos';

    /** Comparativo Capex por projeto: cadastrado (orçamento) vs usado (custo real dos sistemas do projeto) – base anual */
    const capexUsadoPorProjeto = {};
    projetosFiltrados.forEach((proj) => {
      const ids = proj.produtoSoftwareIds || [];
      let usadoAnual = 0;
      ids.forEach((pid) => {
        const prod = produtosFiltrados.find((x) => String(x.id) === String(pid));
        if (prod) {
          const sis = Number(prod.custoMensalSistema) || 0;
          const inf = Number(prod.custoMensalInfraestrutura) || 0;
          usadoAnual += (sis + inf) * 12;
        }
      });
      if (usadoAnual > 0 || (capexPlanejadoPorProjeto[proj.id] || 0) > 0) {
        capexUsadoPorProjeto[proj.id] = usadoAnual;
      }
    });
    const TOLERANCIA_CAPEX_PROJ = 0.02;
    const TOLERANCIA_CAPEX_PROJ_ABS = 50;
    const comparativoCapexCadastradoVsUsadoProjeto = [];
    let totaisCapexProjetoComparativo = { cadastrado: 0, usado: 0, acima: 0, abaixo: 0, noLimite: 0 };
    const idsProjetosComparativo = new Set([...Object.keys(capexPlanejadoPorProjeto), ...Object.keys(capexUsadoPorProjeto)]);
    idsProjetosComparativo.forEach((id) => {
      const cadastrado = capexPlanejadoPorProjeto[id] || 0;
      const usado = capexUsadoPorProjeto[id] ?? 0;
      if (cadastrado === 0 && usado === 0) return;
      const proj = projetos.find((x) => String(x.id) === id);
      const nomeCompleto = proj?.nome || id;
      totaisCapexProjetoComparativo.cadastrado += cadastrado;
      totaisCapexProjetoComparativo.usado += usado;
      const diferenca = usado - cadastrado;
      let status = null;
      if (cadastrado > 0) {
        const threshold = Math.max(cadastrado * TOLERANCIA_CAPEX_PROJ, TOLERANCIA_CAPEX_PROJ_ABS);
        if (Math.abs(diferenca) <= threshold) {
          status = 'no_limite';
          totaisCapexProjetoComparativo.noLimite += 1;
        } else if (diferenca > 0) {
          status = 'acima';
          totaisCapexProjetoComparativo.acima += 1;
        } else {
          status = 'abaixo';
          totaisCapexProjetoComparativo.abaixo += 1;
        }
      }
      comparativoCapexCadastradoVsUsadoProjeto.push({
        id,
        nome: truncar(nomeCompleto, 22),
        nomeCompleto,
        capexCadastrado: cadastrado,
        capexUsado: usado,
        diferenca,
        status,
      });
    });
    comparativoCapexCadastradoVsUsadoProjeto.sort((a, b) => Math.abs(b.diferenca) - Math.abs(a.diferenca));
    const comparativoCapexProjetoParaGrafico = comparativoCapexCadastradoVsUsadoProjeto.slice(0, 12);
    const anoRefCapexProjeto = anoFiltro || 'Todos';

    return {
      totalOpexSistemas: totalOpexSistemas * mult,
      totalCapexSistemas: totalCapexSistemas * mult,
      totalOpexPlanejado,
      totalCapexPlanejado,
      opexPorSistema: opexPorSistemaArray,
      capexPorSistema: capexPorSistemaArray,
      opexPlanejadoPorSistema: opexPlanejadoPorSistemaArray,
      capexPlanejadoPorProjeto: capexPlanejadoPorProjetoArray,
      comparativoPorSistema,
      comparativoOpexCadastradoVsUsado,
      comparativoOpexParaGrafico,
      totaisOpexComparativo,
      anoRefOpex,
      comparativoCapexCadastradoVsUsadoProjeto,
      comparativoCapexProjetoParaGrafico,
      totaisCapexProjetoComparativo,
      anoRefCapexProjeto,
    };
  }, [produtosFiltrados, produtos, capexList, projetos, projetosFiltrados, anoFiltro, mult]);

  /** Comparativo Capex vs custo real por área (ano selecionado) */
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
      custoPorAreaId[areaId].custoReal += custoAnual;
    });
    const capexPorAreaId = {};
    (capexList || [])
      .filter((c) => (c.classificacao || 'capex') === 'capex' && capexAplicaAoAno(c, anoNum))
      .forEach((c) => {
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

  const ins = insightsOpexCapex || {};
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
            <p className="dashboard-subtitle">Insights de OPEX e CAPEX por produtos e sistemas</p>
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
          <span className="dashboard-card-label">Total de sistemas</span>
          <span className="dashboard-card-value">{produtosFiltrados.length}</span>
        </div>
        <div className="dashboard-card">
          <span className="dashboard-card-label">OPEX – Infraestrutura ({periodoAtual.label.toLowerCase()})</span>
          <span className="dashboard-card-value dashboard-card-moeda">{formatarMoeda(ins.totalOpexSistemas)}</span>
          <span className="dashboard-card-hint">Custo infra dos sistemas</span>
        </div>
        <div className="dashboard-card">
          <span className="dashboard-card-label">CAPEX – Licenças ({periodoAtual.label.toLowerCase()})</span>
          <span className="dashboard-card-value dashboard-card-moeda">{formatarMoeda(ins.totalCapexSistemas)}</span>
          <span className="dashboard-card-hint">Custo sistema dos sistemas</span>
        </div>
        <div className="dashboard-card dashboard-card-destaque">
          <span className="dashboard-card-label">Custo total sistemas ({periodoAtual.label.toLowerCase()})</span>
          <span className="dashboard-card-value dashboard-card-moeda">{formatarMoeda((ins.totalOpexSistemas || 0) + (ins.totalCapexSistemas || 0))}</span>
        </div>
        <div className="dashboard-card">
          <span className="dashboard-card-label">OPEX planejado (cadastro)</span>
          <span className="dashboard-card-value dashboard-card-moeda">{formatarMoeda(ins.totalOpexPlanejado)}</span>
          <span className="dashboard-card-hint">Soma registros Opex</span>
        </div>
        <div className="dashboard-card">
          <span className="dashboard-card-label">Capex planejado (cadastro)</span>
          <span className="dashboard-card-value dashboard-card-moeda">{formatarMoeda(ins.totalCapexPlanejado)}</span>
          <span className="dashboard-card-hint">Soma registros Capex</span>
        </div>
      </section>

      {ins.comparativoOpexCadastradoVsUsado?.length > 0 && (
        <section className="dashboard-cards dashboard-cards-opex-comparativo">
          <div className="dashboard-card">
            <span className="dashboard-card-label">OPEX cadastrado (anual)</span>
            <span className="dashboard-card-value dashboard-card-moeda">{formatarMoeda(ins.totaisOpexComparativo?.cadastrado ?? 0)}</span>
            <span className="dashboard-card-hint">Orçamento nos registros Opex</span>
          </div>
          <div className="dashboard-card">
            <span className="dashboard-card-label">OPEX usado (anual)</span>
            <span className="dashboard-card-value dashboard-card-moeda">{formatarMoeda(ins.totaisOpexComparativo?.usado ?? 0)}</span>
            <span className="dashboard-card-hint">Custo infra dos sistemas</span>
          </div>
          <div className="dashboard-card dashboard-card-acima">
            <span className="dashboard-card-label">Sistemas acima do orçamento</span>
            <span className="dashboard-card-value">{ins.totaisOpexComparativo?.acima ?? 0}</span>
            <span className="dashboard-card-hint">Usado &gt; cadastrado</span>
          </div>
          <div className="dashboard-card dashboard-card-abaixo">
            <span className="dashboard-card-label">Sistemas abaixo do orçamento</span>
            <span className="dashboard-card-value">{ins.totaisOpexComparativo?.abaixo ?? 0}</span>
            <span className="dashboard-card-hint">Usado &lt; cadastrado</span>
          </div>
        </section>
      )}

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

      {produtosFiltrados.length === 0 ? (
        <p className="dashboard-vazio">Nenhum sistema cadastrado. Os insights de OPEX e CAPEX aparecerão aqui quando houver sistemas.</p>
      ) : (
        <>
          {temFiltroAno && comparativoCapex.porArea.length > 0 && (
            <section className="dashboard-secao dashboard-capex-tabela">
              <h2 className="dashboard-secao-titulo">Capex vs custo real por área (ano {anoFiltro})</h2>
              <p className="dashboard-tabela-dica">Clique em uma área para ver os sistemas vinculados.</p>
              <div className="dashboard-tabela-capex-wrap">
                <table className="dashboard-tabela-capex">
                  <thead>
                    <tr>
                      <th>Ano de referência</th>
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
                          title="Clique para ver os sistemas desta área"
                        >
                          <td>{anoFiltro}</td>
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

          {ins.comparativoOpexCadastradoVsUsado?.length > 0 && (
            <section className="dashboard-secao dashboard-capex-tabela">
              <h2 className="dashboard-secao-titulo">Comparativo OPEX: cadastrado vs usado (anual) – Ano de referência: {ins.anoRefOpex ?? (anoFiltro || 'Todos')}</h2>
              <p className="dashboard-tabela-dica">Orçamento cadastrado nos registros Opex vs custo real de infraestrutura dos sistemas. Valores em base anual.</p>
              <div className="dashboard-graficos" style={{ marginBottom: '1.5rem' }}>
                <div className="dashboard-grafico-box dashboard-grafico-full">
                  <h3 className="dashboard-grafico-titulo">OPEX cadastrado vs usado por sistema (top 12)</h3>
                  <div className="dashboard-grafico-container">
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={ins.comparativoOpexParaGrafico} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatarMoeda(v)} />
                        <YAxis type="category" dataKey="nome" width={200} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value, name) => [formatarMoeda(value), name === 'opexCadastrado' ? 'OPEX cadastrado' : 'OPEX usado']}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _}
                        />
                        <Legend />
                        <Bar dataKey="opexCadastrado" fill="#6366f1" name="OPEX cadastrado" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="opexUsado" fill={COR_OPEX} name="OPEX usado" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="dashboard-tabela-capex-wrap">
                <table className="dashboard-tabela-capex">
                  <thead>
                    <tr>
                      <th>Ano de referência</th>
                      <th>Sistema</th>
                      <th>OPEX cadastrado (anual)</th>
                      <th>OPEX usado (anual)</th>
                      <th>Diferença</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ins.comparativoOpexCadastradoVsUsado
                      .sort((a, b) => Math.abs(b.diferenca) - Math.abs(a.diferenca))
                      .map((r) => (
                        <tr key={r.id}>
                          <td>{ins.anoRefOpex ?? (anoFiltro || 'Todos')}</td>
                          <td title={r.nomeCompleto}>{r.nomeCompleto}</td>
                          <td>{formatarMoeda(r.opexCadastrado)}</td>
                          <td>{formatarMoeda(r.opexUsado)}</td>
                          <td>
                            {r.opexCadastrado > 0 || r.opexUsado > 0
                              ? (r.diferenca >= 0 ? '+' : '') + formatarMoeda(r.diferenca)
                              : '—'}
                          </td>
                          <td>
                            {r.status === 'acima' && <span className="dashboard-badge dashboard-badge-acima">Acima (estourou)</span>}
                            {r.status === 'abaixo' && <span className="dashboard-badge dashboard-badge-abaixo">Abaixo (economia)</span>}
                            {r.status === 'no_limite' && <span className="dashboard-badge dashboard-badge-no-limite">No limite</span>}
                            {!r.status && r.opexCadastrado === 0 && r.opexUsado > 0 && <span className="dashboard-badge dashboard-badge-default">Sem orçamento cadastrado</span>}
                            {!r.status && r.opexCadastrado > 0 && r.opexUsado === 0 && <span className="dashboard-badge dashboard-badge-default">Sem custo usado</span>}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {ins.comparativoCapexCadastradoVsUsadoProjeto?.length > 0 && (
            <section className="dashboard-secao dashboard-capex-tabela">
              <h2 className="dashboard-secao-titulo">Comparativo Capex por projeto: cadastrado vs usado (anual) – Ano de referência: {ins.anoRefCapexProjeto ?? (anoFiltro || 'Todos')}</h2>
              <p className="dashboard-tabela-dica">Orçamento cadastrado nos registros Capex vs custo real (sistema + infra) dos sistemas vinculados ao projeto. Valores em base anual.</p>
              <div className="dashboard-cards dashboard-cards-opex-comparativo" style={{ marginBottom: '1rem' }}>
                <div className="dashboard-card">
                  <span className="dashboard-card-label">Capex cadastrado (anual)</span>
                  <span className="dashboard-card-value dashboard-card-moeda">{formatarMoeda(ins.totaisCapexProjetoComparativo?.cadastrado ?? 0)}</span>
                </div>
                <div className="dashboard-card">
                  <span className="dashboard-card-label">Capex usado (anual)</span>
                  <span className="dashboard-card-value dashboard-card-moeda">{formatarMoeda(ins.totaisCapexProjetoComparativo?.usado ?? 0)}</span>
                </div>
                <div className="dashboard-card dashboard-card-acima">
                  <span className="dashboard-card-label">Projetos acima do orçamento</span>
                  <span className="dashboard-card-value">{ins.totaisCapexProjetoComparativo?.acima ?? 0}</span>
                </div>
                <div className="dashboard-card dashboard-card-abaixo">
                  <span className="dashboard-card-label">Projetos abaixo do orçamento</span>
                  <span className="dashboard-card-value">{ins.totaisCapexProjetoComparativo?.abaixo ?? 0}</span>
                </div>
              </div>
              <div className="dashboard-graficos" style={{ marginBottom: '1.5rem' }}>
                <div className="dashboard-grafico-box dashboard-grafico-full">
                  <h3 className="dashboard-grafico-titulo">Capex cadastrado vs usado por projeto (top 12) – Ano de referência: {ins.anoRefCapexProjeto}</h3>
                  <div className="dashboard-grafico-container">
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={ins.comparativoCapexProjetoParaGrafico} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatarMoeda(v)} />
                        <YAxis type="category" dataKey="nome" width={200} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value, name) => [formatarMoeda(value), name === 'capexCadastrado' ? 'Capex cadastrado' : 'Capex usado']}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _}
                        />
                        <Legend />
                        <Bar dataKey="capexCadastrado" fill="#6366f1" name="Capex cadastrado" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="capexUsado" fill={COR_CAPEX} name="Capex usado" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="dashboard-tabela-capex-wrap">
                <table className="dashboard-tabela-capex">
                  <thead>
                    <tr>
                      <th>Ano de referência</th>
                      <th>Projeto</th>
                      <th>Capex cadastrado (anual)</th>
                      <th>Capex usado (anual)</th>
                      <th>Diferença</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ins.comparativoCapexCadastradoVsUsadoProjeto
                      .sort((a, b) => Math.abs(b.diferenca) - Math.abs(a.diferenca))
                      .map((r) => (
                        <tr key={r.id}>
                          <td>{ins.anoRefCapexProjeto ?? (anoFiltro || 'Todos')}</td>
                          <td title={r.nomeCompleto}>{r.nomeCompleto}</td>
                          <td>{formatarMoeda(r.capexCadastrado)}</td>
                          <td>{formatarMoeda(r.capexUsado)}</td>
                          <td>
                            {r.capexCadastrado > 0 || r.capexUsado > 0
                              ? (r.diferenca >= 0 ? '+' : '') + formatarMoeda(r.diferenca)
                              : '—'}
                          </td>
                          <td>
                            {r.status === 'acima' && <span className="dashboard-badge dashboard-badge-acima">Acima (estourou)</span>}
                            {r.status === 'abaixo' && <span className="dashboard-badge dashboard-badge-abaixo">Abaixo (economia)</span>}
                            {r.status === 'no_limite' && <span className="dashboard-badge dashboard-badge-no-limite">No limite</span>}
                            {!r.status && r.capexCadastrado === 0 && r.capexUsado > 0 && <span className="dashboard-badge dashboard-badge-default">Sem orçamento cadastrado</span>}
                            {!r.status && r.capexCadastrado > 0 && r.capexUsado === 0 && <span className="dashboard-badge dashboard-badge-default">Sem custo usado</span>}
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
                    Sistemas da área: {detalheArea.areaNome}
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
                      return <p className="dashboard-modal-vazio">Nenhum sistema vinculado a esta área no ano selecionado.</p>;
                    }
                    return (
                      <table className="dashboard-tabela-capex dashboard-modal-tabela">
                        <thead>
                          <tr>
                            <th>Sistema</th>
                            <th>CAPEX (licença)</th>
                            <th>OPEX (infra)</th>
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

          <section className="dashboard-secao">
            <h2 className="dashboard-secao-titulo">OPEX e CAPEX por sistema ({periodoAtual.label.toLowerCase()})</h2>
            <div className="dashboard-graficos">
              <div className="dashboard-grafico-box dashboard-grafico-full">
                <h3 className="dashboard-grafico-titulo">OPEX (infraestrutura) por sistema – Top 15</h3>
                <div className="dashboard-grafico-container">
                  {ins.opexPorSistema?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={ins.opexPorSistema} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatarMoeda(v)} />
                        <YAxis type="category" dataKey="nome" width={200} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => [formatarMoeda(v), 'OPEX']} labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _} />
                        <Bar dataKey="valor" fill={COR_OPEX} name="OPEX" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="dashboard-grafico-vazio">Nenhum custo de infraestrutura nos sistemas.</p>
                  )}
                </div>
              </div>

              <div className="dashboard-grafico-box dashboard-grafico-full">
                <h3 className="dashboard-grafico-titulo">CAPEX (licenças) por sistema – Top 15</h3>
                <div className="dashboard-grafico-container">
                  {ins.capexPorSistema?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={ins.capexPorSistema} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatarMoeda(v)} />
                        <YAxis type="category" dataKey="nome" width={200} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => [formatarMoeda(v), 'CAPEX']} labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _} />
                        <Bar dataKey="valor" fill={COR_CAPEX} name="CAPEX" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="dashboard-grafico-vazio">Nenhum custo de licença nos sistemas.</p>
                  )}
                </div>
              </div>

              <div className="dashboard-grafico-box dashboard-grafico-full">
                <h3 className="dashboard-grafico-titulo">Comparativo CAPEX vs OPEX por sistema (top 12)</h3>
                <div className="dashboard-grafico-container">
                  {ins.comparativoPorSistema?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={ins.comparativoPorSistema} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }} stackOffset="sign">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatarMoeda(v)} />
                        <YAxis type="category" dataKey="nome" width={180} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(v, name) => [formatarMoeda(v), name === 'capex' ? 'CAPEX (licença)' : 'OPEX (infra)']}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _}
                        />
                        <Legend />
                        <Bar dataKey="capex" stackId="a" fill={COR_CAPEX} name="CAPEX (licença)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="opex" stackId="a" fill={COR_OPEX} name="OPEX (infra)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="dashboard-grafico-vazio">Sem dados para comparativo.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-secao">
            <h2 className="dashboard-secao-titulo">Orçamento planejado – Opex e Capex (cadastro)</h2>
            <div className="dashboard-graficos">
              <div className="dashboard-grafico-box">
                <h3 className="dashboard-grafico-titulo">OPEX planejado por sistema (top 15)</h3>
                <div className="dashboard-grafico-container">
                  {ins.opexPlanejadoPorSistema?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={ins.opexPlanejadoPorSistema} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatarMoeda(v)} />
                        <YAxis type="category" dataKey="nome" width={180} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => [formatarMoeda(v), 'OPEX planejado']} labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _} />
                        <Bar dataKey="valor" fill={COR_OPEX} name="OPEX planejado" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="dashboard-grafico-vazio">Nenhum registro Opex associado a sistemas.</p>
                  )}
                </div>
              </div>

              <div className="dashboard-grafico-box">
                <h3 className="dashboard-grafico-titulo">Capex planejado por projeto (top 12)</h3>
                <div className="dashboard-grafico-container">
                  {ins.capexPlanejadoPorProjeto?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={ins.capexPlanejadoPorProjeto} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatarMoeda(v)} />
                        <YAxis type="category" dataKey="nome" width={180} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => [formatarMoeda(v), 'Capex planejado']} labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _} />
                        <Bar dataKey="valor" fill={COR_CAPEX} name="Capex planejado" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="dashboard-grafico-vazio">Nenhum registro Capex associado a projetos.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
