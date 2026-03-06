/**
 * Configuração centralizada a partir de variáveis de ambiente.
 * Em produção, SESSION_SECRET e DATABASE_URL devem estar definidos.
 */
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  port: Number(process.env.PORT) || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  session: {
    secret: process.env.SESSION_SECRET || (isProduction ? null : 'sistema-cadastro-secret'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.COOKIE_SECURE === 'true' || isProduction,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  },
  /** Limite de requisições para login (por IP): máx 5 tentativas a cada 15 minutos */
  rateLimitAuth: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { erro: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
  },
};
