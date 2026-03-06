import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import BtnVoltarHeader from '../../components/BtnVoltarHeader';
import { timesApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroFormLayout.css';

export default function TimeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [lider, setLider] = useState('');
  const [email, setEmail] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isEdicao && id) {
      timesApi
        .buscar(id)
        .then((t) => {
          setNome(t.nome || '');
          setDescricao(t.descricao || '');
          setLider(t.lider || '');
          setEmail(t.email || '');
          setObservacoes(t.observacoes || '');
        })
        .catch((e) => setErro(e.message));
    }
  }, [id, isEdicao]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const payload = { nome, descricao, lider, email, observacoes };
      if (isEdicao) await timesApi.atualizar(id, payload);
      else await timesApi.criar(payload);
      navigate('/times');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="cadastro-page form-cadastro-page">
      <div className="page-header">
        <BtnVoltarHeader to="/times" />
        <h1>{isEdicao ? 'Editar time' : ''}</h1>
      </div>
      <form className="form-card form-cadastro" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}

        <section className="form-secao">
          <h2 className="form-secao-titulo">Identificação</h2>
          <label className="form-group">
            <span className="form-label">Nome *</span>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Nome do time" />
          </label>
          <label className="form-group">
            <span className="form-label">Descrição</span>
            <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Breve descrição do time" />
          </label>
          <label className="form-group">
            <span className="form-label">Líder</span>
            <input type="text" value={lider} onChange={(e) => setLider(e.target.value)} placeholder="Nome do líder do time" />
          </label>
          <label className="form-group">
            <span className="form-label">E-mail</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
          </label>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Observações</h2>
          <label className="form-group">
            <span className="form-label">Observações</span>
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Anotações sobre o time" rows={3} />
          </label>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Cadastrar time'}
          </button>
          <Link to="/times" className="btn btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
