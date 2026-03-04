import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  produtosSoftwareApi,
  fornecedoresApi,
  areasApi,
  usuariosApi,
  hospedagensApi,
  formasAcessoApi,
  empresasApi,
} from '../../api/client';
import '../usuarios/Usuarios.css';
import '../CadastroFormLayout.css';
import './ProdutoSoftwareForm.css';

const GRAUS = [
  { value: '', label: '— Selecione —' },
  { value: '1', label: '1 - Muito Insatisfeito' },
  { value: '2', label: '2 - Insatisfeito' },
  { value: '3', label: '3 - Neutro' },
  { value: '4', label: '4 - Satisfeito' },
  { value: '5', label: '5 - Muito satisfeito' },
];

function ModalNovo({ titulo, labelCampo = 'Nome', aberto, onFechar, onSalvar, salvando }) {
  const [nome, setNome] = useState('');
  useEffect(() => {
    if (aberto) setNome('');
  }, [aberto]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const n = nome.trim();
    if (!n) return;
    await onSalvar(n);
    onFechar();
  };

  if (!aberto) return null;
  return (
    <div className="modal-overlay" onClick={onFechar} role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 id="modal-titulo" className="modal-titulo">{titulo}</h2>
        <form onSubmit={handleSubmit}>
          <label className="form-group">
            <span className="form-label">{labelCampo}</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={`Digite o ${labelCampo.toLowerCase()}...`}
              autoFocus
            />
          </label>
          <div className="modal-acoes">
            <button type="button" className="btn btn-secondary" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={salvando || !nome.trim()}>
              {salvando ? 'Salvando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SelectComNovo({ label, value, onChange, opcoes, onAbrirNovo, placeholder = '— Selecione —' }) {
  return (
    <label className="form-group">
      <span className="form-label">{label}</span>
      <div className="select-com-novo">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{placeholder}</option>
          {opcoes.map((o) => (
            <option key={o.id} value={o.id}>{o.nome}</option>
          ))}
        </select>
        <button type="button" className="btn btn-novo-item" onClick={onAbrirNovo} title={`Cadastrar nova ${label}`}>
          + Novo
        </button>
      </div>
    </label>
  );
}

export default function ProdutoSoftwareForm({ somenteLeitura = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);
  const readOnly = somenteLeitura;

  const [fornecedores, setFornecedores] = useState([]);
  const [areas, setAreas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [hospedagens, setHospedagens] = useState([]);
  const [formasAcesso, setFormasAcesso] = useState([]);

  const [nomeSistema, setNomeSistema] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [finalidadePrincipal, setFinalidadePrincipal] = useState('');
  const [breveDescritivo, setBreveDescritivo] = useState('');
  const [marcasAtendidas, setMarcasAtendidas] = useState('');
  const [usuariosQtdAproximada, setUsuariosQtdAproximada] = useState('');
  const [areaId, setAreaId] = useState('');
  const [responsavelTiId, setResponsavelTiId] = useState('');
  const [usuarioNegocioId, setUsuarioNegocioId] = useState('');
  const [hospedagemId, setHospedagemId] = useState('');
  const [onPremisesSites, setOnPremisesSites] = useState('');
  const [formaAcessoId, setFormaAcessoId] = useState('');
  const [integracoes, setIntegracoes] = useState('');
  const [controleAcessoPorUsuario, setControleAcessoPorUsuario] = useState(false);
  const [autenticacaoAdSso, setAutenticacaoAdSso] = useState(false);
  const [grauSatisfacao, setGrauSatisfacao] = useState('');
  const [problemasEnfrentados, setProblemasEnfrentados] = useState('');
  const [custoMensalSistema, setCustoMensalSistema] = useState('');
  const [custoMensalInfraestrutura, setCustoMensalInfraestrutura] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [popupTipo, setPopupTipo] = useState(null);
  const [popupSalvando, setPopupSalvando] = useState(false);

  const carregarListas = () => {
    Promise.all([
      fornecedoresApi.listar(),
      areasApi.listar(),
      empresasApi.listar(),
      usuariosApi.listar(),
      hospedagensApi.listar(),
      formasAcessoApi.listar(),
    ])
      .then(([f, a, emp, u, h, fa]) => {
        setFornecedores(f);
        setAreas(a);
        setEmpresas(Array.isArray(emp) ? emp : []);
        setUsuarios(u);
        setHospedagens(h);
        setFormasAcesso(fa);
      })
      .catch((e) => setErro(e.message));
  };

  useEffect(() => carregarListas(), []);

  useEffect(() => {
    if (isEdicao && id) {
      produtosSoftwareApi
        .buscar(id)
        .then((p) => {
          setNomeSistema(p.nomeSistema || '');
          setEmpresaId(p.empresaId || '');
          setFornecedorId(p.fornecedorId || '');
          setFinalidadePrincipal(p.finalidadePrincipal || '');
          setBreveDescritivo(p.breveDescritivo || '');
          setMarcasAtendidas(p.marcasAtendidas || '');
          setUsuariosQtdAproximada(p.usuariosQtdAproximada != null ? String(p.usuariosQtdAproximada) : '');
          setAreaId(p.areaId || '');
          setResponsavelTiId(p.responsavelTiId || '');
          setUsuarioNegocioId(p.usuarioNegocioId || '');
          setHospedagemId(p.hospedagemId || '');
          setOnPremisesSites(p.onPremisesSites || '');
          setFormaAcessoId(p.formaAcessoId || '');
          setIntegracoes(p.integracoes || '');
          setControleAcessoPorUsuario(Boolean(p.controleAcessoPorUsuario));
          setAutenticacaoAdSso(Boolean(p.autenticacaoAdSso));
          setGrauSatisfacao(p.grauSatisfacao != null ? String(p.grauSatisfacao) : '');
          setProblemasEnfrentados(p.problemasEnfrentados || '');
          setCustoMensalSistema(p.custoMensalSistema != null ? String(p.custoMensalSistema) : '');
          setCustoMensalInfraestrutura(p.custoMensalInfraestrutura != null ? String(p.custoMensalInfraestrutura) : '');
          setDataInicio(p.dataInicio ?? (p.ano ? `${p.ano}-01-01` : ''));
          setDataFim(p.dataFim ?? (p.ano ? `${p.ano}-12-31` : ''));
        })
        .catch((e) => setErro(e.message));
    }
  }, [id, isEdicao]);

  const handleSalvarPopup = async (nome) => {
    setPopupSalvando(true);
    try {
      if (popupTipo === 'empresa') {
        const razaoSocial = nome.trim();
        if (!razaoSocial) return;
        const novo = await empresasApi.criar({ razaoSocial, nomeFantasia: razaoSocial });
        setEmpresas((prev) => [...prev, novo]);
        setEmpresaId(novo.id);
      } else if (popupTipo === 'fornecedor') {
        const novo = await fornecedoresApi.criar({ nome: nome.trim() });
        setFornecedores((prev) => [...prev, novo]);
        setFornecedorId(novo.id);
      } else if (popupTipo === 'area') {
        const novo = await areasApi.criar({ nome: nome.trim() });
        setAreas((prev) => [...prev, novo]);
        setAreaId(novo.id);
      } else if (popupTipo === 'hospedagem') {
        const novo = await hospedagensApi.criar({ nome: nome.trim() });
        setHospedagens((prev) => [...prev, novo]);
        setHospedagemId(novo.id);
      } else if (popupTipo === 'formaAcesso') {
        const novo = await formasAcessoApi.criar({ nome: nome.trim() });
        setFormasAcesso((prev) => [...prev, novo]);
        setFormaAcessoId(novo.id);
      }
    } catch (e) {
      setErro(e.message);
    } finally {
      setPopupSalvando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    const payload = {
      nomeSistema,
      empresaId: empresaId || null,
      fornecedorId: fornecedorId || null,
      finalidadePrincipal,
      breveDescritivo,
      marcasAtendidas,
      usuariosQtdAproximada: usuariosQtdAproximada === '' ? null : Number(usuariosQtdAproximada),
      areaId: areaId || null,
      responsavelTiId: responsavelTiId || null,
      usuarioNegocioId: usuarioNegocioId || null,
      hospedagemId: hospedagemId || null,
      onPremisesSites,
      formaAcessoId: formaAcessoId || null,
      integracoes,
      controleAcessoPorUsuario,
      autenticacaoAdSso,
      grauSatisfacao: grauSatisfacao || null,
      problemasEnfrentados,
      custoMensalSistema: custoMensalSistema === '' ? null : Number(custoMensalSistema),
      custoMensalInfraestrutura: custoMensalInfraestrutura === '' ? null : Number(custoMensalInfraestrutura),
      dataInicio: dataInicio.trim() || null,
      dataFim: dataFim.trim() || null,
    };
    try {
      if (isEdicao) await produtosSoftwareApi.atualizar(id, payload);
      else await produtosSoftwareApi.criar(payload);
      navigate('/sistemas');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const tituloPopup = {
    empresa: 'Nova Empresa',
    fornecedor: 'Novo Fornecedor / Desenvolvedor',
    area: 'Nova Área',
    hospedagem: 'Nova Hospedagem',
    formaAcesso: 'Nova Forma de Acesso',
  };

  return (
    <div className="cadastro-page form-cadastro-page">
      <div className="page-header">
        <h1>{readOnly ? 'Ver Sistema' : isEdicao ? 'Editar Sistema' : 'Novo Sistema'}</h1>
        <div className="page-header-actions">
          <Link to="/sistemas" className="btn btn-secondary">Voltar</Link>
        </div>
      </div>

      <form className="form-card form-cadastro" onSubmit={handleSubmit}>
        {erro && <p className="erro-msg">{erro}</p>}
        <fieldset disabled={readOnly} style={{ border: 'none', margin: 0, padding: 0 }}>
        <section className="form-secao">
          <h2 className="form-secao-titulo">Identificação do sistema</h2>
          <label className="form-group">
            <span className="form-label">Nome do Sistema</span>
            <input type="text" value={nomeSistema} onChange={(e) => setNomeSistema(e.target.value)} placeholder="Ex.: Sistema de Vendas" />
          </label>
          <SelectComNovo
            label="Empresa"
            value={empresaId}
            onChange={setEmpresaId}
            opcoes={empresas.map((e) => ({ id: e.id, nome: e.nomeFantasia || e.razaoSocial || e.id }))}
            onAbrirNovo={() => setPopupTipo('empresa')}
            placeholder="— Selecione a empresa —"
          />
          <SelectComNovo
            label="Fornecedor / Desenvolvedor"
            value={fornecedorId}
            onChange={setFornecedorId}
            opcoes={fornecedores}
            onAbrirNovo={() => setPopupTipo('fornecedor')}
          />
          <label className="form-group">
            <span className="form-label">Finalidade Principal</span>
            <textarea value={finalidadePrincipal} onChange={(e) => setFinalidadePrincipal(e.target.value)} placeholder="Descreva a finalidade principal do projeto" rows={2} />
          </label>
          <label className="form-group">
            <span className="form-label">Breve Descritivo</span>
            <textarea value={breveDescritivo} onChange={(e) => setBreveDescritivo(e.target.value)} placeholder="Resumo do que o projeto faz" rows={3} />
          </label>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Uso e abrangência</h2>
          <label className="form-group">
            <span className="form-label">Marcas Atendidas</span>
            <input type="text" value={marcasAtendidas} onChange={(e) => setMarcasAtendidas(e.target.value)} placeholder="Marcas ou unidades atendidas" />
          </label>
          <label className="form-group">
            <span className="form-label">Usuários (quantidade aproximada)</span>
            <input type="number" min={0} value={usuariosQtdAproximada} onChange={(e) => setUsuariosQtdAproximada(e.target.value)} placeholder="Ex.: 50" />
          </label>
          <SelectComNovo
            label="Área"
            value={areaId}
            onChange={setAreaId}
            opcoes={areas}
            onAbrirNovo={() => setPopupTipo('area')}
          />
          <label className="form-group">
            <span className="form-label">Responsável TI</span>
            <select value={responsavelTiId} onChange={(e) => setResponsavelTiId(e.target.value)}>
              <option value="">— Selecione —</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Usuário Negócio</span>
            <select value={usuarioNegocioId} onChange={(e) => setUsuarioNegocioId(e.target.value)}>
              <option value="">— Selecione —</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Hospedagem e acesso</h2>
          <SelectComNovo
            label="Hospedagem"
            value={hospedagemId}
            onChange={setHospedagemId}
            opcoes={hospedagens}
            onAbrirNovo={() => setPopupTipo('hospedagem')}
          />
          <label className="form-group">
            <span className="form-label">Se On Premises, separar por SITE</span>
            <input type="text" value={onPremisesSites} onChange={(e) => setOnPremisesSites(e.target.value)} placeholder="Ex.: SITE SP, SITE RJ" />
          </label>
          <SelectComNovo
            label="Forma de Acesso ao Sistema"
            value={formaAcessoId}
            onChange={setFormaAcessoId}
            opcoes={formasAcesso}
            onAbrirNovo={() => setPopupTipo('formaAcesso')}
          />
          <label className="form-group">
            <span className="form-label">Integrações</span>
            <textarea value={integracoes} onChange={(e) => setIntegracoes(e.target.value)} placeholder="Sistemas ou APIs integradas" rows={2} />
          </label>
        </section>

        <section className="form-secao">
          <h2 className="form-secao-titulo">Segurança e satisfação</h2>
          <label className="label-checkbox form-group">
            <input type="checkbox" checked={controleAcessoPorUsuario} onChange={(e) => setControleAcessoPorUsuario(e.target.checked)} />
            <span>Controle de Acesso por Usuário?</span>
          </label>
          <label className="label-checkbox form-group">
            <input type="checkbox" checked={autenticacaoAdSso} onChange={(e) => setAutenticacaoAdSso(e.target.checked)} />
            <span>Autenticação por AD / SSO?</span>
          </label>
          <label className="form-group">
            <span className="form-label">Grau de Satisfação</span>
            <select value={grauSatisfacao} onChange={(e) => setGrauSatisfacao(e.target.value)}>
              {GRAUS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Problemas Enfrentados</span>
            <textarea value={problemasEnfrentados} onChange={(e) => setProblemasEnfrentados(e.target.value)} placeholder="Problemas ou dificuldades relatados" rows={3} />
          </label>
        </section>

        </fieldset>

        {!readOnly && (
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Cadastrar sistema'}
          </button>
          <Link to="/sistemas" className="btn btn-secondary">Cancelar</Link>
        </div>
        )}
      </form>

      <ModalNovo
        titulo={popupTipo ? tituloPopup[popupTipo] : ''}
        labelCampo={popupTipo === 'empresa' ? 'Razão social ou Nome fantasia' : 'Nome'}
        aberto={Boolean(popupTipo)}
        onFechar={() => setPopupTipo(null)}
        onSalvar={handleSalvarPopup}
        salvando={popupSalvando}
      />
    </div>
  );
}
