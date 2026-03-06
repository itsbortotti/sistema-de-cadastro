import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import BtnVoltarHeader from '../../components/BtnVoltarHeader';
import { pessoasApi, areasApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroFormLayout.css';

function ModalNovo({ titulo, labelCampo = 'Nome', aberto, onFechar, onSalvar, salvando }) {
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
    <div className="modal-overlay" onClick={onFechar} role="dialog" aria-modal="true" aria-labelledby="modal-pessoa-titulo">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 id="modal-pessoa-titulo" className="modal-titulo">{titulo}</h2>
        <form onSubmit={handleSubmit}>
          <label className="form-group">
            <span className="form-label">{labelCampo}</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={`Digite o ${labelCampo.toLowerCase()}...`}
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

function SelectComNovo({ label, value, onChange, opcoes, onAbrirNovo, placeholder = '— Selecione —' }) {
  return (
    <label className="form-group">
      <span className="form-label">{label}</span>
      <div className="select-com-novo">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{placeholder}</option>
          {opcoes.map((o) => (
            <option key={o.id} value={o.id}>{o.nome}</option>
          ))}
        </select>
        <button type="button" className="btn btn-novo-item" onClick={onAbrirNovo} title={`Cadastrar nova ${label}`}>
          + Novo
        </button>
      </div>
    </label>
  );
}

export default function PessoaForm({ somenteLeitura = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);
  const readOnly = somenteLeitura;

  const [areas, setAreas] = useState([]);
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [areaId, setAreaId] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [popupTipo, setPopupTipo] = useState(null);
  const [popupSalvando, setPopupSalvando] = useState(false);

  const carregarAreas = () => {
    areasApi.listar().then(setAreas).catch((e) => setErro(e.message));
  };
  useEffect(() => carregarAreas(), []);

  useEffect(() => {
    if (isEdicao && id) {
      pessoasApi
        .buscar(id)
        .then((item) => {
          setNome(item.nome || '');
          setDataNascimento(item.dataNascimento || '');
          setAreaId(item.areaId || '');
        })
        .catch((e) => setErro(e.message));
    }
  }, [id, isEdicao]);

  const handleSalvarPopup = async (nomeVal) => {
    setPopupSalvando(true);
    try {
      if (popupTipo === 'area') {
        const novo = await areasApi.criar({ nome: nomeVal.trim() });
        setAreas((prev) => [...prev, novo]);
        setAreaId(novo.id);
      }
    } catch (e) {
      setErro(e.message);
    } finally {
      setPopupSalvando(false);
      setPopupTipo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const payload = {
        nome: nome.trim(),
        dataNascimento: dataNascimento.trim() || '',
        areaId: areaId || null,
      };
      if (isEdicao) await pessoasApi.atualizar(id, payload);
      else await pessoasApi.criar(payload);
      navigate('/pessoas');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="cadastro-page form-cadastro-page">
      <div className="page-header">
        <BtnVoltarHeader to="/pessoas" />
        <h1>{readOnly ? 'Ver pessoa' : isEdicao ? 'Editar pessoa' : ''}</h1>
      </div>
      <form className="form-card form-cadastro" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}
        <fieldset disabled={readOnly} style={{ border: 'none', margin: 0, padding: 0 }}>
          <section className="form-secao">
            <h2 className="form-secao-titulo">Identificação</h2>
            <label className="form-group">
              <span className="form-label">Nome *</span>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Nome completo"
                readOnly={readOnly}
                disabled={readOnly}
              />
            </label>
            <label className="form-group">
              <span className="form-label">Data de nascimento</span>
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                readOnly={readOnly}
                disabled={readOnly}
              />
            </label>
            <SelectComNovo
              label="Área"
              value={areaId}
              onChange={setAreaId}
              opcoes={areas}
              onAbrirNovo={() => setPopupTipo('area')}
              placeholder="— Selecione a área —"
            />
          </section>
        </fieldset>
        {!readOnly && (
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Cadastrar'}
            </button>
            <Link to="/pessoas" className="btn btn-secondary">Cancelar</Link>
          </div>
        )}
      </form>

      <ModalNovo
        titulo="Nova Área"
        labelCampo="Nome"
        aberto={popupTipo === 'area'}
        onFechar={() => setPopupTipo(null)}
        onSalvar={handleSalvarPopup}
        salvando={popupSalvando}
      />
    </div>
  );
}
