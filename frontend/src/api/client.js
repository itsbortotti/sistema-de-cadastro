const API = '/api';

const defaultOptions = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};

/** Mensagens padrão para o usuário (ui-guidelines — Tratamento de Erros) */
const MENSAGENS_ERRO = {
  401: 'Sua sessão expirou. Faça login novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'O registro solicitado não foi encontrado.',
  500: 'Ocorreu um erro inesperado. Tente novamente.',
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
export const produtosSoftwareApi = {
  ...crudApi('produtos-software'),
  importarBulk: (items) => api('/produtos-software/bulk', { method: 'POST', body: JSON.stringify({ items }) }),
};
export const capexApi = crudApi('capex');
export const empresasApi = crudApi('empresas');
export const projetosApi = crudApi('projetos');

export const permissoesApi = {
  listar: () => api('/permissoes'),
  listarMe: () => api('/permissoes/me'),
  salvar: (regras) => api('/permissoes', { method: 'PUT', body: JSON.stringify(regras) }),
  tipos: () => api('/permissoes/tipos'),
  entidades: () => api('/permissoes/entidades'),
};
