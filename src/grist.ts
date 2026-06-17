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

export async function savePage(name: string, html: string, css: string, js: string, gjsData: string, existingId?: number): Promise<number> {
  const now = Math.floor(Date.now() / 1000);
  if (existingId) {
    await grist.docApi.applyUserActions([['UpdateRecord', PAGES_TABLE, existingId, {
      Page_Name: name, HTML_Content: html, CSS_Content: css, JS_Content: js,
      GrapesJS_Data: gjsData, Updated_At: now,
    }]]);
    return existingId;
  } else {
    const result = await grist.docApi.applyUserActions([['AddRecord', PAGES_TABLE, null, {
      Page_Name: name, HTML_Content: html, CSS_Content: css, JS_Content: js,
      GrapesJS_Data: gjsData, Created_At: now, Updated_At: now,
    }]]);
    return result?.retValues?.[0] ?? 0;
  }
}

export async function deletePage(pageId: number): Promise<void> {
  await grist.docApi.applyUserActions([['RemoveRecord', PAGES_TABLE, pageId]]);
}

// ---- Liaison données (binding) : lecture des tables du document pour les blocs dynamiques ----

const HIDDEN_TABLES = [PAGES_TABLE, ASSETS_TABLE];

/** Liste des tables du document (hors tables internes du widget). */
export async function listUserTables(): Promise<string[]> {
  try {
    const tables: string[] = await grist.docApi.listTables();
    return (tables || []).filter(t => HIDDEN_TABLES.indexOf(t) === -1);
  } catch {
    return [];
  }
}

export interface TableData {
  cols: string[];
  rows: Record<string, unknown>[];
}

export interface ColMeta { colId: string; type: string; label: string; }

/** Colonnes MODIFIABLES d'une table (exclut les colonnes formule) avec leur type — pour le formulaire. */
export async function fetchWritableColumns(tableName: string): Promise<ColMeta[]> {
  try {
    const tbls = await grist.docApi.fetchTable('_grist_Tables');
    let ref: number | null = null;
    for (let i = 0; i < tbls.id.length; i++) { if (tbls.tableId[i] === tableName) { ref = tbls.id[i]; break; } }
    if (ref == null) return [];
    const cols = await grist.docApi.fetchTable('_grist_Tables_column');
    const out: ColMeta[] = [];
    for (let i = 0; i < cols.id.length; i++) {
      if (cols.parentId[i] !== ref) continue;
      if (cols.isFormula && cols.isFormula[i]) continue;          // colonne calculée -> non modifiable
      const colId = cols.colId[i];
      if (!colId || colId === 'manualSort' || /^gristHelper/.test(colId)) continue;
      out.push({ colId, type: String(cols.type?.[i] || 'Text'), label: String(cols.label?.[i] || colId) });
    }
    return out;
  } catch {
    return [];
  }
}

/** Récupère les colonnes + lignes d'une table Grist (pour l'aperçu dans l'éditeur). */
export async function fetchTableData(name: string): Promise<TableData> {
  try {
    const d = await grist.docApi.fetchTable(name);
    if (!d || !d.id) return { cols: [], rows: [] };
    const cols = Object.keys(d).filter(c => c !== 'id' && c !== 'manualSort');
    const rows = d.id.map((_: unknown, i: number) => {
      const o: Record<string, unknown> = {};
      cols.forEach(c => { o[c] = d[c][i]; });
      return o;
    });
    return { cols, rows };
  } catch {
    return { cols: [], rows: [] };
  }
}
