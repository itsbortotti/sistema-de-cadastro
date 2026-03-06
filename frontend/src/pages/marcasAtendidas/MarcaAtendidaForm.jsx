import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import BtnVoltarHeader from '../../components/BtnVoltarHeader';
import { marcasAtendidasApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroFormLayout.css';

export default function MarcaAtendidaForm({ somenteLeitura = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);
  const readOnly = somenteLeitura;

  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isEdicao && id) {
      marcasAtendidasApi
        .buscar(id)
        .then((item) => setNome(item.nome || ''))
        .catch((e) => setErro(e.message));
    }
  }, [id, isEdicao]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      if (isEdicao) await marcasAtendidasApi.atualizar(id, { nome: nome.trim() });
      else await marcasAtendidasApi.criar({ nome: nome.trim() });
      navigate('/marcas-atendidas');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="cadastro-page form-cadastro-page">
      <div className="page-header">
        <BtnVoltarHeader to="/marcas-atendidas" />
        <h1>{readOnly ? 'Ver marca atendida' : isEdicao ? 'Editar marca atendida' : ''}</h1>
      </div>
      <form className="form-card form-cadastro" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}
        <section className="form-secao">
          <h2 className="form-secao-titulo">Identificação</h2>
          <label className="form-group">
            <span className="form-label">Nome *</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Nome da marca atendida"
              readOnly={readOnly}
              disabled={readOnly}
            />
          </label>
        </section>
        {!readOnly && (
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Cadastrar'}
            </button>
            <Link to="/marcas-atendidas" className="btn btn-secondary">Cancelar</Link>
          </div>
        )}
      </form>
    </div>
  );
}
