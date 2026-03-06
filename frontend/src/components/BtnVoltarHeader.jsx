import { Link } from 'react-router-dom';

/** Botão Voltar com ícone para o canto esquerdo do cabeçalho (telas de formulário e demais) */
export default function BtnVoltarHeader({ to, ariaLabel = 'Voltar', title = 'Voltar' }) {
  return (
    <Link to={to} className="btn-voltar-header" aria-label={ariaLabel} title={title}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}
