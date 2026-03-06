/**
 * Constantes da aplicação (limites, formatos, etc.)
 */
module.exports = {
  /** Limite máximo de itens por página em listagens */
  PAGINATION_MAX_LIMIT: 100,
  /** Limite padrão quando não informado */
  PAGINATION_DEFAULT_LIMIT: 20,
  /** Tamanho máximo do body JSON (bytes) */
  BODY_JSON_LIMIT: '500kb',
  /** Comprimento mínimo/máximo para campos de texto comuns */
  LOGIN_MIN_LENGTH: 2,
  LOGIN_MAX_LENGTH: 100,
  NOME_MAX_LENGTH: 200,
  DESCRICAO_MAX_LENGTH: 2000,
  /** Limite máximo de registros na listagem de logs */
  LOGS_MAX_LIMIT: 500,
  /** Limite padrão na listagem de logs quando não informado */
  LOGS_DEFAULT_LIMIT: 200,
};
