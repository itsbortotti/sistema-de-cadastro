import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { empresasApi } from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroFormLayout.css';

const PORTES = ['', 'MEI', 'ME', 'EPP', 'Demais'];
const SITUACOES = ['', 'Ativa', 'Baixada', 'Inapta', 'Nula', 'Suspensa', 'Inconsistente'];

export default function EmpresaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);

  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [dataAbertura, setDataAbertura] = useState('');
  const [naturezaJuridicaCodigo, setNaturezaJuridicaCodigo] = useState('');
  const [naturezaJuridicaDescricao, setNaturezaJuridicaDescricao] = useState('');
  const [atividadePrincipalCodigo, setAtividadePrincipalCodigo] = useState('');
  const [atividadePrincipalDescricao, setAtividadePrincipalDescricao] = useState('');
  const [atividadesSecundarias, setAtividadesSecundarias] = useState('');
  const [situacaoCadastral, setSituacaoCadastral] = useState('');
  const [dataSituacaoCadastral, setDataSituacaoCadastral] = useState('');
  const [motivoSituacaoCadastral, setMotivoSituacaoCadastral] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [cep, setCep] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [capitalSocial, setCapitalSocial] = useState('');
  const [porte, setPorte] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isEdicao && id) {
      empresasApi
        .buscar(id)
        .then((e) => {
          setCnpj(e.cnpj || '');
          setRazaoSocial(e.razaoSocial || '');
          setNomeFantasia(e.nomeFantasia || '');
          setDataAbertura(e.dataAbertura || '');
          setNaturezaJuridicaCodigo(e.naturezaJuridicaCodigo || '');
          setNaturezaJuridicaDescricao(e.naturezaJuridicaDescricao || '');
          setAtividadePrincipalCodigo(e.atividadePrincipalCodigo || '');
          setAtividadePrincipalDescricao(e.atividadePrincipalDescricao || '');
          setAtividadesSecundarias(e.atividadesSecundarias || '');
          setSituacaoCadastral(e.situacaoCadastral || '');
          setDataSituacaoCadastral(e.dataSituacaoCadastral || '');
          setMotivoSituacaoCadastral(e.motivoSituacaoCadastral || '');
          setLogradouro(e.logradouro || '');
          setNumero(e.numero || '');
          setComplemento(e.complemento || '');
          setBairro(e.bairro || '');
          setCidade(e.cidade || '');
          setUf(e.uf || '');
          setCep(e.cep || '');
          setTelefone(e.telefone || '');
          setEmail(e.email || '');
          setCapitalSocial(e.capitalSocial ?? '');
          setPorte(e.porte || '');
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
        naturezaJuridicaCodigo,
        naturezaJuridicaDescricao,
        atividadePrincipalCodigo,
        atividadePrincipalDescricao,
        atividadesSecundarias,
        situacaoCadastral,
        dataSituacaoCadastral,
        motivoSituacaoCadastral,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        cep,
        telefone,
        email,
        capitalSocial: capitalSocial === '' ? '' : String(capitalSocial),
        porte,
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
    <div className="usuarios-page form-cadastro-page">
      <div className="page-header">
        <h1>{isEdicao ? 'Editar empresa' : 'Nova empresa'}</h1>
        <Link to="/empresas" className="btn btn-secondary">Voltar</Link>
      </div>
      <form className="form-card form-cadastro" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}

        <section className="form-secao">
          <h2 className="form-secao-titulo">Identificação e CNPJ</h2>
          <label className="form-group">
            <span className="form-label">CNPJ *</span>
            <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" maxLength={18} />
          </label>
          <label className="form-group">
            <span className="form-label">Razão Social *</span>
            <input type="text" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} required placeholder="Razão social da empresa" />
          </label>
          <label className="form-group">
            <span className="form-label">Nome Fantasia</span>
            <input type="text" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} placeholder="Nome fantasia" />
          </label>
          <label className="form-group form-group-inline">
            <span className="form-label">Data de abertura</span>
            <input type="date" value={dataAbertura} onChange={(e) => setDataAbertura(e.target.value)} />
          </label>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Natureza jurídica e atividades</h2>
          <label className="form-group form-group-inline">
            <span className="form-label">Código natureza jurídica</span>
            <input type="text" value={naturezaJuridicaCodigo} onChange={(e) => setNaturezaJuridicaCodigo(e.target.value)} placeholder="Ex.: 2063" />
          </label>
          <label className="form-group">
            <span className="form-label">Descrição natureza jurídica</span>
            <input type="text" value={naturezaJuridicaDescricao} onChange={(e) => setNaturezaJuridicaDescricao(e.target.value)} placeholder="Ex.: Sociedade Empresária Limitada" />
          </label>
          <label className="form-group form-group-inline">
            <span className="form-label">CNAE principal (código)</span>
            <input type="text" value={atividadePrincipalCodigo} onChange={(e) => setAtividadePrincipalCodigo(e.target.value)} placeholder="Ex.: 6201-5/00" />
          </label>
          <label className="form-group">
            <span className="form-label">Descrição atividade principal</span>
            <input type="text" value={atividadePrincipalDescricao} onChange={(e) => setAtividadePrincipalDescricao(e.target.value)} placeholder="Descrição do CNAE principal" />
          </label>
          <label className="form-group">
            <span className="form-label">Atividades secundárias (CNAEs)</span>
            <textarea value={atividadesSecundarias} onChange={(e) => setAtividadesSecundarias(e.target.value)} placeholder="Lista de CNAEs secundários (um por linha ou separados por vírgula)" rows={3} />
          </label>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Situação cadastral</h2>
          <label className="form-group">
            <span className="form-label">Situação cadastral</span>
            <select value={situacaoCadastral} onChange={(e) => setSituacaoCadastral(e.target.value)}>
              {SITUACOES.map((s) => (
                <option key={s || 'vazio'} value={s}>{s || '— Selecione —'}</option>
              ))}
            </select>
          </label>
          <label className="form-group form-group-inline">
            <span className="form-label">Data situação cadastral</span>
            <input type="date" value={dataSituacaoCadastral} onChange={(e) => setDataSituacaoCadastral(e.target.value)} />
          </label>
          <label className="form-group">
            <span className="form-label">Motivo situação cadastral</span>
            <input type="text" value={motivoSituacaoCadastral} onChange={(e) => setMotivoSituacaoCadastral(e.target.value)} placeholder="Motivo (quando aplicável)" />
          </label>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Endereço</h2>
          <label className="form-group">
            <span className="form-label">CEP</span>
            <input type="text" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" maxLength={9} />
          </label>
          <label className="form-group">
            <span className="form-label">Logradouro</span>
            <input type="text" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} placeholder="Rua, avenida..." />
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
            <input type="text" value={uf} onChange={(e) => setUf(e.target.value)} placeholder="UF" maxLength={2} />
          </label>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Contato</h2>
          <label className="form-group">
            <span className="form-label">Telefone</span>
            <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 0000-0000" />
          </label>
          <label className="form-group">
            <span className="form-label">E-mail</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@empresa.com" />
          </label>
          <label className="form-group">
            <span className="form-label">Nome do responsável</span>
            <input type="text" value={nomeResponsavel} onChange={(e) => setNomeResponsavel(e.target.value)} placeholder="Responsável legal ou contato" />
          </label>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Capital social e porte</h2>
          <label className="form-group">
            <span className="form-label">Capital social (R$)</span>
            <input type="number" step="0.01" min="0" value={capitalSocial} onChange={(e) => setCapitalSocial(e.target.value)} placeholder="0,00" />
          </label>
          <label className="form-group">
            <span className="form-label">Porte da empresa</span>
            <select value={porte} onChange={(e) => setPorte(e.target.value)}>
              {PORTES.map((p) => (
                <option key={p || 'vazio'} value={p}>{p || '— Selecione —'}</option>
              ))}
            </select>
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

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Salvando...' : isEdicao ? 'Salvar' : 'Cadastrar'}
          </button>
          <Link to="/empresas" className="btn btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
