const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();

jest.mock('../../lib/prisma', () => ({
  prisma: {
    permissao: {
      findMany: (...args) => mockFindMany(...args),
      findUnique: (...args) => mockFindUnique(...args),
    },
  },
}));

const { getPorPerfilId, getPermissao, pode, ENTIDADES } = require('../../data/permissoes');

describe('data/permissoes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ENTIDADES', () => {
    it('inclui entidades esperadas', () => {
      expect(ENTIDADES).toContain('usuarios');
      expect(ENTIDADES).toContain('perfis');
      expect(ENTIDADES).toContain('logs');
      expect(ENTIDADES).toContain('dashboard');
      expect(Array.isArray(ENTIDADES)).toBe(true);
    });
  });

  describe('getPorPerfilId', () => {
    it('retorna lista de permissões mapeadas', async () => {
      mockFindMany.mockResolvedValue([
        { entidade: 'usuarios', visualizar: true, editar: true, criar: true, excluir: false },
      ]);
      const result = await getPorPerfilId('perfil-1');
      expect(mockFindMany).toHaveBeenCalledWith({ where: { perfilId: 'perfil-1' } });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ entidade: 'usuarios', visualizar: true, editar: true, criar: true, excluir: false });
    });
  });

  describe('getPermissao', () => {
    it('retorna permissão quando existe no banco', async () => {
      mockFindUnique.mockResolvedValue({
        entidade: 'usuarios',
        visualizar: true,
        editar: true,
        criar: false,
        excluir: false,
      });
      const result = await getPermissao('perfil-1', 'usuarios');
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { perfilId_entidade: { perfilId: 'perfil-1', entidade: 'usuarios' } },
      });
      expect(result.visualizar).toBe(true);
      expect(result.editar).toBe(true);
    });

    it('retorna padrão sem permissão quando não existe', async () => {
      mockFindUnique.mockResolvedValue(null);
      const result = await getPermissao('perfil-1', 'usuarios');
      expect(result).toEqual({ entidade: 'usuarios', visualizar: false, editar: false, criar: false, excluir: false });
    });
  });

  describe('pode', () => {
    it('retorna true quando a ação é permitida', async () => {
      mockFindUnique.mockResolvedValue({ entidade: 'usuarios', visualizar: true, editar: true, criar: false, excluir: false });
      await expect(pode('perfil-1', 'usuarios', 'visualizar')).resolves.toBe(true);
      await expect(pode('perfil-1', 'usuarios', 'editar')).resolves.toBe(true);
    });

    it('retorna false quando a ação não é permitida', async () => {
      mockFindUnique.mockResolvedValue({ entidade: 'usuarios', visualizar: true, editar: false, criar: false, excluir: false });
      await expect(pode('perfil-1', 'usuarios', 'excluir')).resolves.toBe(false);
    });
  });
});
