const express = require('express');
const cors = require('cors');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const fornecedoresRoutes = require('./routes/fornecedores');
const areasRoutes = require('./routes/areas');
const hospedagensRoutes = require('./routes/hospedagens');
const formasAcessoRoutes = require('./routes/formasAcesso');
const timesRoutes = require('./routes/times');
const produtosSoftwareRoutes = require('./routes/produtosSoftware');
const permissoesRoutes = require('./routes/permissoes');
const { requireAuth, requirePermissaoPorMetodo } = require('./middleware/permissoes');

const app = express();
const PORT = process.env.PORT || 3001;

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Cadastro - API',
      version: '1.0.0',
      description: 'APIs de autenticação e cadastro de usuários',
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

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'sistema-cadastro-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/permissoes', permissoesRoutes);
app.use('/api/usuarios', requireAuth, requirePermissaoPorMetodo('usuarios'), usuariosRoutes);
app.use('/api/fornecedores', requireAuth, requirePermissaoPorMetodo('fornecedores'), fornecedoresRoutes);
app.use('/api/areas', requireAuth, requirePermissaoPorMetodo('areas'), areasRoutes);
app.use('/api/hospedagens', requireAuth, requirePermissaoPorMetodo('hospedagens'), hospedagensRoutes);
app.use('/api/formas-acesso', requireAuth, requirePermissaoPorMetodo('formas-acesso'), formasAcessoRoutes);
app.use('/api/times', requireAuth, requirePermissaoPorMetodo('times'), timesRoutes);
app.use('/api/produtos-software', requireAuth, requirePermissaoPorMetodo('produtos-software'), produtosSoftwareRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Swagger em http://localhost:${PORT}/api-docs`);
});
