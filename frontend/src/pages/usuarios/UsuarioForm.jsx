import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { usuariosApi } from '../../api/client';
import './Usuarios.css';
import '../CadastroFormLayout.css';

export default function UsuarioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);
  const [nome, setNome] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaConfirma, setSenhaConfirma] = useState('');
  const [tipo, setTipo] = useState('membro');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isEdicao) {
      usuariosApi
        .buscar(id)
        .then((u) => {
          setNome(u.nome);
          setLogin(u.login);
          setEmail(u.email || '');
          setTipo(u.tipo || 'membro');
        })
        .catch((e) => setErro(e.message));
    }
  }, [id, isEdicao]);

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
          tipo,
          ...(senha ? { senha } : {}),
        });
      } else {
        await usuariosApi.criar({ nome, login, email, senha, tipo });
      }
      navigate('/usuarios');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="usuarios-page form-cadastro-page">
      <div className="page-header">
        <h1>{isEdicao ? 'Editar usuário' : 'Novo usuário'}</h1>
        <Link to="/usuarios" className="btn btn-secondary">
          Voltar
        </Link>
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
              placeholder="Nome completo"
            />
          </label>
          <label className="form-group">
            <span className="form-label">Login *</span>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              placeholder="Login de acesso"
            />
          </label>
          <label className="form-group">
            <span className="form-label">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
            />
          </label>
          <label className="form-group">
            <span className="form-label">Tipo</span>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="admin">Administrador</option>
              <option value="membro">Membro</option>
              <option value="visualizacao">Apenas visualização</option>
            </select>
          </label>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Senha</h2>
          <label className="form-group">
            <span className="form-label">Senha {isEdicao && '(deixe em branco para não alterar)'}</span>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required={!isEdicao}
              placeholder={isEdicao ? 'Nova senha (opcional)' : 'Senha'}
              minLength={4}
            />
          </label>
          {isEdicao && senha && (
            <label className="form-group">
              <span className="form-label">Confirmar nova senha</span>
              <input
                type="password"
                value={senhaConfirma}
                onChange={(e) => setSenhaConfirma(e.target.value)}
                placeholder="Repita a senha"
              />
            </label>
          )}
        </section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Salvando...' : isEdicao ? 'Salvar' : 'Cadastrar'}
          </button>
          <Link to="/usuarios" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
