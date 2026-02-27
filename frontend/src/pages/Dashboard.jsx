import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { produtosSoftwareApi } from '../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
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

  useEffect(() => {
    let cancel = false;
    produtosSoftwareApi
      .listar()
      .then((lista) => {
        if (!cancel) setProdutos(Array.isArray(lista) ? lista : []);
      })
      .catch((e) => {
        if (!cancel) setErro(e.message || 'Erro ao carregar dados');
      })
      .finally(() => {
        if (!cancel) setCarregando(false);
      });
    return () => { cancel = true; };
  }, []);

  const periodoAtual = useMemo(() => PERIODOS.find((p) => p.id === periodoId) || PERIODOS[1], [periodoId]);
  const mult = periodoAtual.multiplicador;

  const dadosGraficos = useMemo(() => {
    const porArea = {};
    const porHospedagem = {};
    const porSatisfacao = {};
    const porFornecedor = {};
    const custoPorProduto = [];
    const custoPorArea = {};
    const custoPorFornecedor = {};
    let custoSistema = 0;
    let custoInfra = 0;

    produtos.forEach((p) => {
      const sis = p.custoMensalSistema != null ? Number(p.custoMensalSistema) : 0;
      const inf = p.custoMensalInfraestrutura != null ? Number(p.custoMensalInfraestrutura) : 0;
      custoSistema += sis;
      custoInfra += inf;
      const custoTotalProd = sis + inf;

      const area = p.areaNome || 'Não informado';
      porArea[area] = (porArea[area] || 0) + 1;
      custoPorArea[area] = (custoPorArea[area] || 0) + custoTotalProd;

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

    const hospedagemData = Object.entries(porHospedagem).map(([nome, value]) => ({ name: nome, value }));

    const satisfacaoData = Object.entries(porSatisfacao)
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      .map(([name, value]) => ({ name, value }));

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

    return {
      porArea: areaData,
      porHospedagem: hospedagemData,
      porSatisfacao: satisfacaoData,
      porFornecedor: fornecedorData,
      totalProdutos: produtos.length,
      custoSistema: custoSistema * mult,
      custoInfra: custoInfra * mult,
      custoTotal: (custoSistema + custoInfra) * mult,
      topCustoProdutos,
      sistemaVsInfra,
      custoPorAreaData,
      custoPorFornecedorData,
    };
  }, [produtos, mult]);

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

  const {
    porArea,
    porHospedagem,
    porSatisfacao,
    porFornecedor,
    totalProdutos,
    custoTotal,
    custoSistema,
    custoInfra,
    topCustoProdutos,
    sistemaVsInfra,
    custoPorAreaData,
    custoPorFornecedorData,
  } = dadosGraficos;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-top">
          <div>
            <h1>Bem-vindo, {usuario?.nome || usuario?.login}</h1>
            <p className="dashboard-subtitle">Visão geral dos produtos de software e custos por período</p>
          </div>
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
        </div>
      </header>

      <section className="dashboard-cards">
        <div className="dashboard-card">
          <span className="dashboard-card-label">Total de produtos</span>
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

      {totalProdutos === 0 ? (
        <p className="dashboard-vazio">Nenhum produto cadastrado. Os gráficos aparecerão aqui quando houver dados.</p>
      ) : (
        <>
          {/* ——— Bloco: Insights de custo (dinâmicos por período) ——— */}
          <section className="dashboard-secao">
            <h2 className="dashboard-secao-titulo">Insights de custo ({periodoAtual.label.toLowerCase()})</h2>
            <div className="dashboard-graficos">
              <div className="dashboard-grafico-box dashboard-grafico-full">
                <h3 className="dashboard-grafico-titulo">Produtos que mais gastam (top 15)</h3>
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
                <div className="dashboard-grafico-container dashboard-grafico-pie">
                  {sistemaVsInfra.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={sistemaVsInfra}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill={CORES[0]} />
                          <Cell fill={CORES[1]} />
                        </Pie>
                        <Tooltip formatter={(value) => [formatarMoeda(value), 'Custo']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="dashboard-grafico-vazio">Sem dados de custo</p>
                  )}
                </div>
              </div>

              <div className="dashboard-grafico-box">
                <h3 className="dashboard-grafico-titulo">Custo por área</h3>
                <div className="dashboard-grafico-container">
                  {custoPorAreaData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={custoPorAreaData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatarMoeda(v)} />
                        <YAxis type="category" dataKey="nome" width={180} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value) => [formatarMoeda(value), 'Custo']}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _}
                        />
                        <Bar dataKey="custo" fill={CORES[2]} name="Custo" radius={[0, 4, 4, 0]} />
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

          {/* ——— Bloco: Distribuição (quantidade) ——— */}
          <section className="dashboard-secao">
            <h2 className="dashboard-secao-titulo">Distribuição por quantidade</h2>
            <div className="dashboard-graficos">
              <div className="dashboard-grafico-box">
                <h3 className="dashboard-grafico-titulo">Produtos por área</h3>
                <div className="dashboard-grafico-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={porArea} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="nome" width={180} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [value, 'Produtos']}
                        labelFormatter={(_, payload) => payload[0]?.payload?.nomeCompleto ?? _}
                      />
                      <Bar dataKey="total" fill={CORES[0]} name="Produtos" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="dashboard-grafico-box">
                <h3 className="dashboard-grafico-titulo">Produtos por hospedagem</h3>
                <div className="dashboard-grafico-container dashboard-grafico-pie">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={porHospedagem}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, percent }) => `${truncar(name, 14)}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {porHospedagem.map((_, i) => (
                          <Cell key={i} fill={CORES[i % CORES.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend formatter={(value) => truncar(value, 18)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="dashboard-grafico-box">
                <h3 className="dashboard-grafico-titulo">Grau de satisfação</h3>
                <div className="dashboard-grafico-container dashboard-grafico-pie">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={porSatisfacao}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, percent }) => `${truncar(name, 14)}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {porSatisfacao.map((_, i) => (
                          <Cell key={i} fill={CORES[i % CORES.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend formatter={(value) => truncar(value, 18)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="dashboard-grafico-box dashboard-grafico-full">
                <h3 className="dashboard-grafico-titulo">Top 10 fornecedores (quantidade de produtos)</h3>
                <div className="dashboard-grafico-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={porFornecedor} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="nome" width={180} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [value, 'Produtos']}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? _}
                      />
                      <Bar dataKey="total" fill={CORES[1]} name="Produtos" radius={[0, 4, 4, 0]} />
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
