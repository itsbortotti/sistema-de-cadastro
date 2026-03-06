const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

const FRONTEND_DIR = path.join(__dirname, '..', '..', 'frontend');
const PUBLIC_DIR = path.join(FRONTEND_DIR, 'public');
const ASSETS_IMAGES_DIR = path.join(FRONTEND_DIR, 'assets', 'images');

const LOGO_HEADER_PUBLIC = path.join(PUBLIC_DIR, 'logo_header.png');
const LOGO_PRINCIPAL_ASSET = path.join(ASSETS_IMAGES_DIR, 'logo_principal_branco.png');
const FAVICON_PUBLIC = path.join(PUBLIC_DIR, 'favicon.ico');

function parseDataUrl(dataUrl) {
  const match = dataUrl && dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mime: match[1], base64: match[2] };
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * @swagger
 * /api/configuracoes/custom-assets:
 *   get:
 *     summary: Verifica se existem logo e favicon customizados no servidor
 *     tags: [Configuracoes]
 *     responses:
 *       200: { description: { logo: boolean, favicon: boolean } }
 */
router.get('/custom-assets', async (_req, res, next) => {
  try {
    const [logoExists, faviconExists] = await Promise.all([
      fs.access(LOGO_HEADER_PUBLIC).then(() => true).catch(() => false),
      fs.access(FAVICON_PUBLIC).then(() => true).catch(() => false),
    ]);
    res.json({ logo: logoExists, favicon: faviconExists });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/configuracoes/logo:
 *   post:
 *     summary: Salva a logo do header (substitui arquivos em public e assets)
 *     tags: [Configuracoes]
 *     requestBody: { content: { application/json: { schema: { type: object, properties: { logo: { type: string, description: 'data URL da imagem' } } } } } }
 *     responses:
 *       200: { description: Logo salva }
 *       400: { description: Dados inválidos }
 */
router.post('/logo', async (req, res, next) => {
  try {
    const { logo: dataUrl } = req.body || {};
    const parsed = parseDataUrl(dataUrl);
    if (!parsed || !parsed.base64) {
      return res.status(400).json({ erro: 'Envie a logo em data URL (ex.: data:image/png;base64,...)' });
    }
    const buf = Buffer.from(parsed.base64, 'base64');
    await ensureDir(PUBLIC_DIR);
    await fs.writeFile(LOGO_HEADER_PUBLIC, buf);
    try {
      await ensureDir(ASSETS_IMAGES_DIR);
      await fs.writeFile(LOGO_PRINCIPAL_ASSET, buf);
    } catch (e) {
      console.warn('Não foi possível salvar em assets/images:', e.message);
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/configuracoes/logo:
 *   delete:
 *     summary: Remove a logo customizada (restaura padrão)
 *     tags: [Configuracoes]
 *     responses:
 *       200: { description: Logo removida }
 */
router.delete('/logo', async (_req, res, next) => {
  try {
    await fs.unlink(LOGO_HEADER_PUBLIC).catch(() => {});
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/configuracoes/favicon:
 *   post:
 *     summary: Salva o favicon (substitui em public)
 *     tags: [Configuracoes]
 *     requestBody: { content: { application/json: { schema: { type: object, properties: { favicon: { type: string } } } } } }
 *     responses:
 *       200: { description: Favicon salvo }
 *       400: { description: Dados inválidos }
 */
router.post('/favicon', async (req, res, next) => {
  try {
    const { favicon: dataUrl } = req.body || {};
    const parsed = parseDataUrl(dataUrl);
    if (!parsed || !parsed.base64) {
      return res.status(400).json({ erro: 'Envie o favicon em data URL' });
    }
    const buf = Buffer.from(parsed.base64, 'base64');
    await ensureDir(PUBLIC_DIR);
    await fs.writeFile(FAVICON_PUBLIC, buf);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/configuracoes/favicon:
 *   delete:
 *     summary: Remove o favicon customizado
 *     tags: [Configuracoes]
 *     responses:
 *       200: { description: Favicon removido }
 */
router.delete('/favicon', async (_req, res, next) => {
  try {
    await fs.unlink(FAVICON_PUBLIC).catch(() => {});
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
