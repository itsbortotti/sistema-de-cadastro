import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import BtnVoltarHeader from '../../components/BtnVoltarHeader';
import { usuariosApi, perfisApi } from '../../api/client';
import './Usuarios.css';
import '../CadastroFormLayout.css';

export default function UsuarioForm({ somenteLeitura = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);
  const [nome, setNome] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaConfirma, setSenhaConfirma] = useState('');
  const [perfilId, setPerfilId] = useState('');
  const [perfis, setPerfis] = useState([]);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    perfisApi.listar().then(setPerfis).catch(() => setPerfis([]));
  }, []);

  useEffect(() => {
    if (isEdicao) {
      usuariosApi
        .buscar(id)
        .then((u) => {
          setNome(u.nome);
          setLogin(u.login);
          setEmail(u.email || '');
          setPerfilId(u.perfilId || '');
        })
        .catch((e) => setErro(e.message));
    } else if (!isEdicao && perfis.length > 0 && !perfilId) {
      const membro = perfis.find((p) => p.nome === 'Membro');
      setPerfilId(membro ? membro.id : perfis[0].id);
    }
  }, [id, isEdicao, perfis]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (isEdicao && senha && senha !== senhaConfirma) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (!isEdicao && (!senha || senha.length < 4)) {
      setErro('Senha deve ter no mínimo 4 caracteres.');
      return;
    }
    setEnviando(true);
    try {
      if (isEdicao) {
        await usuariosApi.atualizar(id, {
          nome,
          login,
          email,
          perfilId: perfilId || undefined,
          ...(senha ? { senha } : {}),
        });
      } else {
        await usuariosApi.criar({ nome, login, email, senha, perfilId: perfilId || undefined });
      }
      navigate('/usuarios');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const readOnly = somenteLeitura;
  return (
    <div className="cadastro-page form-cadastro-page">
      <div className="page-header">
        <BtnVoltarHeader to="/usuarios" />
        <h1>{readOnly ? 'Ver usuário' : isEdicao ? 'Editar usuário' : ''}</h1>
      </div>
      <form className="form-card form-cadastro" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}

        <section className="form-secao">
          <h2 className="form-secao-titulo">Identificação</h2>
          <label className="form-group">
            <span className="form-label">Nome *</span>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Nome completo" readOnly={readOnly} disabled={readOnly} />
          </label>
          <label className="form-group">
            <span className="form-label">Login *</span>
            <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} required placeholder="Login de acesso" readOnly={readOnly} disabled={readOnly} />
          </label>
          <label className="form-group">
            <span className="form-label">E-mail</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@email.com" readOnly={readOnly} disabled={readOnly} />
          </label>
          <label className="form-group">
            <span className="form-label">Perfil</span>
            <select value={perfilId} onChange={(e) => setPerfilId(e.target.value)} disabled={readOnly}>
              <option value="">Selecione um perfil</option>
              {perfis.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </label>
        </section>

        {!readOnly && (
          <section className="form-secao">
            <h2 className="form-secao-titulo">Senha</h2>
            <label className="form-group">
              <span className="form-label">Senha {isEdicao && '(deixe em branco para não alterar)'}</span>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required={!isEdicao} placeholder={isEdicao ? 'Nova senha (opcional)' : 'Senha'} minLength={4} />
            </label>
            {isEdicao && senha && (
              <label className="form-group">
                <span className="form-label">Confirmar nova senha</span>
                <input type="password" value={senhaConfirma} onChange={(e) => setSenhaConfirma(e.target.value)} placeholder="Repita a senha" />
              </label>
            )}
          </section>
        )}

        {!readOnly && (
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? 'Salvando...' : isEdicao ? 'Salvar' : 'Cadastrar'}
            </button>
            <Link to="/usuarios" className="btn btn-secondary">Cancelar</Link>
          </div>
        )}
      </form>
    </div>
  );
}
