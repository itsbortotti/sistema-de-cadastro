const express = require('express');
const bcrypt = require('bcryptjs');
const { getUsuarios, getById } = require('../data/usuarios');

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login do usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [login, senha]
 *             properties:
 *               login: { type: string, example: "admin" }
 *               senha: { type: string, example: "admin" }
 *     responses:
 *       200: { description: Login realizado com sucesso }
 *       401: { description: Credenciais inválidas }
 */
router.post('/login', (req, res) => {
  const { login, senha } = req.body || {};
  if (!login || !senha) {
    return res.status(400).json({ erro: 'Login e senha são obrigatórios' });
  }
  const usuarios = getUsuarios();
  const usuario = usuarios.find(u => u.login === login);
  if (!usuario || !bcrypt.compareSync(senha, usuario.senhaHash)) {
    return res.status(401).json({ erro: 'Login ou senha inválidos' });
  }
  req.session.usuario = {
    id: usuario.id,
    nome: usuario.nome,
    login: usuario.login,
    tipo: usuario.tipo || 'membro',
  };
  return res.json({ ok: true, usuario: req.session.usuario });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Encerra a sessão do usuário
 *     tags: [Autenticação]
 *     responses:
 *       200: { description: Logout realizado }
 */
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

/**
 * @swagger
 * /api/auth/sessao:
 *   get:
 *     summary: Retorna o usuário da sessão atual
 *     tags: [Autenticação]
 *     responses:
 *       200: { description: Usuário logado }
 *       401: { description: Não autenticado }
 */
router.get('/sessao', (req, res) => {
  if (!req.session?.usuario) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }
  const u = getById(req.session.usuario.id);
  if (!u) {
    req.session.destroy();
    return res.status(401).json({ erro: 'Usuário não encontrado' });
  }
  const usuario = {
    id: u.id,
    nome: u.nome,
    login: u.login,
    tipo: u.tipo || 'membro',
  };
  req.session.usuario = usuario;
  res.json(usuario);
});

module.exports = router;
