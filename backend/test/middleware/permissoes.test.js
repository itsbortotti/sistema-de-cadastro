const mockGetById = jest.fn();
const mockPode = jest.fn();

jest.mock('../../data/usuarios', () => ({
  getById: (...args) => mockGetById(...args),
}));
jest.mock('../../data/permissoes', () => ({
  pode: (...args) => mockPode(...args),
}));

const { requireAuth, requirePermissao, requirePermissaoPorMetodo } = require('../../middleware/permissoes');

describe('middleware/permissoes', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { session: { usuario: { id: 'u1' } } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe('requireAuth', () => {
    it('chama next quando há sessão com usuario', () => {
      requireAuth(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('retorna 401 quando não há sessão', () => {
      req.session = null;
      requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Não autenticado' });
      expect(next).not.toHaveBeenCalled();
    });

    it('retorna 401 quando session.usuario não existe', () => {
      req.session = {};
      requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('requirePermissao', () => {
    it('chama next quando usuário tem permissão', async () => {
      mockGetById.mockResolvedValue({ perfilId: 'p1' });
      mockPode.mockResolvedValue(true);
      const mw = requirePermissao('usuarios', 'visualizar');
      await mw(req, res, next);
      expect(mockPode).toHaveBeenCalledWith('p1', 'usuarios', 'visualizar');
      expect(next).toHaveBeenCalled();
    });

    it('retorna 403 quando usuário não tem permissão', async () => {
      mockGetById.mockResolvedValue({ perfilId: 'p1' });
      mockPode.mockResolvedValue(false);
      const mw = requirePermissao('usuarios', 'editar');
      await mw(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ erro: expect.any(String) }));
    });
  });

  describe('requirePermissaoPorMetodo', () => {
    it('mapeia POST para acao criar', async () => {
      mockGetById.mockResolvedValue({ perfilId: 'p1' });
      mockPode.mockResolvedValue(true);
      req.method = 'POST';
      const mw = requirePermissaoPorMetodo('perfis');
      await mw(req, res, next);
      expect(mockPode).toHaveBeenCalledWith('p1', 'perfis', 'criar');
      expect(next).toHaveBeenCalled();
    });

    it('mapeia PUT para acao editar', async () => {
      mockGetById.mockResolvedValue({ perfilId: 'p1' });
      mockPode.mockResolvedValue(true);
      req.method = 'PUT';
      const mw = requirePermissaoPorMetodo('usuarios');
      await mw(req, res, next);
      expect(mockPode).toHaveBeenCalledWith('p1', 'usuarios', 'editar');
    });

    it('mapeia DELETE para acao excluir', async () => {
      mockGetById.mockResolvedValue({ perfilId: 'p1' });
      mockPode.mockResolvedValue(true);
      req.method = 'DELETE';
      const mw = requirePermissaoPorMetodo('usuarios');
      await mw(req, res, next);
      expect(mockPode).toHaveBeenCalledWith('p1', 'usuarios', 'excluir');
    });
  });
});
