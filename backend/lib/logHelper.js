const { criar } = require('../data/logs');

async function registrarLog(tipo, descricao, usuarioId = null) {
  try {
    await criar({ tipo, descricao, usuarioId });
  } catch (err) {
    console.error('[Log] Erro ao registrar:', err.message);
  }
}

module.exports = { registrarLog };
