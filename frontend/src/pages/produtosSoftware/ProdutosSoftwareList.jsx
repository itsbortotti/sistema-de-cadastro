import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  produtosSoftwareApi,
  fornecedoresApi,
  areasApi,
  usuariosApi,
  hospedagensApi,
  formasAcessoApi,
  empresasApi,
} from '../../api/client';
import AcoesListagem from '../../components/AcoesListagem';
import ConfigColunasModal from '../../components/ConfigColunasModal';
import { useListColumns } from '../../hooks/useListColumns';
import '../usuarios/Usuarios.css';
import '../CadastroListLayout.css';
import './ProdutosSoftwareList.css';

const COLUNAS_SISTEMAS = [
  { id: 'nomeSistema', label: 'Nome do Sistema' },
  { id: 'empresaNome', label: 'Empresa' },
  { id: 'fornecedorNome', label: 'Fornecedor / Desenvolvedor' },
  { id: 'finalidadePrincipal', label: 'Finalidade Principal' },
  { id: 'breveDescritivo', label: 'Breve Descritivo' },
  { id: 'marcasAtendidas', label: 'Marcas Atendidas' },
  { id: 'usuariosQtd', label: 'Usuários (qtd aproximada)' },
  { id: 'areaNome', label: 'Área' },
  { id: 'responsavelTiNome', label: 'Responsável TI' },
  { id: 'usuarioNegocioNome', label: 'Usuário Negócio' },
  { id: 'hospedagemNome', label: 'Hospedagem' },
  { id: 'onPremisesSites', label: 'Se on Premises, separar por SITE' },
  { id: 'formaAcessoNome', label: 'Forma de Acesso ao Sistema' },
  { id: 'integracoes', label: 'Integrações' },
  { id: 'controleAcessoPorUsuario', label: 'Controle de Acesso por Usuário?' },
  { id: 'autenticacaoAdSso', label: 'Autenticação por AD / SSO?' },
  { id: 'grauSatisfacao', label: 'Grau de Satisfação' },
  { id: 'problemasEnfrentados', label: 'Problemas Enfrentados' },
];

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
  'nome do projeto': 'nomeSistema',
  'empresa': 'empresaNome',
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
  const [listasAux, setListasAux] = useState({ fornecedores: [], areas: [], empresas: [], usuarios: [], hospedagens: [], formasAcesso: [] });
  const [busca, setBusca] = useState('');
  const inputFileRef = useRef(null);
  const { visibleIds, setVisibleIds, allColumns } = useListColumns('sistemas', COLUNAS_SISTEMAS);
  const [configColunasAberto, setConfigColunasAberto] = useState(false);

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
        empresasApi.listar(),
        usuariosApi.listar(),
        hospedagensApi.listar(),
        formasAcessoApi.listar(),
      ])
        .then(([f, a, emp, u, h, fa]) => setListasAux({ fornecedores: f, areas: a, empresas: Array.isArray(emp) ? emp : [], usuarios: u, hospedagens: h, formasAcesso: fa }))
        .catch(() => {});
    }
  }, [modalImportarAberto]);

  const handleExcluir = (id, nome) => {
    if (!window.confirm(`Excluir o sistema "${nome}"?`)) return;
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
  const buscarEmpresaPorNome = (lista, nome) => {
    if (!nome || !lista?.length) return null;
    const n = String(nome).trim().toLowerCase();
    const found = lista.find((x) => String(x.nomeFantasia || x.razaoSocial || '').trim().toLowerCase() === n);
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
      else if (key === 'empresaNome') obj.empresaId = buscarEmpresaPorNome(listas.empresas, valor) || null;
      else if (key === 'responsavelTiNome') obj.responsavelTiId = buscarPorNome(listas.usuarios, valor) || null;
      else if (key === 'usuarioNegocioNome') obj.usuarioNegocioId = buscarPorNome(listas.usuarios, valor) || null;
      else if (key === 'hospedagemNome') obj.hospedagemId = buscarPorNome(listas.hospedagens, valor) || null;
      else if (key === 'formaAcessoNome') obj.formaAcessoId = buscarPorNome(listas.formasAcesso, valor) || null;
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
      empresaId: obj.empresaId ?? null,
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

  const normalizarTexto = (str) =>
    String(str ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  const termoBusca = normalizarTexto(busca).trim();
  const listaFiltrada = termoBusca
    ? lista.filter((p) => {
        const texto =
          [
            p.nomeSistema,
            p.empresaNome,
            p.fornecedorNome,
            p.finalidadePrincipal,
            p.breveDescritivo,
            p.marcasAtendidas,
            p.areaNome,
            p.responsavelTiNome,
            p.usuarioNegocioNome,
            p.hospedagemNome,
            p.formaAcessoNome,
            p.integracoes,
            p.problemasEnfrentados,
          ].join(' ') || '';
        return normalizarTexto(texto).includes(termoBusca);
      })
    : lista;

  if (carregando) return <p className="page-loading">Carregando...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="cadastro-page cadastro-list-page produtos-software-list-page">
      <div className="page-header">
        <h1>Sistemas</h1>
        <div className="page-header-actions">
          <input
            type="search"
            className="input-busca"
            placeholder="Buscar por nome, empresa, fornecedor, área..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar"
          />
          <button type="button" className="btn btn-secondary btn-config-colunas" onClick={() => setConfigColunasAberto(true)} title="Escolher e ordenar colunas">
            ⚙ Colunas
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setModalImportarAberto(true)}>
            Importar CSV
          </button>
          <Link to="/sistemas/novo" className="btn btn-primary">Novo sistema</Link>
        </div>
      </div>
      {termoBusca && (
        <p className="busca-resultado">
          {listaFiltrada.length} de {lista.length} registro(s)
        </p>
      )}
      <div className="table-wrap">
        <table className="table table-cadastro table-produtos-software">
          <thead>
            <tr>
              {visibleIds.map((id) => (
                <th key={id}>{COLUNAS_SISTEMAS.find((c) => c.id === id)?.label}</th>
              ))}
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={visibleIds.length + 1}>Nenhum sistema cadastrado.</td>
              </tr>
            ) : listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan={visibleIds.length + 1}>Nenhum resultado para a busca.</td>
              </tr>
            ) : (
              listaFiltrada.map((p) => (
                <tr key={p.id}>
                  {visibleIds.map((id) => {
                    if (id === 'nomeSistema') return <td key={id}>{v(p.nomeSistema)}</td>;
                    if (id === 'empresaNome') return <td key={id}>{v(p.empresaNome)}</td>;
                    if (id === 'fornecedorNome') return <td key={id}>{v(p.fornecedorNome)}</td>;
                    if (id === 'finalidadePrincipal') return <td key={id}>{v(p.finalidadePrincipal)}</td>;
                    if (id === 'breveDescritivo') return <td key={id} className="td-texto" title={p.breveDescritivo}>{v(p.breveDescritivo)}</td>;
                    if (id === 'marcasAtendidas') return <td key={id}>{v(p.marcasAtendidas)}</td>;
                    if (id === 'usuariosQtd') return <td key={id} className="td-numero">{p.usuariosQtdAproximada != null ? p.usuariosQtdAproximada : '—'}</td>;
                    if (id === 'areaNome') return <td key={id}>{v(p.areaNome)}</td>;
                    if (id === 'responsavelTiNome') return <td key={id}>{v(p.responsavelTiNome)}</td>;
                    if (id === 'usuarioNegocioNome') return <td key={id}>{v(p.usuarioNegocioNome)}</td>;
                    if (id === 'hospedagemNome') return <td key={id}>{v(p.hospedagemNome)}</td>;
                    if (id === 'onPremisesSites') return <td key={id} className="td-texto">{v(p.onPremisesSites)}</td>;
                    if (id === 'formaAcessoNome') return <td key={id}>{v(p.formaAcessoNome)}</td>;
                    if (id === 'integracoes') return <td key={id} className="td-texto" title={p.integracoes}>{v(p.integracoes)}</td>;
                    if (id === 'controleAcessoPorUsuario') return <td key={id}>{simNao(p.controleAcessoPorUsuario)}</td>;
                    if (id === 'autenticacaoAdSso') return <td key={id}>{simNao(p.autenticacaoAdSso)}</td>;
                    if (id === 'grauSatisfacao') return <td key={id}>{v(p.grauSatisfacao)}</td>;
                    if (id === 'problemasEnfrentados') return <td key={id} className="td-texto" title={p.problemasEnfrentados}>{v(p.problemasEnfrentados)}</td>;
                    return null;
                  })}
                  <td className="td-acoes">
                    <AcoesListagem basePath="/sistemas" id={p.id} onExcluir={() => handleExcluir(p.id, p.nomeSistema)} excluindo={excluindo === p.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfigColunasModal open={configColunasAberto} onClose={() => setConfigColunasAberto(false)} allColumns={allColumns} visibleIds={visibleIds} onSave={setVisibleIds} />

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
            <h2 className="modal-titulo">Importar sistemas (CSV)</h2>
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
