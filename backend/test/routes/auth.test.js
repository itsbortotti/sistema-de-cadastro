const request = require('supertest');
const express = require('express');

const mockGetByLogin = jest.fn();
const mockRegistrarLog = jest.fn().mockResolvedValue(undefined);

jest.mock('../../data/usuarios', () => ({
  getByLogin: (...args) => mockGetByLogin(...args),
  getById: jest.fn(),
}));
jest.mock('../../lib/logHelper', () => ({
  registrarLog: (...args) => mockRegistrarLog(...args),
}));

jest.mock('bcryptjs', () => ({
  compareSync: jest.fn((senha, hash) => senha === 'admin' && hash === 'hash-admin'),
}));

const authRoutes = require('../../routes/auth');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.session = {};
    next();
  });
  app.use('/api/auth', authRoutes);
  return app;
}

describe('routes/auth', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
  });

  describe('POST /api/auth/login', () => {
    it('retorna 400 quando login ou senha estão vazios', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: '', senha: 'x' });
      expect(res.status).toBe(400);
      expect(res.body.erro).toMatch(/obrigatório/);

      const res2 = await request(app)
        .post('/api/auth/login')
        .send({});
      expect(res2.status).toBe(400);
    });

    it('retorna 401 quando credenciais inválidas', async () => {
      mockGetByLogin.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: 'admin', senha: 'wrong' });
      expect(res.status).toBe(401);
      expect(res.body.erro).toMatch(/inválidos/);
    });

    it('retorna 200 e usuario na sessão quando login ok', async () => {
      mockGetByLogin.mockResolvedValue({
        id: 'u1',
        nome: 'Admin',
        login: 'admin',
        perfilId: 'p1',
        perfil: { nome: 'Administrador' },
        senhaHash: 'hash-admin',
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ login: 'admin', senha: 'admin' });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.usuario).toBeDefined();
      expect(res.body.usuario.login).toBe('admin');
      expect(res.body.usuario.tipo).toBe('admin');
    });
  });
});
