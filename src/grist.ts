declare const grist: any;

const PAGES_TABLE = 'Design_Pages';
const ASSETS_TABLE = 'Design_Assets';

function isInsideGrist(): boolean {
  try { return window.self !== window.top; } catch { return true; }
}

export async function initGrist(): Promise<boolean> {
  if (!isInsideGrist()) return false;
  try {
    await grist.ready({ requiredAccess: 'full' });
    return true;
  } catch {
    return false;
  }
}

export async function ensureTables(): Promise<void> {
  try {
    const tables: string[] = await grist.docApi.listTables();
    if (tables.indexOf(PAGES_TABLE) === -1) {
      await grist.docApi.applyUserActions([['AddTable', PAGES_TABLE, [
        { id: 'Page_Name', type: 'Text' },
        { id: 'HTML_Content', type: 'Text' },
        { id: 'CSS_Content', type: 'Text' },
        { id: 'JS_Content', type: 'Text' },
        { id: 'GrapesJS_Data', type: 'Text' },
        { id: 'Created_At', type: 'Date' },
        { id: 'Updated_At', type: 'Date' },
      ]]]);
    }
    if (tables.indexOf(ASSETS_TABLE) === -1) {
      await grist.docApi.applyUserActions([['AddTable', ASSETS_TABLE, [
        { id: 'Asset_Name', type: 'Text' },
        { id: 'Asset_URL', type: 'Text' },
        { id: 'Asset_Type', type: 'Text' },
      ]]]);
    }
  } catch (e) {
    console.warn('[DesignWeb] ensureTables:', e);
  }
}

export interface SavedPage {
  id: number;
  name: string;
  html: string;
  css: string;
  js: string;
  gjsData: string;
  createdAt: number | null;
  updatedAt: number | null;
}

export async function loadPages(): Promise<SavedPage[]> {
  try {
    const data = await grist.docApi.fetchTable(PAGES_TABLE);
    if (!data?.id) return [];
    const pages: SavedPage[] = [];
    for (let i = 0; i < data.id.length; i++) {
      pages.push({
        id: data.id[i],
        name: data.Page_Name?.[i] || '',
        html: data.HTML_Content?.[i] || '',
        css: data.CSS_Content?.[i] || '',
        js: data.JS_Content?.[i] || '',
        gjsData: data.GrapesJS_Data?.[i] || '',
        createdAt: data.Created_At?.[i] || null,
        updatedAt: data.Updated_At?.[i] || null,
      });
    }
    return pages;
  } catch {
    return [];
  }
}

export async function savePage(name: string, html: string, css: string, js: string, gjsData: string, existingId?: number): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  if (existingId) {
    await grist.docApi.applyUserActions([['UpdateRecord', PAGES_TABLE, existingId, {
      Page_Name: name, HTML_Content: html, CSS_Content: css, JS_Content: js,
      GrapesJS_Data: gjsData, Updated_At: now,
    }]]);
  } else {
    await grist.docApi.applyUserActions([['AddRecord', PAGES_TABLE, null, {
      Page_Name: name, HTML_Content: html, CSS_Content: css, JS_Content: js,
      GrapesJS_Data: gjsData, Created_At: now, Updated_At: now,
    }]]);
  }
}

export async function deletePage(pageId: number): Promise<void> {
  await grist.docApi.applyUserActions([['RemoveRecord', PAGES_TABLE, pageId]]);
}
