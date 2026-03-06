import { useState, useMemo } from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissoes } from '../context/PermissoesContext';
import { useTheme } from '../context/ThemeContext';
import { useConfiguracoesGeralOptional } from '../context/ConfiguracoesGeralContext';
import { ErrorBoundary } from './ErrorBoundary';
import logoPrincipalBranco from '../../assets/images/logo_principal_branco.png';
import './Layout.css';

const iconDashboard = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);
const iconCadastros = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-6l-2-2z" />
  </svg>
);
const iconUsuarios = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.86.05 1.66.11 3.26.27 2.36 1.36 2.36 2.89V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);
const iconMenu = (
  <svg className="nav-svg icon-menu" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);
const iconFechar = (
  <svg className="nav-svg icon-menu" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);
const iconFornecedores = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
  </svg>
);
const iconAreas = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
  </svg>
);
const iconHospedagens = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
  </svg>
);
const iconFormasAcesso = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
  </svg>
);
const iconProdutosSoftware = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3H9v2H7V8H5v6h2v-2h2v2h2V8h-2zm6 4h-4v-2h4v2zm2-4h-2V8h2v2z" />
  </svg>
);
const iconCapex = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
  </svg>
);
const iconEmpresas = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
  </svg>
);
const iconConfiguracoes = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);
const iconPermissoes = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
);
const iconLogs = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
  </svg>
);
const iconManual = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
  </svg>
);
const iconChevronDown = (
  <svg className="nav-svg nav-chevron" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </svg>
);
const iconChevronRight = (
  <svg className="nav-svg nav-chevron" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
  </svg>
);
const iconChevronLeft = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
);
const iconLua = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
  </svg>
);
const iconSol = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
  </svg>
);
const iconProjetos = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
  </svg>
);
const iconFinanceiro = (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
  </svg>
);
const iconSair = (
  <svg className="topbar-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);

const ROTA_TITULO = {
  '/': 'Dashboard',
  '/usuarios': 'Usuários',
  '/fornecedores': 'Fornecedores',
  '/areas': 'Áreas',
  '/hospedagens': 'Hospedagens',
  '/formas-acesso': 'Formas de Acesso',
  '/marcas-atendidas': 'Marcas Atendidas',
  '/pessoas': 'Pessoas',
  '/sistemas': 'Sistemas',
  '/projetos': 'Projetos',
  '/capex': 'Capex',
  '/opex': 'Opex',
  '/empresas': 'Empresas',
  '/configuracoes': 'Geral',
  '/geral': 'Geral',
  '/perfis': 'Perfis',
  '/logs': 'Logs',
  '/manual': 'Manual',
};

function getTituloPagina(pathname) {
  const base = pathname.split('/').filter(Boolean)[0] || '';
  const key = base ? `/${base}` : '/';
  return ROTA_TITULO[key] ?? (base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Dashboard');
}

export default function Layout() {
  const { usuario, logout } = useAuth();
  const { can, isAdmin } = usePermissoes();
  const { isDark, toggleTheme } = useTheme();
  const configuracoesGeral = useConfiguracoesGeralOptional();
  const logoUrl = (configuracoesGeral?.logoHeader === 'custom' ? '/logo_header.png' : null) || logoPrincipalBranco;
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const [financeiroAberto, setFinanceiroAberto] = useState(false);
  const [cadastrosAberto, setCadastrosAberto] = useState(false);
  const [configuracoesAberto, setConfiguracoesAberto] = useState(false);

  const tituloPagina = useMemo(() => getTituloPagina(location.pathname), [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={`layout ${!menuAberto ? 'menu-recolhido' : ''}`}>
      {!menuAberto && (
        <button
          type="button"
          className="btn-abrir-sidebar"
          onClick={() => setMenuAberto(true)}
          aria-label="Exibir menu"
          title="Exibir menu"
        >
          {iconMenu}
        </button>
      )}
      <aside className={`sidebar ${menuAberto ? '' : 'sidebar-oculto'}`} aria-hidden={!menuAberto}>
        <div className="sidebar-header">
          <button
            type="button"
            className="btn-toggle-sidebar"
            onClick={() => setMenuAberto((a) => !a)}
            aria-label={menuAberto ? 'Ocultar menu' : 'Exibir menu'}
            aria-expanded={menuAberto}
            title={menuAberto ? 'Ocultar menu' : 'Exibir menu'}
          >
            {menuAberto ? iconFechar : iconMenu}
          </button>
          <img
            src={logoUrl}
            alt="Gestão de Portfólio"
            className="sidebar-logo"
          />
        </div>
        <nav className="sidebar-nav">
          {can('dashboard', 'visualizar') && (
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active nav-link-home' : 'nav-link nav-link-home')}>
              {iconDashboard}
              <span>DASHBOARD</span>
            </NavLink>
          )}

          <div className="nav-group">
            <button
              type="button"
              className={`nav-label nav-label-toggle ${financeiroAberto ? 'aberto' : ''}`}
              onClick={() => setFinanceiroAberto((a) => !a)}
              aria-expanded={financeiroAberto}
              aria-label={financeiroAberto ? 'Recolher Financeiro' : 'Expandir Financeiro'}
            >
              {iconFinanceiro}
              <span>Financeiro</span>
              {financeiroAberto ? iconChevronDown : iconChevronRight}
            </button>
            <div className={`nav-group-itens ${financeiroAberto ? '' : 'recolhido'}`}>
              <NavLink to="/capex" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                {iconCapex}
                <span>Capex</span>
              </NavLink>
              <NavLink to="/opex" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                {iconCapex}
                <span>Opex</span>
              </NavLink>
              <NavLink to="/projetos" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                {iconProjetos}
                <span>Projetos</span>
              </NavLink>
            </div>
          </div>

          <div className="nav-group">
            <button
              type="button"
              className={`nav-label nav-label-toggle ${cadastrosAberto ? 'aberto' : ''}`}
              onClick={() => setCadastrosAberto((a) => !a)}
              aria-expanded={cadastrosAberto}
              aria-label={cadastrosAberto ? 'Recolher Cadastros' : 'Expandir Cadastros'}
            >
              {iconCadastros}
              <span>Cadastros</span>
              {cadastrosAberto ? iconChevronDown : iconChevronRight}
            </button>
            <div className={`nav-group-itens ${cadastrosAberto ? '' : 'recolhido'}`}>
              <NavLink to="/areas" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                {iconAreas}
                <span>Áreas</span>
              </NavLink>
              <NavLink to="/empresas" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                {iconEmpresas}
                <span>Empresas</span>
              </NavLink>
              <NavLink to="/formas-acesso" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                {iconFormasAcesso}
                <span>Formas de Acesso</span>
              </NavLink>
              <NavLink to="/fornecedores" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                {iconFornecedores}
                <span>Fornecedores</span>
              </NavLink>
              <NavLink to="/hospedagens" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                {iconHospedagens}
                <span>Hospedagens</span>
              </NavLink>
              <NavLink to="/marcas-atendidas" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                {iconAreas}
                <span>Marcas Atendidas</span>
              </NavLink>
              <NavLink to="/pessoas" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                {iconUsuarios}
                <span>Pessoas</span>
              </NavLink>
              <NavLink to="/sistemas" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                {iconProdutosSoftware}
                <span>Sistemas</span>
              </NavLink>
              <NavLink to="/usuarios" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                {iconUsuarios}
                <span>Usuários</span>
              </NavLink>
            </div>
          </div>

          {can('configuracoes', 'visualizar') && (
            <div className="nav-group nav-group-config">
              <button
                type="button"
                className={`nav-label nav-label-toggle ${configuracoesAberto ? 'aberto' : ''}`}
                onClick={() => setConfiguracoesAberto((a) => !a)}
                aria-expanded={configuracoesAberto}
                aria-label={configuracoesAberto ? 'Recolher Configurações' : 'Expandir Configurações'}
              >
                {iconConfiguracoes}
                <span>Configurações</span>
                {configuracoesAberto ? iconChevronDown : iconChevronRight}
              </button>
              <div className={`nav-group-itens ${configuracoesAberto ? '' : 'recolhido'}`}>
                <NavLink to="/geral" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                  {iconConfiguracoes}
                  <span>Geral</span>
                </NavLink>
                <NavLink to="/perfis" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                  {iconPermissoes}
                  <span>Perfis</span>
                </NavLink>
                {can('logs', 'visualizar') && (
                  <NavLink to="/logs" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                    {iconLogs}
                    <span>Logs</span>
                  </NavLink>
                )}
                <NavLink to="/manual" className={({ isActive }) => (isActive ? 'nav-link active nav-link-sub' : 'nav-link nav-link-sub')}>
                  {iconManual}
                  <span>Manual</span>
                </NavLink>
              </div>
            </div>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-footer-powered">
            <p className="sidebar-powered-text">Powered by</p>
            <button
              type="button"
              className="btn-chevron-sidebar"
              onClick={() => setMenuAberto(false)}
              aria-label="Recolher menu"
            >
              {iconChevronLeft}
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <h1 className="topbar-title">{tituloPagina}</h1>
          <div className="topbar-actions">
            <button
              type="button"
              className="topbar-btn topbar-btn-theme"
              onClick={toggleTheme}
              aria-label={isDark ? 'Desativar modo escuro' : 'Ativar modo escuro'}
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {isDark ? iconSol : iconLua}
            </button>
            <span className="topbar-user">{usuario?.nome || usuario?.login}</span>
            <button type="button" onClick={handleLogout} className="topbar-btn topbar-btn-sair" aria-label="Sair">
              {iconSair}
            </button>
          </div>
        </header>
        <div className="main-content-inner">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
