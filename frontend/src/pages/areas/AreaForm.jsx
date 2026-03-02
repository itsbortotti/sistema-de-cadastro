import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { areasApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroFormLayout.css';

export default function AreaForm({ somenteLeitura = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);
  const readOnly = somenteLeitura;

  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isEdicao && id) {
      areasApi
        .buscar(id)
        .then((a) => {
          setNome(a.nome || '');
          setCodigo(a.codigo || '');
          setDescricao(a.descricao || '');
          setResponsavel(a.responsavel || '');
          setObservacoes(a.observacoes || '');
        })
        .catch((e) => setErro(e.message));
    }
  }, [id, isEdicao]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const payload = { nome, codigo, descricao, responsavel, observacoes };
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
        <h1>{readOnly ? 'Ver área' : isEdicao ? 'Editar área' : 'Nova área'}</h1>
        <div className="page-header-actions">
          <Link to="/areas" className="btn btn-secondary">Voltar</Link>
        </div>
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
          <label className="form-group">
            <span className="form-label">Responsável</span>
            <input type="text" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Nome do responsável" readOnly={readOnly} disabled={readOnly} />
          </label>
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
    </div>
  );
}
