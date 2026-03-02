import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { capexApi, areasApi, fornecedoresApi, produtosSoftwareApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroFormLayout.css';

export default function CapexForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);

  const [areas, setAreas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [areaId, setAreaId] = useState('');
  const [classificacao, setClassificacao] = useState('capex');
  const [modelo, setModelo] = useState('sistema');
  const [fornecedorId, setFornecedorId] = useState('');
  const [valor, setValor] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [produtoSoftwareIds, setProdutoSoftwareIds] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [buscaProdutos, setBuscaProdutos] = useState('');

  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const mapaAreaNome = areas.reduce((acc, a) => ({ ...acc, [a.id]: a.nome || '' }), {});
  const produtosFiltrados = buscaProdutos.trim()
    ? produtos.filter((p) => (p.nomeSistema || '').toLowerCase().includes(buscaProdutos.trim().toLowerCase()))
    : produtos;
  const selecionarTodosFiltrados = () => {
    const ids = produtosFiltrados.map((p) => p.id);
    setProdutoSoftwareIds((prev) => [...new Set([...prev, ...ids])]);
  };
  const limparSelecao = () => setProdutoSoftwareIds([]);
  const removerProduto = (prodId) => setProdutoSoftwareIds((prev) => prev.filter((x) => x !== prodId));
  const produtosSelecionados = produtos.filter((p) => produtoSoftwareIds.includes(p.id));

  useEffect(() => {
    Promise.all([areasApi.listar(), fornecedoresApi.listar(), produtosSoftwareApi.listar()])
      .then(([areasList, fornList, prodList]) => {
        setAreas(Array.isArray(areasList) ? areasList : []);
        setFornecedores(Array.isArray(fornList) ? fornList : []);
        setProdutos(Array.isArray(prodList) ? prodList : []);
      })
      .catch((e) => setErro(e.message));
  }, []);

  useEffect(() => {
    if (isEdicao && id) {
      capexApi
        .buscar(id)
        .then((c) => {
          setAreaId(c.areaId ?? '');
          setClassificacao(c.classificacao ?? 'capex');
          setModelo(c.modelo ?? c.tipo ?? 'sistema');
          setFornecedorId(c.fornecedorId ?? '');
          setValor(c.valor != null ? String(c.valor) : '');
          setDataInicio(c.dataInicio ?? (c.ano ? `${c.ano}-01-01` : ''));
          setDataFim(c.dataFim ?? (c.ano ? `${c.ano}-12-31` : ''));
          setProdutoSoftwareIds(Array.isArray(c.produtoSoftwareIds) ? c.produtoSoftwareIds : []);
          setObservacoes(c.observacoes ?? '');
        })
        .catch((e) => setErro(e.message));
    }
  }, [id, isEdicao]);

  const handleToggleProduto = (prodId) => {
    setProdutoSoftwareIds((prev) =>
      prev.includes(prodId) ? prev.filter((x) => x !== prodId) : [...prev, prodId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (!areaId || !areaId.trim()) {
      setErro('Área é obrigatória.');
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
    setEnviando(true);
    try {
      const payload = {
        areaId: areaId.trim(),
        classificacao,
        modelo,
        fornecedorId: fornecedorId.trim() || null,
        valor: valorNum,
        dataInicio: ini,
        dataFim: fim,
        produtoSoftwareIds: produtoSoftwareIds,
        observacoes: observacoes.trim(),
      };
      if (isEdicao) await capexApi.atualizar(id, payload);
      else await capexApi.criar(payload);
      navigate('/capex');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="usuarios-page form-cadastro-page">
      <div className="page-header">
        <h1>{isEdicao ? 'Editar Capex / Opex' : 'Novo Capex / Opex'}</h1>
        <Link to="/capex" className="btn btn-secondary">Voltar</Link>
      </div>
      <form className="form-card form-cadastro" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}

        <section className="form-secao">
          <h2 className="form-secao-titulo">Dados do Capex / Opex</h2>
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
            <span className="form-label">Tipo</span>
            <select value={classificacao} onChange={(e) => setClassificacao(e.target.value)}>
              <option value="capex">Capex</option>
              <option value="opex">Opex</option>
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Modelo</span>
            <select value={modelo} onChange={(e) => setModelo(e.target.value)}>
              <option value="sistema">Sistema</option>
              <option value="infraestrutura">Infraestrutura</option>
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
          <p className="form-hint">Informe o intervalo de vigência do Capex/Opex (opcional).</p>
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

        <section className="form-secao form-secao-produtos">
          <h2 className="form-secao-titulo">Projetos associados</h2>
              <p className="form-hint">Nenhum projeto cadastrado.</p>

          {produtosSelecionados.length > 0 && (
            <div className="produtos-selecionados-resumo">
              <span className="produtos-selecionados-label">
                {produtosSelecionados.length} projeto(s) selecionado(s):
              </span>
              <div className="produtos-chips">
                {produtosSelecionados.map((p) => (
                  <span key={p.id} className="produto-chip">
                    {p.nomeSistema || p.id}
                    <button
                      type="button"
                      className="produto-chip-remove"
                      onClick={() => removerProduto(p.id)}
                      title="Remover"
                      aria-label={`Remover ${p.nomeSistema || p.id}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="produtos-toolbar">
            <input
              type="search"
              className="produtos-busca"
              placeholder="Buscar por nome do projeto..."
              value={buscaProdutos}
              onChange={(e) => setBuscaProdutos(e.target.value)}
              aria-label="Buscar projetos"
            />
            <div className="produtos-acoes">
              <button type="button" className="btn btn-sm btn-outline" onClick={selecionarTodosFiltrados}>
                Selecionar todos ({produtosFiltrados.length})
              </button>
              <button type="button" className="btn btn-sm btn-outline" onClick={limparSelecao}>
                Limpar seleção
              </button>
            </div>
          </div>

          <div className="produtos-grid" role="list">
            {produtos.length === 0 ? (
              <p className="form-hint">Nenhum projeto cadastrado.</p>
            ) : produtosFiltrados.length === 0 ? (
              <p className="form-hint">Nenhum projeto encontrado para &quot;{buscaProdutos}&quot;.</p>
            ) : (
              produtosFiltrados.map((p) => {
                const selected = produtoSoftwareIds.includes(p.id);
                const areaNome = mapaAreaNome[p.areaId] || (p.areaNome ?? '');
                return (
                  <label
                    key={p.id}
                    className={`produto-card ${selected ? 'produto-card--selected' : ''}`}
                    role="listitem"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleToggleProduto(p.id)}
                      className="produto-card-check"
                    />
                    <div className="produto-card-body">
                      <span className="produto-card-nome">{p.nomeSistema || p.id}</span>
                      {areaNome && <span className="produto-card-meta">{areaNome}</span>}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Observações</h2>
          <label className="form-group">
            <span className="form-label">Observações (OBS)</span>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Anotações sobre o Capex"
              rows={4}
            />
          </label>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Cadastrar Capex / Opex'}
          </button>
          <Link to="/capex" className="btn btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
