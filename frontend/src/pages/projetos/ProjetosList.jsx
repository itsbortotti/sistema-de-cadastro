import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { projetosApi, empresasApi, produtosSoftwareApi } from '../../api/client';
import AcoesListagem from '../../components/AcoesListagem';
import ConfigColunasModal from '../../components/ConfigColunasModal';
import { useListColumns } from '../../hooks/useListColumns';
import { usePermissoes } from '../../context/PermissoesContext';
import '../usuarios/Usuarios.css';
import '../CadastroListLayout.css';

const COLUNAS_PROJETOS = [
  { id: 'nome', label: 'Nome' },
  { id: 'sistemas', label: 'Sistemas' },
  { id: 'empresa', label: 'Empresa' },
  { id: 'status', label: 'Status' },
  { id: 'dataInicio', label: 'Data início' },
  { id: 'dataFim', label: 'Data fim' },
  { id: 'descricao', label: 'Descrição' },
];

function v(val) {
  return val != null && String(val).trim() !== '' ? String(val).trim() : '—';
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

function normalizarTexto(str) {
  return String(str ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

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

const MAPEAMENTO_CSV = {
  'nome': 'nome',
  'nome do projeto': 'nome',
  'projeto': 'nome',
  'descricao': 'descricao',
  'descrição': 'descricao',
  'empresa': 'empresaNome',
  'sistemas': 'sistemas',
  'sistema': 'sistemas',
  'data inicio': 'dataInicio',
  'data início': 'dataInicio',
  'periodo inicial': 'dataInicio',
  'período inicial': 'dataInicio',
  'data fim': 'dataFim',
  'periodo final': 'dataFim',
  'período final': 'dataFim',
  'status': 'status',
  'observacoes': 'observacoes',
  'observações': 'observacoes',
};

function normalizarHeader(h) {
  return String(h || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export default function ProjetosList() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(null);
  const [busca, setBusca] = useState('');
  const [modalImportarAberto, setModalImportarAberto] = useState(false);
  const [arquivoPreview, setArquivoPreview] = useState(null);
  const [importando, setImportando] = useState(false);
  const [resultadoImportacao, setResultadoImportacao] = useState(null);
  const [listasAux, setListasAux] = useState({ empresas: [], produtosSoftware: [] });
  const inputFileRef = useRef(null);
  const { visibleIds, setVisibleIds, allColumns } = useListColumns('projetos', COLUNAS_PROJETOS);
  const [configColunasAberto, setConfigColunasAberto] = useState(false);
  const { can } = usePermissoes();

  const carregar = () => {
    setCarregando(true);
    setErro('');
    projetosApi.listar().then(setLista).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  };
  useEffect(() => carregar(), []);

  useEffect(() => {
    if (modalImportarAberto) {
      Promise.allSettled([empresasApi.listar(), produtosSoftwareApi.listar()]).then(([rEmp, rSist]) => {
        const empresas = rEmp.status === 'fulfilled' && Array.isArray(rEmp.value) ? rEmp.value : [];
        const produtosSoftware = rSist.status === 'fulfilled' && Array.isArray(rSist.value) ? rSist.value : [];
        setListasAux({ empresas, produtosSoftware });
      });
    }
  }, [modalImportarAberto]);

  const handleExcluir = (id, nome) => {
    if (!window.confirm(`Excluir o projeto "${nome || 'sem nome'}"?`)) return;
    setExcluindo(id);
    projetosApi.remover(id).then(carregar).catch((e) => setErro(e.message)).finally(() => setExcluindo(null));
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

  const buscarEmpresaPorNome = (listaEmpresas, nome) => {
    if (!nome || !listaEmpresas?.length) return null;
    const n = String(nome).trim().toLowerCase();
    const found = listaEmpresas.find(
      (x) =>
        String(x.nomeFantasia || '').trim().toLowerCase() === n ||
        String(x.razaoSocial || '').trim().toLowerCase() === n
    );
    return found ? found.id : null;
  };

  /** Resolve string "Sistema A; Sistema B" ou "Sistema A, Sistema B" para array de IDs por nomeSistema */
  const resolverSistemasPorNomes = (listaSistemas, texto) => {
    if (!texto || !listaSistemas?.length) return [];
    const nomes = String(texto)
      .split(/[,;]/)
      .map((s) => String(s).trim())
      .filter(Boolean);
    const ids = [];
    const lower = (s) => String(s ?? '').toLowerCase();
    for (const nome of nomes) {
      const n = lower(nome);
      const found = listaSistemas.find((s) => lower(s.nomeSistema) === n);
      if (found) ids.push(found.id);
    }
    return ids;
  };

  const processarLinhaParaPayload = (headers, valores, listas) => {
    const obj = {};
    headers.forEach((h, i) => {
      const key = MAPEAMENTO_CSV[normalizarHeader(h)];
      if (!key) return;
      const valor = valores[i] != null ? String(valores[i]).trim() : '';
      if (key === 'empresaNome') obj.empresaId = buscarEmpresaPorNome(listas.empresas, valor) || null;
      else if (key === 'sistemas') obj.produtoSoftwareIds = resolverSistemasPorNomes(listas.produtosSoftware, valor);
      else if (key === 'dataInicio') obj.dataInicio = valor === '' ? null : valor;
      else if (key === 'dataFim') obj.dataFim = valor === '' ? null : valor;
      else obj[key] = valor;
    });
    return {
      nome: obj.nome || '',
      descricao: obj.descricao || '',
      empresaId: obj.empresaId ?? null,
      produtoSoftwareIds: Array.isArray(obj.produtoSoftwareIds) ? obj.produtoSoftwareIds : [],
      dataInicio: obj.dataInicio ?? null,
      dataFim: obj.dataFim ?? null,
      status: obj.status || '',
      observacoes: obj.observacoes || '',
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
      const resultado = await projetosApi.importarBulk(items);
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

  const termoBusca = normalizarTexto(busca).trim();
  const listaFiltrada = termoBusca
    ? lista.filter((item) => {
        const sistemaStr = (item.sistemaNomes || []).join(' ');
        const texto = [item.nome, item.empresaNome, item.status, item.descricao, sistemaStr].join(' ');
        return normalizarTexto(texto).includes(termoBusca);
      })
    : lista;

  if (carregando) return <p className="page-loading">Carregando...</p>;
  if (erro) return <p className="erro-msg">{erro}</p>;

  return (
    <div className="cadastro-page cadastro-list-page">
      <div className="page-header">
        <div className="page-header-actions">
          <input
            type="search"
            className="input-busca"
            placeholder="Buscar por nome, empresa, status, sistema..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar"
          />
          <button type="button" className="btn btn-secondary btn-config-colunas" onClick={() => setConfigColunasAberto(true)} title="Escolher e ordenar colunas">⚙ Colunas</button>
          {can('projetos', 'criar') && (
            <button type="button" className="btn btn-outline" onClick={() => setModalImportarAberto(true)}>
              Importar CSV
            </button>
          )}
          <Link to="/projetos/novo" className="btn btn-primary">Novo projeto</Link>
        </div>
      </div>
      {termoBusca && (
        <p className="busca-resultado">
          {listaFiltrada.length} de {lista.length} registro(s)
        </p>
      )}
      <div className="table-wrap">
        <table className="table table-cadastro">
          <thead>
            <tr>
              {visibleIds.map((id) => (
                <th key={id}>{COLUNAS_PROJETOS.find((c) => c.id === id)?.label}</th>
              ))}
              <th className="th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr><td colSpan={visibleIds.length + 1}>{lista.length === 0 ? 'Nenhum projeto cadastrado.' : 'Nenhum resultado para a busca.'}</td></tr>
            ) : (
              listaFiltrada.map((item) => (
                <tr key={item.id}>
                  {visibleIds.map((id) => {
                    if (id === 'nome') return <td key={id} className="td-texto" title={item.nome}>{v(item.nome)}</td>;
                    if (id === 'sistemas') return <td key={id} className="td-texto" title={(item.sistemaNomes || []).join(', ')}>{(item.sistemaNomes && item.sistemaNomes.length > 0) ? item.sistemaNomes.join(', ') : '—'}</td>;
                    if (id === 'empresa') return <td key={id}>{v(item.empresaNome)}</td>;
                    if (id === 'status') return <td key={id}>{v(item.status)}</td>;
                    if (id === 'dataInicio') return <td key={id}>{formatarData(item.dataInicio)}</td>;
                    if (id === 'dataFim') return <td key={id}>{formatarData(item.dataFim)}</td>;
                    if (id === 'descricao') return <td key={id} className="td-texto" title={item.descricao}>{v(item.descricao)}</td>;
                    return null;
                  })}
                  <td className="td-acoes">
                    <AcoesListagem basePath="/projetos" id={item.id} onExcluir={() => handleExcluir(item.id, item.nome)} excluindo={excluindo === item.id} />
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
            <h2 className="modal-titulo">Importar projetos (CSV)</h2>
            <p className="modal-desc">
              Selecione um arquivo CSV com a primeira linha contendo os nomes das colunas. Use vírgula ou ponto e vírgula como separador.
              Coluna <strong>Nome</strong> e <strong>Sistemas</strong> são obrigatórias. Em Sistemas, use vírgula ou ponto e vírgula para separar os nomes dos sistemas.
            </p>
            <p className="modal-desc">
              <a href="/exemplo-projetos.csv" download className="link-download">Baixar CSV de exemplo</a>
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
