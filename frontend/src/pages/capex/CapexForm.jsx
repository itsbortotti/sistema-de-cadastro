import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { capexApi, areasApi, fornecedoresApi, produtosSoftwareApi, projetosApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroFormLayout.css';

export default function CapexForm({ tipo = 'capex', somenteLeitura = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);
  const labelTipo = tipo === 'capex' ? 'Capex' : 'Opex';
  const readOnly = somenteLeitura;

  const [areas, setAreas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [projetos, setProjetos] = useState([]);

  const [areaId, setAreaId] = useState('');
  const [classificacao, setClassificacao] = useState(tipo);
  const [fornecedorId, setFornecedorId] = useState('');
  const [valor, setValor] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [produtoSoftwareIds, setProdutoSoftwareIds] = useState([]);
  const [projetoIds, setProjetoIds] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [buscaAssociados, setBuscaAssociados] = useState('');
  const [entradas, setEntradas] = useState([]);
  const [novaEntradaValor, setNovaEntradaValor] = useState('');
  const [novaEntradaPeriodo, setNovaEntradaPeriodo] = useState('');

  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const mapaAreaNome = areas.reduce((acc, a) => ({ ...acc, [a.id]: a.nome || '' }), {});
  const busca = buscaAssociados.trim().toLowerCase();
  const produtosFiltrados = tipo === 'opex'
    ? (busca ? produtos.filter((p) => (p.nomeSistema || '').toLowerCase().includes(busca)) : produtos)
    : [];
  const projetosFiltrados = tipo === 'capex'
    ? (busca ? projetos.filter((p) => (p.nome || '').toLowerCase().includes(busca)) : projetos)
    : [];
  const selecionarTodosFiltrados = () => {
    if (tipo === 'opex') {
      const ids = produtosFiltrados.map((p) => p.id);
      setProdutoSoftwareIds((prev) => [...new Set([...prev, ...ids])]);
    } else {
      const ids = projetosFiltrados.map((p) => p.id);
      setProjetoIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };
  const limparSelecao = () => {
    if (tipo === 'opex') setProdutoSoftwareIds([]);
    else setProjetoIds([]);
  };
  const removerAssociado = (id) => {
    if (tipo === 'opex') setProdutoSoftwareIds((prev) => prev.filter((x) => x !== id));
    else setProjetoIds((prev) => prev.filter((x) => x !== id));
  };
  const produtosSelecionados = produtos.filter((p) => produtoSoftwareIds.includes(p.id));
  const projetosSelecionados = projetos.filter((p) => projetoIds.includes(p.id));

  const valorTotal = valor !== '' && !Number.isNaN(Number(valor)) ? Number(valor) : 0;
  const totalEntradas = entradas.reduce((acc, e) => acc + (Number(e.valor) || 0), 0);
  const saldoDisponivel = valorTotal - totalEntradas;

  const adicionarEntrada = () => {
    const v = novaEntradaValor === '' ? 0 : Number(novaEntradaValor);
    const p = (novaEntradaPeriodo || '').trim();
    if (v <= 0 || !p) return;
    if (totalEntradas + v > valorTotal) {
      setErro(`O valor da entrada (${v}) não pode superar o saldo disponível (${saldoDisponivel.toFixed(2)}). Valor total do ${labelTipo}: ${valorTotal.toFixed(2)}.`);
      return;
    }
    setErro('');
    const labelPeriodo = mesesDisponiveis.find((m) => m.value === p)?.label || p;
    setEntradas((prev) => [...prev, { id: `e-${Date.now()}`, valor: v, periodo: labelPeriodo }]);
    setNovaEntradaValor('');
    setNovaEntradaPeriodo('');
  };

  const removerEntrada = (entradaId) => setEntradas((prev) => prev.filter((e) => e.id !== entradaId));

  function formatarMoeda(n) {
    if (n == null || Number.isNaN(n)) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);
  }

  /** Lista de meses entre dataInicio e dataFim (YYYY-MM-DD), no formato { value: 'MM/YYYY', label: 'Jan/2025' } */
  function mesesDoPeriodo(ini, fim) {
    if (!ini || !fim || ini > fim) return [];
    const start = new Date(ini + 'T12:00:00');
    const end = new Date(fim + 'T12:00:00');
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
    const meses = [];
    const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cur <= endMonth) {
      const mm = String(cur.getMonth() + 1).padStart(2, '0');
      const yyyy = cur.getFullYear();
      const value = `${mm}/${yyyy}`;
      const label = `${nomes[cur.getMonth()]}/${yyyy}`;
      meses.push({ value, label });
      cur.setMonth(cur.getMonth() + 1);
    }
    return meses;
  }

  const mesesDisponiveis = mesesDoPeriodo(dataInicio, dataFim);

  useEffect(() => {
    const promises = [areasApi.listar(), fornecedoresApi.listar()];
    if (tipo === 'opex') promises.push(produtosSoftwareApi.listar());
    if (tipo === 'capex') promises.push(projetosApi.listar());
    Promise.all(promises)
      .then((results) => {
        setAreas(Array.isArray(results[0]) ? results[0] : []);
        setFornecedores(Array.isArray(results[1]) ? results[1] : []);
        if (tipo === 'opex') setProdutos(Array.isArray(results[2]) ? results[2] : []);
        if (tipo === 'capex') setProjetos(Array.isArray(results[2]) ? results[2] : []);
      })
      .catch((e) => setErro(e.message));
  }, [tipo]);

  useEffect(() => {
    if (isEdicao && id) {
      capexApi
        .buscar(id)
        .then((c) => {
          const classif = c.classificacao ?? 'capex';
          if (classif !== tipo) {
            navigate(`/${classif}/editar/${id}`, { replace: true });
            return;
          }
          setAreaId(c.areaId ?? '');
          setClassificacao(classif);
          setFornecedorId(c.fornecedorId ?? '');
          setValor(c.valor != null ? String(c.valor) : '');
          setDataInicio(c.dataInicio ?? (c.ano ? `${c.ano}-01-01` : ''));
          setDataFim(c.dataFim ?? (c.ano ? `${c.ano}-12-31` : ''));
          setProdutoSoftwareIds(Array.isArray(c.produtoSoftwareIds) ? c.produtoSoftwareIds : []);
          setProjetoIds(Array.isArray(c.projetoIds) ? c.projetoIds : []);
          setObservacoes(c.observacoes ?? '');
          setEntradas(Array.isArray(c.entradas) ? c.entradas : []);
        })
        .catch((e) => setErro(e.message));
    }
  }, [id, isEdicao, tipo, navigate]);

  /** Preenche datas do Capex com base nos projetos associados (data inicial mais antiga e data final mais recente). */
  useEffect(() => {
    if (tipo !== 'capex' || projetoIds.length === 0 || projetos.length === 0) return;
    const selecionados = projetos.filter((p) => projetoIds.includes(p.id));
    if (selecionados.length === 0) return;
    const inicios = selecionados.map((p) => p.dataInicio).filter((d) => d && String(d).trim());
    const fims = selecionados.map((p) => p.dataFim).filter((d) => d && String(d).trim());
    if (inicios.length > 0) setDataInicio(inicios.reduce((a, b) => (a < b ? a : b)));
    if (fims.length > 0) setDataFim(fims.reduce((a, b) => (a > b ? a : b)));
  }, [tipo, projetoIds, projetos]);

  /** Preenche datas do Opex com base nos sistemas associados (data inicial mais antiga e data final mais recente; usa ano do sistema se não houver data). */
  useEffect(() => {
    if (tipo !== 'opex' || produtoSoftwareIds.length === 0 || produtos.length === 0) return;
    const selecionados = produtos.filter((p) => produtoSoftwareIds.includes(p.id));
    if (selecionados.length === 0) return;
    const toInicio = (p) => (p.dataInicio && String(p.dataInicio).trim()) || (p.ano != null ? `${p.ano}-01-01` : null);
    const toFim = (p) => (p.dataFim && String(p.dataFim).trim()) || (p.ano != null ? `${p.ano}-12-31` : null);
    const inicios = selecionados.map(toInicio).filter(Boolean);
    const fims = selecionados.map(toFim).filter(Boolean);
    if (inicios.length > 0) setDataInicio(inicios.reduce((a, b) => (a < b ? a : b)));
    if (fims.length > 0) setDataFim(fims.reduce((a, b) => (a > b ? a : b)));
  }, [tipo, produtoSoftwareIds, produtos]);

  const handleToggleAssociado = (id) => {
    if (tipo === 'opex') {
      setProdutoSoftwareIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setProjetoIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (!areaId || !areaId.trim()) {
      setErro('Área é obrigatória.');
      return;
    }
    if (tipo === 'capex' && projetoIds.length === 0) {
      setErro('Selecione pelo menos um projeto associado ao Capex.');
      return;
    }
    if (tipo === 'opex' && produtoSoftwareIds.length === 0) {
      setErro('Selecione pelo menos um sistema associado ao Opex.');
      return;
    }
    const valorNum = valor === '' ? null : Number(valor);
    if (valorNum != null && Number.isNaN(valorNum)) {
      setErro('Valor deve ser um número.');
      return;
    }
    const ini = dataInicio.trim() || null;
    const fim = dataFim.trim() || null;
    if (ini && fim) {
      if (fim < ini) {
        setErro('A data final deve ser igual ou posterior à data inicial.');
        return;
      }
    }
    if (isEdicao && entradas.length > 0) {
      const totalE = entradas.reduce((acc, e) => acc + (Number(e.valor) || 0), 0);
      if (valorNum != null && totalE > valorNum) {
        setErro(`A soma das entradas (${totalE.toFixed(2)}) não pode superar o valor total do ${labelTipo} (${valorNum.toFixed(2)}). Remova ou ajuste algumas entradas.`);
        return;
      }
    }
    setEnviando(true);
    try {
      const payload = {
        areaId: areaId.trim(),
        classificacao: isEdicao ? classificacao : tipo,
        fornecedorId: fornecedorId.trim() || null,
        valor: valorNum,
        dataInicio: ini,
        dataFim: fim,
        produtoSoftwareIds: tipo === 'opex' ? produtoSoftwareIds : [],
        projetoIds: tipo === 'capex' ? projetoIds : [],
        observacoes: observacoes.trim(),
      };
      if (isEdicao) {
        payload.entradas = entradas;
      }
      if (isEdicao) await capexApi.atualizar(id, payload);
      else await capexApi.criar(payload);
      navigate(`/${tipo}`);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="cadastro-page form-cadastro-page">
      <div className="page-header">
        <h1>{readOnly ? `Ver ${labelTipo}` : isEdicao ? `Editar ${labelTipo}` : `Novo ${labelTipo}`}</h1>
        <div className="page-header-actions">
          <Link to={`/${tipo}`} className="btn btn-secondary">Voltar</Link>
        </div>
      </div>
      <form className="form-card form-cadastro" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}
        <fieldset disabled={readOnly} style={{ border: 'none', margin: 0, padding: 0 }}>
        <section className="form-secao form-secao-produtos">
          <h2 className="form-secao-titulo">{tipo === 'capex' ? 'Projetos associados' : 'Sistemas associados'}</h2>
          {tipo === 'capex' ? (
            <>
              {projetosSelecionados.length > 0 && (
                <div className="produtos-selecionados-resumo">
                  <span className="produtos-selecionados-label">
                    {projetosSelecionados.length} projeto(s) selecionado(s):
                  </span>
                  <div className="produtos-chips">
                    {projetosSelecionados.map((p) => (
                      <span key={p.id} className="produto-chip">
                        {p.nome || p.id}
                        <button type="button" className="produto-chip-remove" onClick={() => removerAssociado(p.id)} title="Remover" aria-label={`Remover ${p.nome || p.id}`}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="produtos-toolbar">
                <input type="search" className="produtos-busca" placeholder="Buscar por nome do projeto..." value={buscaAssociados} onChange={(e) => setBuscaAssociados(e.target.value)} aria-label="Buscar projetos" />
                <div className="produtos-acoes">
                  <button type="button" className="btn btn-sm btn-outline" onClick={selecionarTodosFiltrados}>Selecionar todos ({projetosFiltrados.length})</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={limparSelecao}>Limpar seleção</button>
                </div>
              </div>
              <div className="produtos-grid" role="list">
                {projetos.length === 0 ? <p className="form-hint">Nenhum projeto cadastrado.</p> : projetosFiltrados.length === 0 ? <p className="form-hint">Nenhum projeto encontrado para &quot;{buscaAssociados}&quot;.</p> : projetosFiltrados.map((p) => (
                  <label key={p.id} className={`produto-card ${projetoIds.includes(p.id) ? 'produto-card--selected' : ''}`} role="listitem">
                    <input type="checkbox" checked={projetoIds.includes(p.id)} onChange={() => handleToggleAssociado(p.id)} className="produto-card-check" />
                    <div className="produto-card-body">
                      <span className="produto-card-nome">{p.nome || p.id}</span>
                    </div>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <>
              {produtosSelecionados.length > 0 && (
                <div className="produtos-selecionados-resumo">
                  <span className="produtos-selecionados-label">
                    {produtosSelecionados.length} sistema(s) selecionado(s):
                  </span>
                  <div className="produtos-chips">
                    {produtosSelecionados.map((p) => (
                      <span key={p.id} className="produto-chip">
                        {p.nomeSistema || p.id}
                        <button type="button" className="produto-chip-remove" onClick={() => removerAssociado(p.id)} title="Remover" aria-label={`Remover ${p.nomeSistema || p.id}`}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="produtos-toolbar">
                <input type="search" className="produtos-busca" placeholder="Buscar por nome do sistema..." value={buscaAssociados} onChange={(e) => setBuscaAssociados(e.target.value)} aria-label="Buscar sistemas" />
                <div className="produtos-acoes">
                  <button type="button" className="btn btn-sm btn-outline" onClick={selecionarTodosFiltrados}>Selecionar todos ({produtosFiltrados.length})</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={limparSelecao}>Limpar seleção</button>
                </div>
              </div>
              <div className="produtos-grid" role="list">
                {produtos.length === 0 ? <p className="form-hint">Nenhum sistema cadastrado.</p> : produtosFiltrados.length === 0 ? <p className="form-hint">Nenhum sistema encontrado para &quot;{buscaAssociados}&quot;.</p> : produtosFiltrados.map((p) => {
                  const areaNome = mapaAreaNome[p.areaId] || (p.areaNome ?? '');
                  return (
                    <label key={p.id} className={`produto-card ${produtoSoftwareIds.includes(p.id) ? 'produto-card--selected' : ''}`} role="listitem">
                      <input type="checkbox" checked={produtoSoftwareIds.includes(p.id)} onChange={() => handleToggleAssociado(p.id)} className="produto-card-check" />
                      <div className="produto-card-body">
                        <span className="produto-card-nome">{p.nomeSistema || p.id}</span>
                        {areaNome && <span className="produto-card-meta">{areaNome}</span>}
                      </div>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Dados do {labelTipo}</h2>
          <label className="form-group">
            <span className="form-label">Área *</span>
            <select value={areaId} onChange={(e) => setAreaId(e.target.value)} required>
              <option value="">— Selecione a área —</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Fornecedor</span>
            <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
              <option value="">— Nenhum / Selecione —</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Valor (R$)</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
            />
          </label>
        </section>

        <section className="form-secao form-secao-periodo">
          <h2 className="form-secao-titulo">Período</h2>
          {tipo === 'capex' ? (
            <p className="form-hint">As datas são preenchidas automaticamente com base nos projetos associados (data inicial mais antiga e data final mais recente). Você pode ajustá-las se necessário.</p>
          ) : tipo === 'opex' ? (
            <p className="form-hint">As datas são preenchidas automaticamente com base nos sistemas associados (data inicial mais antiga e data final mais recente). Você pode ajustá-las se necessário.</p>
          ) : (
            <p className="form-hint">Informe o intervalo de vigência do {labelTipo} (opcional).</p>
          )}
          <div className="form-row-datas">
            <label className="form-group form-group-inline">
              <span className="form-label">Data inicial</span>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                max={dataFim || undefined}
                aria-label="Data inicial do período"
              />
            </label>
            <label className="form-group form-group-inline">
              <span className="form-label">Data final</span>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                min={dataInicio || undefined}
                aria-label="Data final do período"
              />
            </label>
          </div>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Observações</h2>
          <label className="form-group">
            <span className="form-label">Observações (OBS)</span>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder={`Anotações sobre o ${labelTipo}`}
              rows={4}
            />
          </label>
        </section>

        {isEdicao && valorTotal > 0 && (
          <section className="form-secao form-secao-entradas">
            <h2 className="form-secao-titulo">Entradas de valor</h2>
            {mesesDisponiveis.length === 0 ? (
              <p className="form-hint">
                Informe o período do {labelTipo} (data inicial e final) acima para poder selecionar o mês das entradas.
              </p>
            ) : (
              <>
                <p className="form-hint">
                  Registre as entradas referentes a este {labelTipo}. O período da entrada deve ser um mês entre {dataInicio && new Date(dataInicio + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} e {dataFim && new Date(dataFim + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}. A soma das entradas não pode superar o valor total ({formatarMoeda(valorTotal)}).
                </p>
                <div className="entradas-resumo">
                  <span>Total lançado: <strong>{formatarMoeda(totalEntradas)}</strong></span>
                  <span>Saldo disponível: <strong>{formatarMoeda(saldoDisponivel)}</strong></span>
                </div>
                {entradas.length > 0 && (
                  <div className="entradas-lista-wrap">
                    <table className="table entradas-tabela">
                      <thead>
                        <tr>
                          <th>Período</th>
                          <th>Valor (R$)</th>
                          <th className="th-acoes">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entradas.map((e) => (
                          <tr key={e.id}>
                            <td>{e.periodo || '—'}</td>
                            <td>{formatarMoeda(e.valor)}</td>
                            <td className="td-acoes">
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => removerEntrada(e.id)}
                                aria-label="Excluir entrada"
                              >
                                Excluir
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="entradas-nova">
                  <label className="form-group">
                    <span className="form-label">Mês da entrada</span>
                    <select
                      value={novaEntradaPeriodo}
                      onChange={(e) => setNovaEntradaPeriodo(e.target.value)}
                      aria-label="Mês da entrada"
                    >
                      <option value="">— Selecione o mês —</option>
                      {mesesDisponiveis.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-group">
                    <span className="form-label">Valor (R$)</span>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={novaEntradaValor}
                      onChange={(e) => setNovaEntradaValor(e.target.value)}
                      placeholder="0,00"
                      aria-label="Valor da entrada"
                    />
                  </label>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={adicionarEntrada}
                    disabled={saldoDisponivel <= 0 || !novaEntradaPeriodo || (novaEntradaValor === '' || Number(novaEntradaValor) <= 0)}
                  >
                    Adicionar entrada
                  </button>
                </div>
              </>
            )}
          </section>
        )}
        </fieldset>

        {!readOnly && (
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Salvando...' : isEdicao ? 'Salvar alterações' : `Cadastrar ${labelTipo}`}
          </button>
          <Link to={`/${tipo}`} className="btn btn-secondary">Cancelar</Link>
        </div>
        )}
      </form>
    </div>
  );
}
