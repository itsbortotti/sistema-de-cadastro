import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import BtnVoltarHeader from '../../components/BtnVoltarHeader';
import { projetosApi, empresasApi, produtosSoftwareApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroFormLayout.css';

const STATUS_OPCOES = [
  { value: '', label: '— Selecione —' },
  { value: 'Planejado', label: 'Planejado' },
  { value: 'Em andamento', label: 'Em andamento' },
  { value: 'Concluído', label: 'Concluído' },
  { value: 'Cancelado', label: 'Cancelado' },
];

export default function ProjetoForm({ somenteLeitura = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);
  const readOnly = somenteLeitura;

  const [empresas, setEmpresas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [status, setStatus] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [produtoSoftwareIds, setProdutoSoftwareIds] = useState([]);
  const [buscaSistemas, setBuscaSistemas] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const busca = buscaSistemas.trim().toLowerCase();
  const sistemasFiltrados = busca ? produtos.filter((p) => (p.nomeSistema || '').toLowerCase().includes(busca)) : produtos;
  const sistemasSelecionados = produtos.filter((p) => produtoSoftwareIds.includes(p.id));

  useEffect(() => {
    Promise.all([empresasApi.listar(), produtosSoftwareApi.listar()])
      .then(([e, p]) => {
        setEmpresas(Array.isArray(e) ? e : []);
        setProdutos(Array.isArray(p) ? p : []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isEdicao && id) {
      projetosApi
        .buscar(id)
        .then((p) => {
          setNome(p.nome || '');
          setDescricao(p.descricao || '');
          setEmpresaId(p.empresaId ?? '');
          setDataInicio(p.dataInicio ?? '');
          setDataFim(p.dataFim ?? '');
          setStatus(p.status ?? '');
          setObservacoes(p.observacoes ?? '');
          setProdutoSoftwareIds(Array.isArray(p.produtoSoftwareIds) ? p.produtoSoftwareIds : []);
        })
        .catch((e) => setErro(e.message));
    }
  }, [id, isEdicao]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (!nome.trim()) {
      setErro('Nome do projeto é obrigatório.');
      return;
    }
    const ini = dataInicio.trim() || null;
    const fim = dataFim.trim() || null;
    if (ini && fim && fim < ini) {
      setErro('A data final deve ser igual ou posterior à data inicial.');
      return;
    }
    if (produtoSoftwareIds.length === 0) {
      setErro('O projeto deve estar associado a pelo menos um sistema.');
      return;
    }
    setEnviando(true);
    try {
      const payload = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        empresaId: empresaId.trim() || null,
        dataInicio: ini,
        dataFim: fim,
        status: status.trim() || null,
        observacoes: observacoes.trim(),
        produtoSoftwareIds,
      };
      if (isEdicao) await projetosApi.atualizar(id, payload);
      else await projetosApi.criar(payload);
      navigate('/projetos');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="cadastro-page form-cadastro-page">
      <div className="page-header">
        <BtnVoltarHeader to="/projetos" />
        <h1>{readOnly ? 'Ver projeto' : isEdicao ? 'Editar projeto' : ''}</h1>
      </div>
      <form className="form-card form-cadastro" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}
        <fieldset disabled={readOnly} style={{ border: 'none', margin: 0, padding: 0 }}>
        <section className="form-secao">
          <h2 className="form-secao-titulo">Identificação</h2>
          <label className="form-group">
            <span className="form-label">Nome do projeto *</span>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Nome do projeto" />
          </label>
          <label className="form-group">
            <span className="form-label">Empresa</span>
            <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}>
              <option value="">— Selecione a empresa —</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.nomeFantasia || emp.razaoSocial || emp.id}</option>
              ))}
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Descrição</span>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição do projeto" rows={3} />
          </label>
          <label className="form-group">
            <span className="form-label">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPCOES.map((o) => (
                <option key={o.value || 'vazio'} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="form-secao form-secao-produtos">
          <h2 className="form-secao-titulo">Sistemas associados *</h2>
          <p className="form-hint">O projeto deve estar vinculado a pelo menos um sistema.</p>
          {sistemasSelecionados.length > 0 && (
            <div className="produtos-selecionados-resumo">
              <span className="produtos-selecionados-label">
                {sistemasSelecionados.length} sistema(s) selecionado(s):
              </span>
              <div className="produtos-chips">
                {sistemasSelecionados.map((p) => (
                  <span key={p.id} className="produto-chip">
                    {p.nomeSistema || p.id}
                    {!readOnly && (
                      <button type="button" className="produto-chip-remove" onClick={() => setProdutoSoftwareIds((prev) => prev.filter((x) => x !== p.id))} title="Remover" aria-label={`Remover ${p.nomeSistema || p.id}`}>×</button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
          {!readOnly && (
            <>
              <div className="produtos-toolbar">
                <input type="search" className="produtos-busca" placeholder="Buscar por nome do sistema..." value={buscaSistemas} onChange={(e) => setBuscaSistemas(e.target.value)} aria-label="Buscar sistemas" />
                <div className="produtos-acoes">
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => setProdutoSoftwareIds((prev) => [...new Set([...prev, ...sistemasFiltrados.map((s) => s.id)])])}>Selecionar todos ({sistemasFiltrados.length})</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => setProdutoSoftwareIds([])}>Limpar seleção</button>
                </div>
              </div>
              <div className="produtos-grid" role="list">
                {produtos.length === 0 ? <p className="form-hint">Nenhum sistema cadastrado. Cadastre sistemas antes de criar o projeto.</p> : sistemasFiltrados.length === 0 ? <p className="form-hint">Nenhum sistema encontrado para &quot;{buscaSistemas}&quot;.</p> : sistemasFiltrados.map((p) => (
                  <label key={p.id} className={`produto-card ${produtoSoftwareIds.includes(p.id) ? 'produto-card--selected' : ''}`} role="listitem">
                    <input type="checkbox" checked={produtoSoftwareIds.includes(p.id)} onChange={() => setProdutoSoftwareIds((prev) => prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id])} className="produto-card-check" />
                    <div className="produto-card-body">
                      <span className="produto-card-nome">{p.nomeSistema || p.id}</span>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="form-secao form-secao-periodo">
          <h2 className="form-secao-titulo">Período</h2>
          <div className="form-row-datas">
            <label className="form-group form-group-inline">
              <span className="form-label">Data inicial</span>
              <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} max={dataFim || undefined} />
            </label>
            <label className="form-group form-group-inline">
              <span className="form-label">Data final</span>
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} min={dataInicio || undefined} />
            </label>
          </div>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Observações</h2>
          <label className="form-group">
            <span className="form-label">Observações</span>
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Anotações sobre o projeto" rows={3} />
          </label>
        </section>
        </fieldset>

        {!readOnly && (
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Cadastrar projeto'}
          </button>
          <Link to="/projetos" className="btn btn-secondary">Cancelar</Link>
        </div>
        )}
      </form>
    </div>
  );
}
