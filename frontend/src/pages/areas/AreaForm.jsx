import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import BtnVoltarHeader from '../../components/BtnVoltarHeader';
import { areasApi, pessoasApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroFormLayout.css';

function ModalNovaPessoa({ aberto, onFechar, onSalvar, salvando }) {
  const [nome, setNome] = useState('');
  useEffect(() => {
    if (aberto) setNome('');
  }, [aberto]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const n = nome.trim();
    if (!n) return;
    await onSalvar(n);
    onFechar();
  };

  if (!aberto) return null;
  return (
    <div className="modal-overlay" onClick={onFechar} role="dialog" aria-modal="true" aria-labelledby="modal-area-pessoa-titulo">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 id="modal-area-pessoa-titulo" className="modal-titulo">Nova pessoa</h2>
        <form onSubmit={handleSubmit}>
          <label className="form-group">
            <span className="form-label">Nome *</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome completo"
              autoFocus
            />
          </label>
          <div className="modal-acoes">
            <button type="button" className="btn btn-secondary" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={salvando || !nome.trim()}>
              {salvando ? 'Salvando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SelectComNovo({ label, value, onChange, opcoes, onAbrirNovo, placeholder = '— Selecione —', readOnly }) {
  return (
    <label className="form-group">
      <span className="form-label">{label}</span>
      <div className="select-com-novo">
        <select value={value} onChange={(e) => onChange(e.target.value)} disabled={readOnly} readOnly={readOnly}>
          <option value="">{placeholder}</option>
          {opcoes.map((o) => (
            <option key={o.id} value={o.id}>{o.nome}</option>
          ))}
        </select>
        {!readOnly && (
          <button type="button" className="btn btn-novo-item" onClick={onAbrirNovo} title="Cadastrar nova pessoa">
            + Novo
          </button>
        )}
      </div>
    </label>
  );
}

export default function AreaForm({ somenteLeitura = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);
  const readOnly = somenteLeitura;

  const [pessoas, setPessoas] = useState([]);
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [responsavelId, setResponsavelId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [popupAberto, setPopupAberto] = useState(false);
  const [popupSalvando, setPopupSalvando] = useState(false);

  useEffect(() => {
    pessoasApi.listar().then(setPessoas).catch((e) => setErro(e.message));
  }, []);

  useEffect(() => {
    if (isEdicao && id) {
      areasApi
        .buscar(id)
        .then((a) => {
          setNome(a.nome || '');
          setCodigo(a.codigo || '');
          setDescricao(a.descricao || '');
          setResponsavelId(a.responsavelId || '');
          setObservacoes(a.observacoes || '');
        })
        .catch((e) => setErro(e.message));
    }
  }, [id, isEdicao]);

  const handleSalvarNovaPessoa = async (nomeVal) => {
    setPopupSalvando(true);
    setErro('');
    try {
      const nova = await pessoasApi.criar({ nome: nomeVal.trim() });
      setPessoas((prev) => [...prev, nova]);
      setResponsavelId(nova.id);
    } catch (e) {
      setErro(e?.message || 'Erro ao cadastrar pessoa');
    } finally {
      setPopupSalvando(false);
      setPopupAberto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const payload = { nome, codigo, descricao, responsavelId: responsavelId || null, observacoes };
      if (isEdicao) await areasApi.atualizar(id, payload);
      else await areasApi.criar(payload);
      navigate('/areas');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="cadastro-page form-cadastro-page">
      <div className="page-header">
        <BtnVoltarHeader to="/areas" />
        <h1>{readOnly ? 'Ver área' : isEdicao ? 'Editar área' : ''}</h1>
      </div>
      <form className="form-card form-cadastro" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}

        <section className="form-secao">
          <h2 className="form-secao-titulo">Identificação</h2>
          <label className="form-group">
            <span className="form-label">Nome *</span>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Nome da área" readOnly={readOnly} disabled={readOnly} />
          </label>
          <label className="form-group">
            <span className="form-label">Código</span>
            <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código/sigla da área" readOnly={readOnly} disabled={readOnly} />
          </label>
          <label className="form-group">
            <span className="form-label">Descrição</span>
            <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Breve descrição" readOnly={readOnly} disabled={readOnly} />
          </label>
          <SelectComNovo
            label="Responsável"
            value={responsavelId}
            onChange={setResponsavelId}
            opcoes={pessoas}
            onAbrirNovo={() => setPopupAberto(true)}
            placeholder="— Selecione uma pessoa —"
            readOnly={readOnly}
          />
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Observações</h2>
          <label className="form-group">
            <span className="form-label">Observações</span>
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Anotações sobre a área" rows={3} readOnly={readOnly} disabled={readOnly} />
          </label>
        </section>

        {!readOnly && (
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Cadastrar área'}
            </button>
            <Link to="/areas" className="btn btn-secondary">Cancelar</Link>
          </div>
        )}
      </form>

      <ModalNovaPessoa
        aberto={popupAberto}
        onFechar={() => setPopupAberto(false)}
        onSalvar={handleSalvarNovaPessoa}
        salvando={popupSalvando}
      />
    </div>
  );
}
