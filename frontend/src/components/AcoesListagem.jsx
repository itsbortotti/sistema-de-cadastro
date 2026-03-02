import { Link } from 'react-router-dom';

const iconVer = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const iconEditar = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const iconExcluir = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

/**
 * Ações em ícones para listagens: Ver, Editar, Excluir.
 * @param {string} basePath - Ex: '/usuarios', '/areas', '/capex' (para Capex/Opex use `/${tipo}`)
 * @param {string} id - ID do registro
 * @param {() => void} onExcluir - Callback ao clicar em Excluir
 * @param {boolean} excluindo - Desabilita botão Excluir enquanto processa
 */
export default function AcoesListagem({ basePath, id, onExcluir, excluindo = false }) {
  return (
    <div className="acoes-listagem">
      <Link to={`${basePath}/ver/${id}`} className="btn btn-icone" title="Ver" aria-label="Ver">
        {iconVer}
      </Link>
      <Link to={`${basePath}/editar/${id}`} className="btn btn-icone" title="Editar" aria-label="Editar">
        {iconEditar}
      </Link>
      <button
        type="button"
        className="btn btn-icone btn-icone-danger"
        title="Excluir"
        aria-label="Excluir"
        onClick={onExcluir}
        disabled={excluindo}
      >
        {excluindo ? <span className="btn-icone-loading">...</span> : iconExcluir}
      </button>
    </div>
  );
}
