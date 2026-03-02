import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { projetosApi, empresasApi } from '../../api/client';
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
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [status, setStatus] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    empresasApi.listar().then((e) => setEmpresas(Array.isArray(e) ? e : [])).catch(() => {});
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
        <h1>{readOnly ? 'Ver projeto' : isEdicao ? 'Editar projeto' : 'Novo projeto'}</h1>
        <div className="page-header-actions">
          <Link to="/projetos" className="btn btn-secondary">Voltar</Link>
        </div>
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
