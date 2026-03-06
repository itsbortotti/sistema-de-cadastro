const API = '/api';

const defaultOptions = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};

/** Mensagens padrão para o usuário (docs/PADRAO-PROJETO-IA.md — Tratamento de Erros) */
const MENSAGENS_ERRO = {
  401: 'Sua sessão expirou. Faça login novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'O registro solicitado não foi encontrado.',
  500: 'Ocorreu um erro inesperado. Tente novamente.',
  503: 'Serviço temporariamente indisponível. Tente novamente em instantes.',
  network: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
};

export async function api(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API}${path}`, { ...defaultOptions, ...options });
  } catch (_e) {
    throw new Error(MENSAGENS_ERRO.network);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = MENSAGENS_ERRO[res.status] || data.erro || `Erro ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const usuariosApi = {
  listar: () => api('/usuarios'),
  buscar: (id) => api(`/usuarios/${id}`),
  criar: (body) => api('/usuarios', { method: 'POST', body: JSON.stringify(body) }),
  atualizar: (id, body) => api(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remover: (id) => api(`/usuarios/${id}`, { method: 'DELETE' }),
};

function crudApi(base) {
  return {
    listar: () => api(`/${base}`),
    buscar: (id) => api(`/${base}/${id}`),
    criar: (body) => api(`/${base}`, { method: 'POST', body: JSON.stringify(body) }),
    atualizar: (id, body) => api(`/${base}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remover: (id) => api(`/${base}/${id}`, { method: 'DELETE' }),
  };
}

export const fornecedoresApi = crudApi('fornecedores');
export const areasApi = crudApi('areas');
export const hospedagensApi = crudApi('hospedagens');
export const formasAcessoApi = crudApi('formas-acesso');
export const timesApi = crudApi('times');
export const marcasAtendidasApi = crudApi('marcas-atendidas');
export const pessoasApi = crudApi('pessoas');
export const produtosSoftwareApi = {
  ...crudApi('produtos-software'),
  importarBulk: (items) => api('/produtos-software/bulk', { method: 'POST', body: JSON.stringify({ items }) }),
};
export const capexApi = crudApi('capex');
export const empresasApi = crudApi('empresas');
export const projetosApi = {
  ...crudApi('projetos'),
  importarBulk: (items) => api('/projetos/bulk', { method: 'POST', body: JSON.stringify({ items }) }),
};

export const permissoesApi = {
  listarMe: () => api('/permissoes/me'),
};

export const perfisApi = {
  listar: () => api('/perfis'),
  buscar: (id) => api(`/perfis/${id}`),
  criar: (body) => api('/perfis', { method: 'POST', body: JSON.stringify(body) }),
  atualizar: (id, body) => api(`/perfis/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remover: (id) => api(`/perfis/${id}`, { method: 'DELETE' }),
  entidades: () => api('/perfis/entidades'),
};

export const logsApi = {
  listar: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return api(`/logs${q ? `?${q}` : ''}`);
  },
};

export const configuracoesApi = {
  getCustomAssets: () => api('/configuracoes/custom-assets'),
  saveLogo: (dataUrl) => api('/configuracoes/logo', { method: 'POST', body: JSON.stringify({ logo: dataUrl }) }),
  removeLogo: () => api('/configuracoes/logo', { method: 'DELETE' }),
  saveFavicon: (dataUrl) => api('/configuracoes/favicon', { method: 'POST', body: JSON.stringify({ favicon: dataUrl }) }),
  removeFavicon: () => api('/configuracoes/favicon', { method: 'DELETE' }),
};
