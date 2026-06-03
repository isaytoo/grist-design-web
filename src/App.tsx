import { useState, useCallback, useRef } from 'react';
import grapesjs from 'grapesjs';
import type { Editor } from 'grapesjs';
import GjsEditor from '@grapesjs/react';
import presetWebpage from 'grapesjs-preset-webpage';
import blocksBasic from 'grapesjs-blocks-basic';
import pluginForms from 'grapesjs-plugin-forms';
import pluginCountdown from 'grapesjs-component-countdown';
import pluginTabs from 'grapesjs-tabs';
import pluginCustomCode from 'grapesjs-custom-code';
import pluginTooltip from 'grapesjs-tooltip';
import pluginTyped from 'grapesjs-typed';
import { registerCustomBlocks } from './blocks';
import { gjsFrench } from './gjsI18n';
import { downloadZip, getExportData } from './exportUtils';
import { addImagesAsBase64 } from './assets';
import { initGrist, ensureTables, loadPages, savePage, deletePage } from './grist';
import type { SavedPage } from './grist';
import { t, setLang, getLang } from './i18n';
import type { Lang } from './i18n';
import './styles.css';

export default function App() {
  const editorRef = useRef<Editor | null>(null);
  const [pageName, setPageName] = useState('Ma page');
  const [currentPageId, setCurrentPageId] = useState<number | undefined>();
  const [toast, setToast] = useState('');
  const [lang, setLangState] = useState<Lang>(getLang());
  const [showPagesModal, setShowPagesModal] = useState(false);
  const [savedPages, setSavedPages] = useState<SavedPage[]>([]);
  const [inGrist, setInGrist] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const onEditor = useCallback(async (editor: Editor) => {
    editorRef.current = editor;
    registerCustomBlocks(editor);

    // Intercept image uploads → convert to base64 data URIs
    editor.on('asset:upload:start', () => {});
    editor.on('asset:upload:response', () => {});

    const amConfig = editor.AssetManager.getConfig();
    (amConfig as Record<string, unknown>).uploadFile = async (ev: DragEvent | Event) => {
      const files = (ev as DragEvent).dataTransfer?.files
        || ((ev.target as HTMLInputElement)?.files);
      if (files) {
        await addImagesAsBase64(files, editor, (msg) => showToast(msg));
      }
    };

    const ok = await initGrist();
    setInGrist(ok);
    if (ok) await ensureTables();
  }, []);

  const handleSave = async () => {
    const editor = editorRef.current;
    if (!editor) return;
    const { rawHtml, rawCss, rawJs } = getExportData(editor);
    const gjsData = JSON.stringify(editor.getProjectData());
    if (inGrist) {
      await savePage(pageName, rawHtml, rawCss, rawJs, gjsData, currentPageId);
    }
    showToast(t('saved'));
  };

  const handleExportZip = async () => {
    const editor = editorRef.current;
    if (!editor) return;
    await downloadZip(editor, pageName);
    showToast(t('exported'));
  };

  const handleLoad = async () => {
    if (!inGrist) return;
    const pages = await loadPages();
    setSavedPages(pages);
    setShowPagesModal(true);
  };

  const handleLoadPage = (page: SavedPage) => {
    const editor = editorRef.current;
    if (!editor) return;
    if (page.gjsData) {
      try {
        editor.loadProjectData(JSON.parse(page.gjsData));
      } catch {
        editor.setComponents(page.html);
        if (page.css) editor.setStyle(page.css);
      }
    } else {
      editor.setComponents(page.html);
      if (page.css) editor.setStyle(page.css);
    }
    setPageName(page.name);
    setCurrentPageId(page.id);
    setShowPagesModal(false);
    showToast(t('pageLoaded'));
  };

  const handleDeletePage = async (pageId: number) => {
    await deletePage(pageId);
    setSavedPages(prev => prev.filter(p => p.id !== pageId));
    showToast(t('pageDeleted'));
  };

  const switchLang = (l: Lang) => {
    setLang(l);
    setLangState(l);
    const editor = editorRef.current;
    if (editor) {
      editor.I18n.setLocale(l === 'fr' ? 'fr' : 'en');
    }
  };

  // suppress unused var warning
  void lang;

  return (
    <div className="dw-app">
      {/* Header */}
      <header className="dw-header">
        <div className="dw-header-left">
          <span className="dw-logo">🎨 {t('appTitle')}</span>
          <input
            className="dw-page-name"
            value={pageName}
            onChange={e => setPageName(e.target.value)}
            placeholder={t('pageName')}
          />
        </div>
        <div className="dw-header-right">
          {inGrist && <button className="dw-btn dw-btn-secondary" onClick={handleLoad}>📂 {t('loadFromGrist')}</button>}
          {inGrist && <button className="dw-btn dw-btn-primary" onClick={handleSave}>💾 {t('saveToGrist')}</button>}
          <button className="dw-btn dw-btn-export" onClick={handleExportZip}>📦 {t('exportZip')}</button>
          <button className={`dw-lang ${getLang() === 'fr' ? 'active' : ''}`} onClick={() => switchLang('fr')}>FR</button>
          <button className={`dw-lang ${getLang() === 'en' ? 'active' : ''}`} onClick={() => switchLang('en')}>EN</button>
        </div>
      </header>

      {/* Editor */}
      <div className="dw-editor-wrap">
        <GjsEditor
          grapesjs={grapesjs}
          grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
          onEditor={onEditor}
          options={{
            height: '100%',
            storageManager: false,
            i18n: {
              locale: getLang() === 'fr' ? 'fr' : 'en',
              detectLocale: false,
              messages: { fr: gjsFrench },
            },
            deviceManager: {
              devices: [
                { name: 'Desktop', width: '' },
                { name: 'Tablet', width: '768px', widthMedia: '992px' },
                { name: 'Mobile portrait', width: '375px', widthMedia: '480px' },
              ],
            },
            styleManager: {
              sectors: [
                { name: 'General', open: true, properties: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'] },
                { name: 'Dimension', open: true, properties: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'] },
                { name: 'Typography', open: true, properties: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-shadow'] },
                { name: 'Decorations', open: true, properties: ['background-color', 'background', 'border-radius', 'border', 'box-shadow'] },
                { name: 'Extra', open: false, properties: ['opacity', 'transition', 'transform', 'cursor', 'overflow'] },
              ],
            },
            plugins: [
              presetWebpage,
              (editor: Editor) => {
                // Unwrap UMD .default for plugins that use that pattern
                const unwrap = (p: unknown) => (p as { default?: Function }).default ?? p;
                (unwrap(blocksBasic) as Function)(editor, { flexGrid: true });
                (unwrap(pluginTabs) as Function)(editor, {});
                (unwrap(pluginTyped) as Function)(editor, {});
              },
              pluginForms,
              pluginCountdown,
              pluginCustomCode,
              pluginTooltip,
            ],
          }}
        />
      </div>

      {/* Footer */}
      <footer className="dw-footer">
        <span>© 2026 isaytoo</span>
        <a href="https://gristup.fr" target="_blank" rel="noopener noreferrer">gristup.fr</a>
      </footer>

      {/* Toast */}
      {toast && <div className="dw-toast">{toast}</div>}

      {/* Pages Modal */}
      {showPagesModal && (
        <div className="dw-modal-overlay" onClick={() => setShowPagesModal(false)}>
          <div className="dw-modal" onClick={e => e.stopPropagation()}>
            <div className="dw-modal-header">
              <h3>📂 {t('myPages')}</h3>
              <button className="dw-modal-close" onClick={() => setShowPagesModal(false)}>×</button>
            </div>
            <div className="dw-modal-body">
              {savedPages.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: 20 }}>{t('noPages')}</p>
              ) : (
                savedPages.map(page => (
                  <div key={page.id} className="dw-page-item">
                    <div>
                      <strong>{page.name}</strong>
                      <span className="dw-page-date">
                        {page.updatedAt ? new Date(page.updatedAt * 1000).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className="dw-page-actions">
                      <button className="dw-btn dw-btn-primary" onClick={() => handleLoadPage(page)}>{t('loadPage')}</button>
                      <button className="dw-btn dw-btn-danger" onClick={() => handleDeletePage(page.id)}>{t('deletePage')}</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
