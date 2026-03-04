import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from './client';

describe('api client', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('lança erro com mensagem padrão 401 (sessão expirada)', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    });
    await expect(api('/auth/sessao')).rejects.toThrow('Sua sessão expirou. Faça login novamente.');
  });

  it('lança erro com mensagem padrão 403 (sem permissão)', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ erro: 'Outro texto' }),
    });
    await expect(api('/usuarios')).rejects.toThrow('Você não tem permissão para realizar esta ação.');
  });

  it('lança erro com mensagem padrão 404 (não encontrado)', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({}),
    });
    await expect(api('/usuarios/999')).rejects.toThrow('O registro solicitado não foi encontrado.');
  });

  it('lança erro com mensagem padrão 500', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });
    await expect(api('/qualquer')).rejects.toThrow('Ocorreu um erro inesperado. Tente novamente.');
  });

  it('lança erro de rede quando fetch falha', async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error('Network error'));
    await expect(api('/usuarios')).rejects.toThrow('Não foi possível conectar ao servidor. Verifique sua conexão.');
  });

  it('retorna dados quando res.ok é true', async () => {
    const dados = { id: '1', nome: 'Teste' };
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(dados),
    });
    const resultado = await api('/usuarios/1');
    expect(resultado).toEqual(dados);
  });
});
