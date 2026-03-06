import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import BtnVoltarHeader from '../../components/BtnVoltarHeader';
import { formasAcessoApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroFormLayout.css';

export default function FormaAcessoForm({ somenteLeitura = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);
  const readOnly = somenteLeitura;

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isEdicao && id) {
      formasAcessoApi
        .buscar(id)
        .then((f) => {
          setNome(f.nome || '');
          setDescricao(f.descricao || '');
          setTipo(f.tipo || '');
          setObservacoes(f.observacoes || '');
        })
        .catch((e) => setErro(e.message));
    }
  }, [id, isEdicao]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const payload = { nome, descricao, tipo, observacoes };
      if (isEdicao) await formasAcessoApi.atualizar(id, payload);
      else await formasAcessoApi.criar(payload);
      navigate('/formas-acesso');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="cadastro-page form-cadastro-page">
      <div className="page-header">
        <BtnVoltarHeader to="/formas-acesso" />
        <h1>{readOnly ? 'Ver forma de acesso' : isEdicao ? 'Editar forma de acesso' : ''}</h1>
      </div>
      <form className="form-card form-cadastro" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}
        <fieldset disabled={readOnly} style={{ border: 'none', margin: 0, padding: 0 }}>
        <section className="form-secao">
          <h2 className="form-secao-titulo">Identificação</h2>
          <label className="form-group">
            <span className="form-label">Nome *</span>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Ex: Web, Desktop, Mobile, API" />
          </label>
          <label className="form-group">
            <span className="form-label">Tipo</span>
            <input type="text" value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Ex: Web, Desktop, Mobile" />
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
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Anotações sobre a forma de acesso" rows={3} />
          </label>
        </section>
        </fieldset>

        {!readOnly && (
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Cadastrar forma de acesso'}
          </button>
          <Link to="/formas-acesso" className="btn btn-secondary">Cancelar</Link>
        </div>
        )}
      </form>
    </div>
  );
}
