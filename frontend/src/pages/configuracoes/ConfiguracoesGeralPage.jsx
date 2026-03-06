import { useRef } from 'react';
import BtnVoltarHeader from '../../components/BtnVoltarHeader';
import { useConfiguracoesGeral } from '../../context/ConfiguracoesGeralContext';
import '../usuarios/Usuarios.css';
import './ConfiguracoesGeralPage.css';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo'));
    reader.readAsDataURL(file);
  });
}

export default function ConfiguracoesGeralPage() {
  const { logoHeader, favicon, setLogoHeader, setFavicon, restoreDefaults } = useConfiguracoesGeral();
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      await setLogoHeader(dataUrl);
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Falha ao salvar a logo.');
    }
    e.target.value = '';
  };

  const handleFaviconChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      await setFavicon(dataUrl);
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Falha ao salvar o favicon.');
    }
    e.target.value = '';
  };

  const handleRestoreDefaults = async () => {
    try {
      await restoreDefaults();
      if (logoInputRef.current) logoInputRef.current.value = '';
      if (faviconInputRef.current) faviconInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Falha ao restaurar.');
    }
  };

  return (
    <div className="usuarios-page configuracoes-geral-page">
      <div className="page-header">
        <BtnVoltarHeader to="/perfis" title="Voltar para Configurações" ariaLabel="Voltar" />
        <h1>Geral</h1>
      </div>
      <p className="page-desc">
        Altere a <strong>logo do menu lateral</strong> e o <strong>favicon</strong> da aplicação. As alterações são salvas nos arquivos do projeto (public e assets).
      </p>

      <div className="config-geral-card">
        <section className="config-geral-secao">
          <h2 className="config-geral-titulo">Logo do header (menu lateral)</h2>
          <div className="config-geral-preview-wrap">
            <div className="config-geral-preview config-geral-preview-logo">
              {logoHeader ? (
                <img src="/logo_header.png" alt="Logo atual" className="config-geral-logo-img" />
              ) : (
                <span className="config-geral-placeholder">Logo padrão em uso</span>
              )}
            </div>
            <div className="config-geral-acoes">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                id="config-geral-logo-input"
                className="config-geral-input-file"
              />
              <label htmlFor="config-geral-logo-input" className="btn btn-secondary">
                Escolher imagem
              </label>
              {logoHeader && (
                <button type="button" className="btn btn-secondary" onClick={() => setLogoHeader(null)}>
                  Restaurar logo padrão
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="config-geral-secao">
          <h2 className="config-geral-titulo">Favicon (ícone da aba do navegador)</h2>
          <div className="config-geral-preview-wrap">
            <div className="config-geral-preview config-geral-preview-favicon">
              {favicon ? (
                <img src="/favicon.ico" alt="Favicon atual" className="config-geral-favicon-img" />
              ) : (
                <span className="config-geral-placeholder">Favicon padrão em uso</span>
              )}
            </div>
            <div className="config-geral-acoes">
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/*,.ico"
                onChange={handleFaviconChange}
                id="config-geral-favicon-input"
                className="config-geral-input-file"
              />
              <label htmlFor="config-geral-favicon-input" className="btn btn-secondary">
                Escolher imagem
              </label>
              {favicon && (
                <button type="button" className="btn btn-secondary" onClick={() => setFavicon(null)}>
                  Restaurar favicon padrão
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="config-geral-footer">
          <button type="button" className="btn btn-secondary" onClick={handleRestoreDefaults}>
            Restaurar tudo ao padrão
          </button>
        </div>
      </div>
    </div>
  );
}
