import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import BtnVoltarHeader from '../../components/BtnVoltarHeader';
import { fornecedoresApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroFormLayout.css';
import './FornecedorForm.css';

export default function FornecedorForm({ somenteLeitura = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);
  const readOnly = somenteLeitura;

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
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState('');

  const VIA_CEP_URL = 'https://viacep.com.br/ws';

  const buscarEnderecoPorCep = async () => {
    const apenasDigitos = (cep || '').replace(/\D/g, '');
    if (apenasDigitos.length !== 8) {
      setErroCep(apenasDigitos.length > 0 ? 'CEP deve ter 8 dígitos.' : '');
      return;
    }
    setErroCep('');
    setBuscandoCep(true);
    try {
      const res = await fetch(`${VIA_CEP_URL}/${apenasDigitos}/json/`);
      const data = await res.json();
      if (data.erro) {
        setErroCep('CEP não encontrado.');
        return;
      }
      setEndereco(data.logradouro || '');
      setBairro(data.bairro || '');
      setCidade(data.localidade || '');
      setEstado((data.uf || '').toUpperCase().slice(0, 2));
      if (data.cep) setCep(data.cep);
    } catch (_e) {
      setErroCep('Não foi possível buscar o CEP. Verifique a conexão.');
    } finally {
      setBuscandoCep(false);
    }
  };

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
    <div className="cadastro-page form-cadastro-page fornecedores-form-page">
      <div className="page-header">
        <BtnVoltarHeader to="/fornecedores" />
        <h1>{readOnly ? 'Ver fornecedor' : isEdicao ? 'Editar fornecedor' : ''}</h1>
      </div>
      <form className="form-card form-cadastro" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}
        <fieldset disabled={readOnly} style={{ border: 'none', margin: 0, padding: 0 }}>
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

        <section className="form-secao form-secao-endereco">
          <h2 className="form-secao-titulo">Endereço</h2>
          <div className="form-group form-group-cep">
            <span className="form-label">CEP</span>
            <div className="cep-busca-wrap">
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                onBlur={() => !readOnly && (cep || '').replace(/\D/g, '').length === 8 && buscarEnderecoPorCep()}
                placeholder="00000-000"
                maxLength={9}
                disabled={readOnly}
                aria-describedby={erroCep ? 'erro-cep-fornecedor' : undefined}
              />
              {!readOnly && (
                <button
                  type="button"
                  className="btn btn-buscar-cep"
                  onClick={buscarEnderecoPorCep}
                  disabled={buscandoCep || (cep || '').replace(/\D/g, '').length !== 8}
                  title="Buscar endereço pelo CEP"
                >
                  {buscandoCep ? 'Buscando...' : 'Buscar'}
                </button>
              )}
            </div>
            {erroCep && <p id="erro-cep-fornecedor" className="form-hint form-hint-erro">{erroCep}</p>}
          </div>
          <label className="form-group form-group-logradouro">
            <span className="form-label">Logradouro</span>
            <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, avenida..." />
          </label>
          <label className="form-group form-group-numero">
            <span className="form-label">Número</span>
            <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Nº" />
          </label>
          <label className="form-group form-group-complemento">
            <span className="form-label">Complemento</span>
            <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Sala, andar..." />
          </label>
          <label className="form-group form-group-bairro">
            <span className="form-label">Bairro</span>
            <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro" />
          </label>
          <label className="form-group form-group-cidade">
            <span className="form-label">Cidade</span>
            <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" />
          </label>
          <label className="form-group form-group-uf">
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
        </fieldset>

        {!readOnly && (
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Salvando...' : isEdicao ? 'Salvar' : 'Cadastrar'}
          </button>
          <Link to="/fornecedores" className="btn btn-secondary">Cancelar</Link>
        </div>
        )}
      </form>
    </div>
  );
}
