const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/produtosSoftware');
const { getById: getFornecedorById } = require('../data/fornecedores');
const { getById: getAreaById } = require('../data/areas');
const { getById: getEmpresaById } = require('../data/empresas');
const usuariosData = require('../data/usuarios');
const { getById: getHospedagemById } = require('../data/hospedagens');
const { getById: getFormaAcessoById } = require('../data/formasAcesso');
const { getById: getTimeById } = require('../data/times');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session?.usuario) return res.status(401).json({ erro: 'Não autenticado' });
  next();
}
router.use(requireAuth);

function expandir(item) {
  const u = { ...item };
  if (item.fornecedorId) {
    const f = getFornecedorById(item.fornecedorId);
    u.fornecedorNome = f ? f.nome : null;
  }
  if (item.empresaId) {
    const emp = getEmpresaById(item.empresaId);
    u.empresaNome = emp ? (emp.nomeFantasia || emp.razaoSocial || emp.id) : null;
  }
  if (item.areaId) {
    const a = getAreaById(item.areaId);
    u.areaNome = a ? a.nome : null;
  }
  if (item.responsavelTiId) {
    const r = usuariosData.getById(item.responsavelTiId);
    u.responsavelTiNome = r ? r.nome : null;
  }
  if (item.usuarioNegocioId) {
    const n = usuariosData.getById(item.usuarioNegocioId);
    u.usuarioNegocioNome = n ? n.nome : null;
  }
  if (item.hospedagemId) {
    const h = getHospedagemById(item.hospedagemId);
    u.hospedagemNome = h ? h.nome : null;
  }
  if (item.formaAcessoId) {
    const fa = getFormaAcessoById(item.formaAcessoId);
    u.formaAcessoNome = fa ? fa.nome : null;
  }
  if (item.timeId) {
    const t = getTimeById(item.timeId);
    u.timeNome = t ? t.nome : null;
  }
  return u;
}

/**
 * @swagger
 * /api/produtos-software:
 *   get:
 *     summary: Lista todos os produtos de software
 *     tags: [Produtos de Software]
 *     responses:
 *       200: { description: Lista de produtos (com nomes dos relacionamentos expandidos) }
 */
router.get(['/', ''], (req, res) => {
  const lista = listar().map(expandir);
  res.json(lista);
});

/**
 * @swagger
 * /api/produtos-software/{id}:
 *   get:
 *     summary: Busca produto de software por ID
 *     tags: [Produtos de Software]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Produto encontrado (com nomes expandidos) }
 *       404: { description: Não encontrado }
 */
router.get('/:id', (req, res) => {
  const item = getById(req.params.id);
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(expandir(item));
});

/**
 * @swagger
 * /api/produtos-software:
 *   post:
 *     summary: Cria um novo produto de software
 *     tags: [Produtos de Software]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomeSistema: { type: string }
 *               fornecedorId: { type: string }
 *               finalidadePrincipal: { type: string }
 *               breveDescritivo: { type: string }
 *               marcasAtendidas: { type: string }
 *               usuariosQtdAproximada: { type: number }
 *               areaId: { type: string }
 *               responsavelTiId: { type: string }
 *               usuarioNegocioId: { type: string }
 *               hospedagemId: { type: string }
 *               onPremisesSites: { type: string }
 *               formaAcessoId: { type: string }
 *               integracoes: { type: string }
 *               controleAcessoPorUsuario: { type: boolean }
 *               autenticacaoAdSso: { type: boolean }
 *               grauSatisfacao: { type: string }
 *               problemasEnfrentados: { type: string }
 *               custoMensalSistema: { type: number }
 *               custoMensalInfraestrutura: { type: number }
 *               timeId: { type: string }
 *     responses:
 *       201: { description: Produto criado }
 */
/**
 * @swagger
 * /api/produtos-software/{id}:
 *   put:
 *     summary: Atualiza um produto de software
 *     tags: [Produtos de Software]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomeSistema: { type: string }
 *               fornecedorId: { type: string }
 *               finalidadePrincipal: { type: string }
 *               breveDescritivo: { type: string }
 *               marcasAtendidas: { type: string }
 *               usuariosQtdAproximada: { type: number }
 *               areaId: { type: string }
 *               responsavelTiId: { type: string }
 *               usuarioNegocioId: { type: string }
 *               hospedagemId: { type: string }
 *               onPremisesSites: { type: string }
 *               formaAcessoId: { type: string }
 *               integracoes: { type: string }
 *               controleAcessoPorUsuario: { type: boolean }
 *               autenticacaoAdSso: { type: boolean }
 *               grauSatisfacao: { type: string }
 *               problemasEnfrentados: { type: string }
 *               custoMensalSistema: { type: number }
 *               custoMensalInfraestrutura: { type: number }
 *               timeId: { type: string }
 *     responses:
 *       200: { description: Produto atualizado }
 *       404: { description: Não encontrado }
 */
/**
 * @swagger
 * /api/produtos-software/{id}:
 *   delete:
 *     summary: Remove um produto de software
 *     tags: [Produtos de Software]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Produto removido }
 *       404: { description: Não encontrado }
 */
router.delete('/:id', (req, res) => {
  if (!remover(req.params.id)) return res.status(404).json({ erro: 'Não encontrado' });
  res.json({ ok: true });
});

router.post('/', (req, res) => {
  const item = criar(req.body || {});
  res.status(201).json(item);
});

/**
 * @swagger
 * /api/produtos-software/bulk:
 *   post:
 *     summary: Cria vários produtos de software em massa
 *     tags: [Produtos de Software]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items: { type: array, items: { type: object } }
 *     responses:
 *       200: { description: "Bulk create result: criados (number), erros (array)" }
 */
router.post('/bulk', (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const erros = [];
  let criados = 0;
  items.forEach((dados, idx) => {
    try {
      criar(dados || {});
      criados++;
    } catch (e) {
      erros.push(`Linha ${idx + 1}: ${e.message || 'Erro ao criar'}`);
    }
  });
  res.json({ criados, erros });
});

router.put('/:id', (req, res) => {
  const item = atualizar(req.params.id, req.body || {});
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(item);
});

module.exports = router;
