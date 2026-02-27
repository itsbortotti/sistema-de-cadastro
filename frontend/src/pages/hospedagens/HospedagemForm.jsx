import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { hospedagensApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroFormLayout.css';

export default function HospedagemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [provedor, setProvedor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isEdicao && id) {
      hospedagensApi
        .buscar(id)
        .then((h) => {
          setNome(h.nome || '');
          setTipo(h.tipo || '');
          setProvedor(h.provedor || '');
          setDescricao(h.descricao || '');
          setObservacoes(h.observacoes || '');
        })
        .catch((e) => setErro(e.message));
    }
  }, [id, isEdicao]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const payload = { nome, tipo, provedor, descricao, observacoes };
      if (isEdicao) await hospedagensApi.atualizar(id, payload);
      else await hospedagensApi.criar(payload);
      navigate('/hospedagens');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="usuarios-page form-cadastro-page">
      <div className="page-header">
        <h1>{isEdicao ? 'Editar hospedagem' : 'Nova hospedagem'}</h1>
        <Link to="/hospedagens" className="btn btn-secondary">Voltar</Link>
      </div>
      <form className="form-card form-cadastro" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}

        <section className="form-secao">
          <h2 className="form-secao-titulo">Identificação</h2>
          <label className="form-group">
            <span className="form-label">Nome *</span>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Ex: Cloud, On Premises, Híbrido" />
          </label>
          <label className="form-group">
            <span className="form-label">Tipo</span>
            <input type="text" value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Ex: Nuvem, On Premises" />
          </label>
          <label className="form-group">
            <span className="form-label">Provedor</span>
            <input type="text" value={provedor} onChange={(e) => setProvedor(e.target.value)} placeholder="Nome do provedor de hospedagem" />
          </label>
          <label className="form-group">
            <span className="form-label">Descrição</span>
            <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Breve descrição" />
          </label>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Observações</h2>
          <label className="form-group">
            <span className="form-label">Observações</span>
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Anotações sobre a hospedagem" rows={3} />
          </label>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Cadastrar hospedagem'}
          </button>
          <Link to="/hospedagens" className="btn btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
