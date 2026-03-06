const config = require('./config');
const constants = require('./config/constants');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const fornecedoresRoutes = require('./routes/fornecedores');
const areasRoutes = require('./routes/areas');
const hospedagensRoutes = require('./routes/hospedagens');
const formasAcessoRoutes = require('./routes/formasAcesso');
const timesRoutes = require('./routes/times');
const marcasAtendidasRoutes = require('./routes/marcasAtendidas');
const pessoasRoutes = require('./routes/pessoas');
const produtosSoftwareRoutes = require('./routes/produtosSoftware');
const projetosRoutes = require('./routes/projetos');
const capexRoutes = require('./routes/capex');
const empresasRoutes = require('./routes/empresas');
const permissoesRoutes = require('./routes/permissoes');
const perfisRoutes = require('./routes/perfis');
const logsRoutes = require('./routes/logs');
const configuracoesRoutes = require('./routes/configuracoes');
const { requireAuth, requirePermissaoPorMetodo } = require('./middleware/permissoes');

if (process.env.NODE_ENV === 'production' && !config.session.secret) {
  console.error('Em produção, defina SESSION_SECRET no ambiente.');
  process.exit(1);
}

const app = express();
const PORT = config.port;

// Segurança: headers HTTP
app.use(helmet({ contentSecurityPolicy: false }));

// CORS e body
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: constants.BODY_JSON_LIMIT }));

// Sessão (store em PostgreSQL quando DATABASE_URL existir; cria tabela "session" se não existir)
let sessionStore;
if (process.env.DATABASE_URL) {
  try {
    sessionStore = new pgSession({
      pool: new Pool({ connectionString: process.env.DATABASE_URL }),
      createTableIfMissing: true,
    });
  } catch (e) {
    console.warn('Session store PostgreSQL não configurado, usando memória:', e.message);
  }
}
app.use(session({
  ...config.session,
  secret: config.session.secret || 'dev-secret',
  store: sessionStore,
}));

// Rate limit apenas nas rotas de autenticação (proteção contra força bruta)
const authLimiter = rateLimit(config.rateLimitAuth);
app.use('/api/auth/login', authLimiter);

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Governança Financeira de Projetos - API',
      version: '1.0.0',
      description: 'API REST para autenticação, usuários, projetos, Capex/Opex, sistemas, empresas e demais cadastros. Erros retornam `{ erro: "mensagem em PT-BR" }`. Documentação unificada: docs/PADRAO-PROJETO-IA.md.',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Servidor local' }],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/permissoes', requireAuth, permissoesRoutes);
app.use('/api/perfis', requireAuth, requirePermissaoPorMetodo('perfis'), perfisRoutes);
app.use('/api/logs', requireAuth, requirePermissaoPorMetodo('logs'), logsRoutes);
app.use('/api/configuracoes', (req, res, next) => {
  if (req.path === '/custom-assets' && req.method === 'GET') return next();
  requireAuth(req, res, () => {
    requirePermissaoPorMetodo('configuracoes')(req, res, next);
  });
}, configuracoesRoutes);
app.use('/api/usuarios', requireAuth, requirePermissaoPorMetodo('usuarios'), usuariosRoutes);
app.use('/api/fornecedores', requireAuth, requirePermissaoPorMetodo('fornecedores'), fornecedoresRoutes);
app.use('/api/areas', requireAuth, requirePermissaoPorMetodo('areas'), areasRoutes);
app.use('/api/hospedagens', requireAuth, requirePermissaoPorMetodo('hospedagens'), hospedagensRoutes);
app.use('/api/formas-acesso', requireAuth, requirePermissaoPorMetodo('formas-acesso'), formasAcessoRoutes);
app.use('/api/times', requireAuth, requirePermissaoPorMetodo('times'), timesRoutes);
app.use('/api/marcas-atendidas', requireAuth, requirePermissaoPorMetodo('marcas-atendidas'), marcasAtendidasRoutes);
app.use('/api/pessoas', requireAuth, requirePermissaoPorMetodo('pessoas'), pessoasRoutes);
app.use('/api/produtos-software', requireAuth, requirePermissaoPorMetodo('produtos-software'), produtosSoftwareRoutes);
app.use('/api/projetos', requireAuth, requirePermissaoPorMetodo('projetos'), projetosRoutes);
app.use('/api/capex', requireAuth, requirePermissaoPorMetodo('capex'), capexRoutes);
app.use('/api/empresas', requireAuth, requirePermissaoPorMetodo('empresas'), empresasRoutes);

// Rotas /api não encontradas retornam 404 em JSON (padrão da API)
app.use('/api', (_req, res) => {
  res.status(404).json({ erro: 'Não encontrado' });
});

// Middleware global de erro (deve ser o último)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Swagger em http://localhost:${PORT}/api-docs`);
});
