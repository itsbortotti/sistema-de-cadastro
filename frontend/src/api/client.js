const API = '/api';

const defaultOptions = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};

export async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, { ...defaultOptions, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || `Erro ${res.status}`);
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

export const permissoesApi = {
  listar: () => api('/permissoes'),
  listarMe: () => api('/permissoes/me'),
  salvar: (regras) => api('/permissoes', { method: 'PUT', body: JSON.stringify(regras) }),
  tipos: () => api('/permissoes/tipos'),
  entidades: () => api('/permissoes/entidades'),
};
