import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fornecedoresApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import './FornecedorForm.css';

export default function FornecedorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);

  const [nome, setNome] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [celular, setCelular] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [site, setSite] = useState('');
  const [contato, setContato] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isEdicao && id) {
      fornecedoresApi
        .buscar(id)
        .then((f) => {
          setNome(f.nome || '');
          setRazaoSocial(f.razaoSocial || '');
          setNomeFantasia(f.nomeFantasia || '');
          setCnpj(f.cnpj || '');
          setCpf(f.cpf || '');
          setEmail(f.email || '');
          setTelefone(f.telefone || '');
          setCelular(f.celular || '');
          setEndereco(f.endereco || '');
          setNumero(f.numero || '');
          setComplemento(f.complemento || '');
          setBairro(f.bairro || '');
          setCidade(f.cidade || '');
          setEstado(f.estado || '');
          setCep(f.cep || '');
          setSite(f.site || '');
          setContato(f.contato || '');
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
      const payload = {
        nome,
        razaoSocial,
        nomeFantasia,
        cnpj,
        cpf,
        email,
        telefone,
        celular,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        site,
        contato,
        observacoes,
      };
      if (isEdicao) await fornecedoresApi.atualizar(id, payload);
      else await fornecedoresApi.criar(payload);
      navigate('/fornecedores');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="usuarios-page fornecedor-form-page">
      <div className="page-header">
        <h1>{isEdicao ? 'Editar fornecedor' : 'Novo fornecedor'}</h1>
        <Link to="/fornecedores" className="btn btn-secondary">Voltar</Link>
      </div>
      <form className="form-card form-fornecedor" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}

        <section className="form-secao">
          <h2 className="form-secao-titulo">Identificação</h2>
          <label className="form-group">
            <span className="form-label">Nome *</span>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Nome do fornecedor (ex.: nome fantasia)" />
          </label>
          <label className="form-group">
            <span className="form-label">Razão Social</span>
            <input type="text" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder="Razão social (CNPJ)" />
          </label>
          <label className="form-group">
            <span className="form-label">Nome Fantasia</span>
            <input type="text" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} placeholder="Nome fantasia" />
          </label>
          <label className="form-group">
            <span className="form-label">CNPJ</span>
            <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
          </label>
          <label className="form-group">
            <span className="form-label">CPF (pessoa física)</span>
            <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
          </label>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Contato</h2>
          <label className="form-group">
            <span className="form-label">E-mail</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
          </label>
          <label className="form-group">
            <span className="form-label">Telefone</span>
            <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 0000-0000" />
          </label>
          <label className="form-group">
            <span className="form-label">Celular</span>
            <input type="text" value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="(00) 00000-0000" />
          </label>
          <label className="form-group">
            <span className="form-label">Nome do contato</span>
            <input type="text" value={contato} onChange={(e) => setContato(e.target.value)} placeholder="Pessoa de contato" />
          </label>
          <label className="form-group">
            <span className="form-label">Site</span>
            <input type="url" value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://..." />
          </label>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Endereço</h2>
          <label className="form-group">
            <span className="form-label">CEP</span>
            <input type="text" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" />
          </label>
          <label className="form-group">
            <span className="form-label">Logradouro</span>
            <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, avenida..." />
          </label>
          <label className="form-group form-group-inline">
            <span className="form-label">Número</span>
            <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Nº" />
          </label>
          <label className="form-group">
            <span className="form-label">Complemento</span>
            <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Sala, andar..." />
          </label>
          <label className="form-group">
            <span className="form-label">Bairro</span>
            <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro" />
          </label>
          <label className="form-group form-group-inline">
            <span className="form-label">Cidade</span>
            <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" />
          </label>
          <label className="form-group form-group-inline form-group-uf">
            <span className="form-label">UF</span>
            <input type="text" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="UF" maxLength={2} />
          </label>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Observações</h2>
          <label className="form-group">
            <span className="form-label">Observações</span>
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Anotações sobre o fornecedor" rows={3} />
          </label>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Salvando...' : isEdicao ? 'Salvar' : 'Cadastrar'}
          </button>
          <Link to="/fornecedores" className="btn btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
