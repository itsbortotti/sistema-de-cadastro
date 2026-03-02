import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  produtosSoftwareApi,
  fornecedoresApi,
  areasApi,
  usuariosApi,
  hospedagensApi,
  formasAcessoApi,
  timesApi,
} from '../../api/client';
import '../usuarios/Usuarios.css';
import './ProdutosSoftwareList.css';

// Parse CSV com suporte a campos entre aspas
function parseCSV(texto) {
  const linhas = [];
  const linhasRaw = texto.split(/\r?\n/).filter((l) => l.trim());
  if (linhasRaw.length === 0) return { headers: [], rows: [] };
  for (const linha of linhasRaw) {
    const campos = [];
    let campo = '';
    let dentroAspas = false;
    for (let i = 0; i < linha.length; i++) {
      const c = linha[i];
      if (c === '"') {
        dentroAspas = !dentroAspas;
      } else if ((c === ',' && !dentroAspas) || (c === ';' && !dentroAspas)) {
        campos.push(campo.trim());
        campo = '';
      } else {
        campo += c;
      }
    }
    campos.push(campo.trim());
    linhas.push(campos);
  }
  const headers = linhas[0] || [];
  const rows = linhas.slice(1);
  return { headers, rows };
}

// Formata valor numérico como moeda BRL
function formatarMoeda(valor) {
  if (valor == null || valor === '') return '—';
  const n = Number(valor);
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function formatarData(str) {
  if (!str || typeof str !== 'string') return '—';
  try {
    const d = new Date(str + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return str;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return str;
  }
}

// Mapeia nome do cabeçalho (normalizado) para chave do payload
const MAPEAMENTO_CSV = {
  'nome do sistema': 'nomeSistema',
  'fornecedor': 'fornecedorNome',
  'fornecedor / desenvolvedor': 'fornecedorNome',
  'finalidade principal': 'finalidadePrincipal',
  'breve descritivo': 'breveDescritivo',
  'marcas atendidas': 'marcasAtendidas',
  'usuários (qtd aproximada)': 'usuariosQtdAproximada',
  'usuários (qtd)': 'usuariosQtdAproximada',
  'usuarios (qtd aproximada)': 'usuariosQtdAproximada',
  'área': 'areaNome',
  'area': 'areaNome',
  'responsável ti': 'responsavelTiNome',
  'responsavel ti': 'responsavelTiNome',
  'usuário negócio': 'usuarioNegocioNome',
  'usuario negocio': 'usuarioNegocioNome',
  'hospedagem': 'hospedagemNome',
  'on premises': 'onPremisesSites',
  'se on premises, separar por site': 'onPremisesSites',
  'forma de acesso': 'formaAcessoNome',
  'forma de acesso ao sistema': 'formaAcessoNome',
  'integrações': 'integracoes',
  'integracoes': 'integracoes',
  'controle de acesso por usuário': 'controleAcessoPorUsuario',
  'controle de acesso por usuário?': 'controleAcessoPorUsuario',
  'autenticação por ad / sso': 'autenticacaoAdSso',
  'autenticação por ad / sso?': 'autenticacaoAdSso',
  'autenticacao por ad / sso': 'autenticacaoAdSso',
  'grau de satisfação': 'grauSatisfacao',
  'grau de satisfacao': 'grauSatisfacao',
  'problemas enfrentados': 'problemasEnfrentados',
  'custo mensal sistema': 'custoMensalSistema',
  'custo mensal infraestrutura': 'custoMensalInfraestrutura',
  'capex': 'custoMensalSistema',
  'opex': 'custoMensalInfraestrutura',
  'time': 'timeNome',
  'ano': 'ano',
  'ano referencia': 'ano',
  'ano (referência)': 'ano',
  'periodo inicial': 'dataInicio',
  'período inicial': 'dataInicio',
  'periodo final': 'dataFim',
  'período final': 'dataFim',
  'data inicio': 'dataInicio',
  'data fim': 'dataFim',
  'início': 'dataInicio',
  'fim': 'dataFim',
};

function normalizarHeader(h) {
  return String(h || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function simNaoValor(v) {
  if (v == null || v === '') return false;
  const s = String(v).toLowerCase().trim();
  return s === 'sim' || s === 's' || s === '1' || s === 'true' || s === 'x' || s === 'yes';
}

export default function ProdutosSoftwareList() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);

  const [modalImportarAberto, setModalImportarAberto] = useState(false);
  const [arquivoPreview, setArquivoPreview] = useState(null);
  const [importando, setImportando] = useState(false);
  const [resultadoImportacao, setResultadoImportacao] = useState(null);
  const [listasAux, setListasAux] = useState({ fornecedores: [], areas: [], usuarios: [], hospedagens: [], formasAcesso: [], times: [] });
  const inputFileRef = useRef(null);

  const carregar = () => {
    setCarregando(true);
    setErro('');
    produtosSoftwareApi.listar().then(setLista).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  };
  useEffect(() => carregar(), []);

  useEffect(() => {
    if (modalImportarAberto) {
      Promise.all([
        fornecedoresApi.listar(),
        areasApi.listar(),
        usuariosApi.listar(),
        hospedagensApi.listar(),
        formasAcessoApi.listar(),
        timesApi.listar(),
      ])
        .then(([f, a, u, h, fa, t]) => setListasAux({ fornecedores: f, areas: a, usuarios: u, hospedagens: h, formasAcesso: fa, times: t }))
        .catch(() => {});
    }
  }, [modalImportarAberto]);

  const handleExcluir = (id, nome) => {
    if (!window.confirm(`Excluir o projeto "${nome}"?`)) return;
    setExcluindo(id);
    produtosSoftwareApi.remover(id).then(carregar).catch((e) => setErro(e.message)).finally(() => setExcluindo(null));
  };

  const abrirSeletorArquivo = () => {
    setArquivoPreview(null);
    setResultadoImportacao(null);
    inputFileRef.current?.click();
  };

  const handleArquivoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const texto = ev.target?.result || '';
        const { headers, rows } = parseCSV(texto);
        setArquivoPreview({ headers, rows, nome: file.name });
      } catch (err) {
        setErro('Erro ao ler o arquivo CSV.');
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const buscarPorNome = (lista, nome) => {
    if (!nome || !lista?.length) return null;
    const n = String(nome).trim().toLowerCase();
    const found = lista.find((x) => String(x.nome || '').trim().toLowerCase() === n);
    return found ? found.id : null;
  };

  const processarLinhaParaPayload = (headers, valores, listas) => {
    const obj = {};
    headers.forEach((h, i) => {
      const key = MAPEAMENTO_CSV[normalizarHeader(h)];
      if (!key) return;
      const valor = valores[i] != null ? String(valores[i]).trim() : '';
      if (key === 'fornecedorNome') obj.fornecedorId = buscarPorNome(listas.fornecedores, valor) || null;
      else if (key === 'areaNome') obj.areaId = buscarPorNome(listas.areas, valor) || null;
      else if (key === 'responsavelTiNome') obj.responsavelTiId = buscarPorNome(listas.usuarios, valor) || null;
      else if (key === 'usuarioNegocioNome') obj.usuarioNegocioId = buscarPorNome(listas.usuarios, valor) || null;
      else if (key === 'hospedagemNome') obj.hospedagemId = buscarPorNome(listas.hospedagens, valor) || null;
      else if (key === 'formaAcessoNome') obj.formaAcessoId = buscarPorNome(listas.formasAcesso, valor) || null;
      else if (key === 'timeNome') obj.timeId = buscarPorNome(listas.times, valor) || null;
      else if (key === 'controleAcessoPorUsuario') obj.controleAcessoPorUsuario = simNaoValor(valor);
      else if (key === 'autenticacaoAdSso') obj.autenticacaoAdSso = simNaoValor(valor);
      else if (key === 'usuariosQtdAproximada') obj.usuariosQtdAproximada = valor === '' ? null : Number(valor);
      else if (key === 'custoMensalSistema') obj.custoMensalSistema = valor === '' ? null : Number(valor);
      else if (key === 'custoMensalInfraestrutura') obj.custoMensalInfraestrutura = valor === '' ? null : Number(valor);
      else if (key === 'ano') obj.ano = valor === '' ? null : Number(valor);
      else if (key === 'dataInicio') obj.dataInicio = valor === '' ? null : valor;
      else if (key === 'dataFim') obj.dataFim = valor === '' ? null : valor;
      else if (key === 'grauSatisfacao') obj.grauSatisfacao = valor === '' ? null : valor;
      else obj[key] = valor;
    });
    return {
      nomeSistema: obj.nomeSistema || '',
      fornecedorId: obj.fornecedorId ?? null,
      finalidadePrincipal: obj.finalidadePrincipal || '',
      breveDescritivo: obj.breveDescritivo || '',
      marcasAtendidas: obj.marcasAtendidas || '',
      usuariosQtdAproximada: obj.usuariosQtdAproximada ?? null,
      areaId: obj.areaId ?? null,
      responsavelTiId: obj.responsavelTiId ?? null,
      usuarioNegocioId: obj.usuarioNegocioId ?? null,
      hospedagemId: obj.hospedagemId ?? null,
      onPremisesSites: obj.onPremisesSites || '',
      formaAcessoId: obj.formaAcessoId ?? null,
      integracoes: obj.integracoes || '',
      controleAcessoPorUsuario: Boolean(obj.controleAcessoPorUsuario),
      autenticacaoAdSso: Boolean(obj.autenticacaoAdSso),
      grauSatisfacao: obj.grauSatisfacao ?? null,
      problemasEnfrentados: obj.problemasEnfrentados || '',
      custoMensalSistema: obj.custoMensalSistema ?? null,
      custoMensalInfraestrutura: obj.custoMensalInfraestrutura ?? null,
      timeId: obj.timeId ?? null,
      dataInicio: obj.dataInicio ?? null,
      dataFim: obj.dataFim ?? null,
    };
  };

  const executarImportacao = async () => {
    if (!arquivoPreview?.rows?.length) return;
    setImportando(true);
    setResultadoImportacao(null);
    try {
      const items = arquivoPreview.rows.map((valores) =>
        processarLinhaParaPayload(arquivoPreview.headers, valores, listasAux)
      );
      const resultado = await produtosSoftwareApi.importarBulk(items);
      setResultadoImportacao(resultado);
      if (resultado.criados > 0) carregar();
    } catch (e) {
      setResultadoImportacao({ criados: 0, erros: [e.message] });
    } finally {
      setImportando(false);
    }
  };

  const fecharModalImportar = () => {
    setModalImportarAberto(false);
    setArquivoPreview(null);
    setResultadoImportacao(null);
  };

  const simNao = (v) => (v ? 'Sim' : 'Não');
  const v = (x) => (x != null && x !== '' ? String(x) : '—');

  if (carregando) return <p>Carregando...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="usuarios-page produtos-software-list-page">
      <div className="page-header">
        <h1>Projetos</h1>
        <div className="page-header-actions">
          <button type="button" className="btn btn-outline" onClick={() => setModalImportarAberto(true)}>
            Importar CSV
          </button>
          <Link to="/projetos/novo" className="btn btn-primary">Novo Projeto</Link>
        </div>
      </div>
      <div className="table-wrap table-wrap-scroll">
        <table className="table table-produtos-software">
          <thead>
            <tr>
              <th>Nome do Projeto</th>
              <th>Fornecedor / Desenvolvedor</th>
              <th>Finalidade Principal</th>
              <th>Breve Descritivo</th>
              <th>Marcas Atendidas</th>
              <th>Usuários (qtd aproximada)</th>
              <th>Área</th>
              <th>Responsável TI</th>
              <th>Usuário Negócio</th>
              <th>Hospedagem</th>
              <th>Se on Premises, separar por SITE</th>
              <th>Forma de Acesso ao Sistema</th>
              <th>Integrações</th>
              <th>Controle de Acesso por Usuário?</th>
              <th>Autenticação por AD / SSO?</th>
              <th>Grau de Satisfação</th>
              <th>Problemas Enfrentados</th>
              <th>Capex</th>
              <th>Opex</th>
              <th>TIME</th>
              <th>Período inicial</th>
              <th>Período final</th>
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={23}>Nenhum projeto cadastrado.</td>
              </tr>
            ) : (
              lista.map((p) => (
                <tr key={p.id}>
                  <td>{v(p.nomeSistema)}</td>
                  <td>{v(p.fornecedorNome)}</td>
                  <td>{v(p.finalidadePrincipal)}</td>
                  <td className="td-texto" title={p.breveDescritivo}>{v(p.breveDescritivo)}</td>
                  <td>{v(p.marcasAtendidas)}</td>
                  <td className="td-numero">{p.usuariosQtdAproximada != null ? p.usuariosQtdAproximada : '—'}</td>
                  <td>{v(p.areaNome)}</td>
                  <td>{v(p.responsavelTiNome)}</td>
                  <td>{v(p.usuarioNegocioNome)}</td>
                  <td>{v(p.hospedagemNome)}</td>
                  <td className="td-texto">{v(p.onPremisesSites)}</td>
                  <td>{v(p.formaAcessoNome)}</td>
                  <td className="td-texto" title={p.integracoes}>{v(p.integracoes)}</td>
                  <td>{simNao(p.controleAcessoPorUsuario)}</td>
                  <td>{simNao(p.autenticacaoAdSso)}</td>
                  <td>{v(p.grauSatisfacao)}</td>
                  <td className="td-texto" title={p.problemasEnfrentados}>{v(p.problemasEnfrentados)}</td>
                  <td className="td-numero">{p.custoMensalSistema != null ? formatarMoeda(p.custoMensalSistema) : '—'}</td>
                  <td className="td-numero">{p.custoMensalInfraestrutura != null ? formatarMoeda(p.custoMensalInfraestrutura) : '—'}</td>
                  <td>{v(p.timeNome)}</td>
                  <td>{formatarData(p.dataInicio)}</td>
                  <td>{formatarData(p.dataFim)}</td>
                  <td className="td-acoes">
                    <Link to={`/projetos/editar/${p.id}`} className="btn btn-sm">Editar</Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleExcluir(p.id, p.nomeSistema)}
                      disabled={excluindo === p.id}
                    >
                      {excluindo === p.id ? '...' : 'Excluir'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <input
        ref={inputFileRef}
        type="file"
        accept=".csv,text/csv,application/csv"
        onChange={handleArquivoChange}
        style={{ display: 'none' }}
      />

      {modalImportarAberto && (
        <div className="modal-overlay" onClick={fecharModalImportar} role="dialog" aria-modal="true">
          <div className="modal-box modal-importar-csv" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-titulo">Importar projetos (CSV)</h2>
            <p className="modal-desc">
              Selecione um arquivo CSV com a primeira linha contendo os nomes das colunas. Use vírgula ou ponto e vírgula como separador.
              Campos com texto que contém vírgula devem estar entre aspas.
            </p>
            <p className="modal-desc">
              <a href="/exemplo-produtos-software.csv" download className="link-download">Baixar CSV de exemplo</a>
            </p>
            {!arquivoPreview ? (
              <button type="button" className="btn btn-primary" onClick={abrirSeletorArquivo}>
                Escolher arquivo CSV
              </button>
            ) : (
              <div className="importar-preview">
                <p><strong>Arquivo:</strong> {arquivoPreview.nome}</p>
                <p><strong>Linhas a importar:</strong> {arquivoPreview.rows.length}</p>
                {resultadoImportacao ? (
                  <div className="importar-resultado">
                    <p className="sucesso-msg">{resultadoImportacao.criados} registro(s) importado(s) com sucesso.</p>
                    {resultadoImportacao.erros?.length > 0 && (
                      <div className="importar-erros">
                        <strong>Erros:</strong>
                        <ul>
                          {resultadoImportacao.erros.slice(0, 10).map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                          {resultadoImportacao.erros.length > 10 && (
                            <li>... e mais {resultadoImportacao.erros.length - 10} erro(s)</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="importar-acoes">
                    <button type="button" className="btn btn-secondary" onClick={abrirSeletorArquivo}>
                      Trocar arquivo
                    </button>
                    <button type="button" className="btn btn-primary" onClick={executarImportacao} disabled={importando}>
                      {importando ? 'Importando...' : `Importar ${arquivoPreview.rows.length} linha(s)`}
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="modal-acoes">
              <button type="button" className="btn btn-secondary" onClick={fecharModalImportar}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
