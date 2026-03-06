import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { configuracoesApi } from '../api/client';

const ConfiguracoesGeralContext = createContext(null);

export function ConfiguracoesGeralProvider({ children }) {
  const [logoHeader, setLogoHeaderState] = useState(null);
  const [favicon, setFaviconState] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    configuracoesApi
      .getCustomAssets()
      .then(({ logo, favicon: fav }) => {
        setLogoHeaderState(logo ? 'custom' : null);
        setFaviconState(fav ? 'custom' : null);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const setLogoHeader = useCallback(async (dataUrlOrNull) => {
    if (dataUrlOrNull == null || dataUrlOrNull === '') {
      await configuracoesApi.removeLogo().catch(() => {});
      setLogoHeaderState(null);
    } else {
      await configuracoesApi.saveLogo(dataUrlOrNull);
      setLogoHeaderState('custom');
    }
  }, []);

  const setFavicon = useCallback(async (dataUrlOrNull) => {
    if (dataUrlOrNull == null || dataUrlOrNull === '') {
      await configuracoesApi.removeFavicon().catch(() => {});
      setFaviconState(null);
    } else {
      await configuracoesApi.saveFavicon(dataUrlOrNull);
      setFaviconState('custom');
    }
  }, []);

  const restoreDefaults = useCallback(async () => {
    await Promise.all([
      configuracoesApi.removeLogo().catch(() => {}),
      configuracoesApi.removeFavicon().catch(() => {}),
    ]);
    setLogoHeaderState(null);
    setFaviconState(null);
  }, []);

  return (
    <ConfiguracoesGeralContext.Provider
      value={{
        logoHeader: logoHeader || null,
        favicon: favicon || null,
        loaded,
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

/** URL da logo do header: arquivo no servidor se custom, senão null (Layout usa default). */
export function getLogoHeaderUrl(logoHeader) {
  return logoHeader === 'custom' ? '/logo_header.png' : null;
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
    link.href = favicon === 'custom' ? '/favicon.ico' : '/favicon.ico';
  }, [favicon]);
  return null;
}
