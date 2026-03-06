import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import BtnVoltarHeader from '../../components/BtnVoltarHeader';
import { empresasApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroFormLayout.css';
import './Empresas.css';

export default function EmpresaForm({ somenteLeitura = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);
  const readOnly = somenteLeitura;

  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [dataAbertura, setDataAbertura] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [cep, setCep] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
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
      setLogradouro(data.logradouro || '');
      setBairro(data.bairro || '');
      setCidade(data.localidade || '');
      setUf((data.uf || '').toUpperCase().slice(0, 2));
      if (data.cep) setCep(data.cep);
    } catch (_e) {
      setErroCep('Não foi possível buscar o CEP. Verifique a conexão.');
    } finally {
      setBuscandoCep(false);
    }
  };

  useEffect(() => {
    if (isEdicao && id) {
      empresasApi
        .buscar(id)
        .then((e) => {
          setCnpj(e.cnpj || '');
          setRazaoSocial(e.razaoSocial || '');
          setNomeFantasia(e.nomeFantasia || '');
          setDataAbertura(e.dataAbertura || '');
          setLogradouro(e.logradouro || '');
          setNumero(e.numero || '');
          setComplemento(e.complemento || '');
          setBairro(e.bairro || '');
          setCidade(e.cidade || '');
          setUf(e.uf || '');
          setCep(e.cep || '');
          setTelefone(e.telefone || '');
          setEmail(e.email || '');
          setInscricaoEstadual(e.inscricaoEstadual || '');
          setInscricaoMunicipal(e.inscricaoMunicipal || '');
          setNomeResponsavel(e.nomeResponsavel || '');
          setObservacoes(e.observacoes || '');
        })
        .catch((e) => setErro(e.message));
    }
  }, [id, isEdicao]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (!razaoSocial.trim()) {
      setErro('Razão social é obrigatória.');
      return;
    }
    setEnviando(true);
    try {
      const payload = {
        cnpj,
        razaoSocial: razaoSocial.trim(),
        nomeFantasia,
        dataAbertura,
        naturezaJuridicaCodigo: '',
        naturezaJuridicaDescricao: '',
        atividadePrincipalCodigo: '',
        atividadePrincipalDescricao: '',
        atividadesSecundarias: '',
        situacaoCadastral: '',
        dataSituacaoCadastral: '',
        motivoSituacaoCadastral: '',
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        cep,
        telefone,
        email,
        capitalSocial: '',
        porte: '',
        inscricaoEstadual,
        inscricaoMunicipal,
        nomeResponsavel,
        observacoes,
      };
      if (isEdicao) await empresasApi.atualizar(id, payload);
      else await empresasApi.criar(payload);
      navigate('/empresas');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="cadastro-page form-cadastro-page empresas-form-page">
      <div className="page-header">
        <BtnVoltarHeader to="/empresas" />
        <h1>{readOnly ? 'Ver empresa' : isEdicao ? 'Editar empresa' : ''}</h1>
      </div>
      <form className="form-card form-cadastro" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}
        <fieldset disabled={readOnly} style={{ border: 'none', margin: 0, padding: 0 }}>
        <section className="form-secao form-secao-identificacao">
          <h2 className="form-secao-titulo">Identificação e CNPJ</h2>
          <label className="form-group form-group-cnpj">
            <span className="form-label">CNPJ</span>
            <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" maxLength={18} />
          </label>
          <label className="form-group form-group-data form-group-inline">
            <span className="form-label">Data de abertura</span>
            <input type="date" value={dataAbertura} onChange={(e) => setDataAbertura(e.target.value)} />
          </label>
          <label className="form-group form-group-razao">
            <span className="form-label">Razão Social *</span>
            <input type="text" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} required placeholder="Razão social da empresa" />
          </label>
          <label className="form-group form-group-fantasia">
            <span className="form-label">Nome Fantasia</span>
            <input type="text" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} placeholder="Nome fantasia" />
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
                aria-describedby={erroCep ? 'erro-cep' : undefined}
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
            {erroCep && <p id="erro-cep" className="form-hint form-hint-erro">{erroCep}</p>}
          </div>
          <label className="form-group form-group-logradouro">
            <span className="form-label">Logradouro</span>
            <input type="text" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} placeholder="Rua, avenida..." />
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
            <input type="text" value={uf} onChange={(e) => setUf(e.target.value)} placeholder="UF" maxLength={2} />
          </label>
        </section>

        <section className="form-secao form-secao-contato">
          <h2 className="form-secao-titulo">Contato</h2>
          <label className="form-group">
            <span className="form-label">Telefone</span>
            <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 0000-0000" />
          </label>
          <label className="form-group">
            <span className="form-label">E-mail</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@empresa.com" />
          </label>
          <label className="form-group form-group-responsavel">
            <span className="form-label">Nome do responsável</span>
            <input type="text" value={nomeResponsavel} onChange={(e) => setNomeResponsavel(e.target.value)} placeholder="Responsável legal ou contato" />
          </label>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Inscrições e observações</h2>
          <label className="form-group">
            <span className="form-label">Inscrição estadual</span>
            <input type="text" value={inscricaoEstadual} onChange={(e) => setInscricaoEstadual(e.target.value)} placeholder="Inscrição estadual" />
          </label>
          <label className="form-group">
            <span className="form-label">Inscrição municipal</span>
            <input type="text" value={inscricaoMunicipal} onChange={(e) => setInscricaoMunicipal(e.target.value)} placeholder="Inscrição municipal" />
          </label>
          <label className="form-group">
            <span className="form-label">Observações</span>
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Anotações sobre a empresa" rows={3} />
          </label>
        </section>
        </fieldset>

        {!readOnly && (
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Salvando...' : isEdicao ? 'Salvar' : 'Cadastrar'}
          </button>
          <Link to="/empresas" className="btn btn-secondary">Cancelar</Link>
        </div>
        )}
      </form>
    </div>
  );
}
