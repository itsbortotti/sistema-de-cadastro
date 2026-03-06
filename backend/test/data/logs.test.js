const mockFindMany = jest.fn();
const mockCreate = jest.fn();

jest.mock('../../lib/prisma', () => ({
  prisma: {
    log: {
      findMany: (...args) => mockFindMany(...args),
      create: (...args) => mockCreate(...args),
    },
  },
}));

const { listar, criar } = require('../../data/logs');

describe('data/logs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listar', () => {
    it('retorna lista de logs mapeados com usuarioNome', async () => {
      mockFindMany.mockResolvedValue([
        {
          id: '1',
          tipo: 'login',
          descricao: 'Login: admin',
          createdAt: new Date('2025-03-05T12:00:00Z'),
          usuarioId: 'u1',
          usuario: { id: 'u1', nome: 'Admin', login: 'admin' },
        },
      ]);
      const result = await listar({ limite: 10 });
      expect(mockFindMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].tipo).toBe('login');
      expect(result[0].usuarioNome).toBe('Admin');
    });

    it('aplica filtro tipo quando passado', async () => {
      mockFindMany.mockResolvedValue([]);
      await listar({ tipo: 'edicao' });
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tipo: 'edicao' } })
      );
    });
  });

  describe('criar', () => {
    it('cria log com tipo, descricao e usuarioId', async () => {
      mockCreate.mockResolvedValue({
        id: 'log-1',
        tipo: 'login',
        descricao: 'Login: admin',
        usuarioId: 'u1',
        createdAt: new Date(),
      });
      const result = await criar({ tipo: 'login', descricao: 'Login: admin', usuarioId: 'u1' });
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          tipo: 'login',
          descricao: 'Login: admin',
          usuarioId: 'u1',
        },
      });
      expect(result.tipo).toBe('login');
    });

    it('usa tipo edicao e descricao vazia quando omitidos', async () => {
      mockCreate.mockResolvedValue({ id: '1', tipo: 'edicao', descricao: '', usuarioId: null });
      await criar({});
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          tipo: 'edicao',
          descricao: '',
          usuarioId: null,
        },
      });
    });
  });
});
