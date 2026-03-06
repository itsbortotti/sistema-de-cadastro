const express = require('express');
const { listar, getById, criar, atualizar, remover } = require('../data/produtosSoftware');
const { getById: getFornecedorById } = require('../data/fornecedores');
const { getById: getAreaById } = require('../data/areas');
const { getById: getEmpresaById } = require('../data/empresas');
const usuariosData = require('../data/usuarios');
const pessoasData = require('../data/pessoas');
const { getById: getHospedagemById } = require('../data/hospedagens');
const { getById: getFormaAcessoById } = require('../data/formasAcesso');
const { getById: getTimeById } = require('../data/times');
const { validateIdParam } = require('../middleware/validateId');

const router = express.Router();
router.param('id', validateIdParam);

async function expandir(item) {
  const u = { ...item };
  if (item.fornecedorId) {
    const f = await getFornecedorById(item.fornecedorId);
    u.fornecedorNome = f ? f.nome : null;
  }
  if (item.empresaId) {
    const emp = await getEmpresaById(item.empresaId);
    const nome = emp && (emp.nomeFantasia || emp.razaoSocial || String(emp.id).trim());
    u.empresaNome = nome || null;
  }
  if (item.areaId) {
    const a = await getAreaById(item.areaId);
    u.areaNome = a ? a.nome : null;
  }
  if (item.responsavelTiPessoaId) {
    const r = await pessoasData.getById(item.responsavelTiPessoaId);
    u.responsavelTiNome = r ? r.nome : null;
  } else if (item.responsavelTiId) {
    const r = await usuariosData.getById(item.responsavelTiId);
    u.responsavelTiNome = r ? r.nome : null;
  }
  if (item.responsavelNegocioPessoaId) {
    const n = await pessoasData.getById(item.responsavelNegocioPessoaId);
    u.usuarioNegocioNome = n ? n.nome : null;
  } else if (item.usuarioNegocioId) {
    const n = await usuariosData.getById(item.usuarioNegocioId);
    u.usuarioNegocioNome = n ? n.nome : null;
  }
  if (item.hospedagemId) {
    const h = await getHospedagemById(item.hospedagemId);
    u.hospedagemNome = h ? h.nome : null;
  }
  if (item.formaAcessoId) {
    const fa = await getFormaAcessoById(item.formaAcessoId);
    u.formaAcessoNome = fa ? fa.nome : null;
  }
  if (item.timeId) {
    const t = await getTimeById(item.timeId);
    u.timeNome = t ? t.nome : null;
  }
  u.marcasAtendidasNomes = (item.marcasAtendidas || []).map((m) => m.nome).join(', ') || null;
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
router.get(['/', ''], async (req, res, next) => {
  try {
    const lista = await listar();
    const expanded = await Promise.all(lista.map(expandir));
    res.json(expanded);
  } catch (err) {
    next(err);
  }
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
router.get('/:id', async (req, res, next) => {
  try {
    const item = await getById(req.params.id);
    if (!item) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(await expandir(item));
  } catch (err) {
    next(err);
  }
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
 *               tiMe: { type: string, enum: [tolerar, investir, migrar, eliminar], description: "TI ME: Tolerar, Investir, Migrar, Eliminar" }
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
 *               tiMe: { type: string, enum: [tolerar, investir, migrar, eliminar], description: "TI ME: Tolerar, Investir, Migrar, Eliminar" }
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
router.delete('/:id', async (req, res, next) => {
  try {
    if (!(await remover(req.params.id))) return res.status(404).json({ erro: 'Não encontrado' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const item = await criar(req.body || {});
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
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
router.post('/bulk', async (req, res, next) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const erros = [];
    let criados = 0;
    for (let idx = 0; idx < items.length; idx++) {
      try {
        await criar(items[idx] || {});
        criados++;
      } catch (e) {
        erros.push(`Linha ${idx + 1}: ${e.message || 'Erro ao criar'}`);
      }
    }
    res.json({ criados, erros });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const item = await atualizar(req.params.id, req.body || {});
    if (!item) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(await expandir(item));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
