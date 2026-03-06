import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_LOGO = 'app_config_logo_header';
const STORAGE_FAVICON = 'app_config_favicon';

const ConfiguracoesGeralContext = createContext(null);

export function ConfiguracoesGeralProvider({ children }) {
  const [logoHeader, setLogoHeaderState] = useState(() => localStorage.getItem(STORAGE_LOGO));
  const [favicon, setFaviconState] = useState(() => localStorage.getItem(STORAGE_FAVICON));

  const setLogoHeader = useCallback((dataUrlOrNull) => {
    if (dataUrlOrNull == null || dataUrlOrNull === '') {
      localStorage.removeItem(STORAGE_LOGO);
      setLogoHeaderState(null);
    } else {
      localStorage.setItem(STORAGE_LOGO, dataUrlOrNull);
      setLogoHeaderState(dataUrlOrNull);
    }
  }, []);

  const setFavicon = useCallback((dataUrlOrNull) => {
    if (dataUrlOrNull == null || dataUrlOrNull === '') {
      localStorage.removeItem(STORAGE_FAVICON);
      setFaviconState(null);
    } else {
      localStorage.setItem(STORAGE_FAVICON, dataUrlOrNull);
      setFaviconState(dataUrlOrNull);
    }
  }, []);

  const restoreDefaults = useCallback(() => {
    localStorage.removeItem(STORAGE_LOGO);
    localStorage.removeItem(STORAGE_FAVICON);
    setLogoHeaderState(null);
    setFaviconState(null);
  }, []);

  return (
    <ConfiguracoesGeralContext.Provider
      value={{
        logoHeader: logoHeader || null,
        favicon: favicon || null,
        setLogoHeader,
        setFavicon,
        restoreDefaults,
      }}
    >
      {children}
    </ConfiguracoesGeralContext.Provider>
  );
}

export function useConfiguracoesGeral() {
  const ctx = useContext(ConfiguracoesGeralContext);
  if (!ctx) throw new Error('useConfiguracoesGeral deve ser usado dentro de ConfiguracoesGeralProvider');
  return ctx;
}

/** Versão opcional: retorna null fora do provider */
export function useConfiguracoesGeralOptional() {
  return useContext(ConfiguracoesGeralContext);
}

/** Atualiza o <link rel="icon"> no head conforme o contexto */
export function FaviconUpdater() {
  const { favicon } = useConfiguracoesGeral();
  useEffect(() => {
    let link = document.getElementById('app-favicon');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.id = 'app-favicon';
      document.head.appendChild(link);
    }
    link.href = favicon || '/favicon.ico';
  }, [favicon]);
  return null;
}
