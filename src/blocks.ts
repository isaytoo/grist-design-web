import type { Editor } from 'grapesjs';
import { fetchTableData, fetchWritableColumns, getGristToken } from './grist';

// Jeton d'accès (cache) pour résoudre les pièces jointes dans l'aperçu éditeur.
let gristTok: { baseUrl: string; token: string } | null = null;
async function ensureTok() { gristTok = await getGristToken(); }
// URL d'image depuis une valeur de cellule : URL/data-URI directe, ou pièce jointe (via jeton).
function imgFromVal(v: unknown): string {
  if (typeof v === 'string' && (/^data:image\//i.test(v) || (/^https?:\/\//i.test(v) && /\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?|#|$)/i.test(v)))) return v;
  if (Array.isArray(v) && gristTok) { const id = v.find(x => typeof x === 'number'); if (id != null) return gristTok.baseUrl + '/attachments/' + id + '/download?auth=' + gristTok.token; }
  return '';
}

// Liste des tables du document (remplie par App après connexion à Grist) pour le bloc "Tableau Grist".
let gristTables: string[] = [];
let editorRef: Editor | null = null;

// Pour chaque type de bloc Grist : le nom du trait qui contient la TABLE à lister.
const TABLE_TRAIT_BY_TYPE: Record<string, string> = {
  'grist-table': 'data-grist-table',
  'grist-form': 'data-grist-form',
  'grist-field': 'data-grist-field-table',
  'grist-cards': 'data-grist-cards-table',
};

function gristTraitName(cmp: any): string | null {
  const type = cmp?.get?.('type');
  return (type && TABLE_TRAIT_BY_TYPE[type]) || null;
}

function applyTableOptions(cmp: any) {
  if (!cmp) return;
  const traitName = gristTraitName(cmp);
  if (!traitName) return;
  const trait = cmp.getTrait?.(traitName);
  if (trait) trait.set('options', [{ id: '', name: '— choisir —' }, ...gristTables.map(t => ({ id: t, name: t }))]);
}

const colOptionsCache: Record<string, { id: string; name: string }[]> = {};

// Peuple un trait "select" avec les colonnes de la table choisie.
async function populateColTrait(cmp: any, tableAttr: string, colTraitName: string) {
  const trait = cmp.getTrait?.(colTraitName);
  if (!trait) return;
  const table = cmp.getAttributes?.()[tableAttr];
  if (!table) { trait.set('options', [{ id: '', name: '— choisir —' }]); return; }
  let opts = colOptionsCache[table];
  if (!opts) {
    const data = await fetchTableData(table);
    opts = data.cols.map(c => ({ id: c, name: c }));
    colOptionsCache[table] = opts;
  }
  trait.set('options', [{ id: '', name: '— choisir —' }, ...opts]);
}

// Pour un type : (attribut table, [traits colonnes à peupler]).
const COL_TRAITS_BY_TYPE: Record<string, { tableAttr: string; colTraits: string[] }> = {
  'grist-field': { tableAttr: 'data-grist-field-table', colTraits: ['data-grist-field-col'] },
  'grist-cards': { tableAttr: 'data-grist-cards-table', colTraits: ['data-grist-cards-title', 'data-grist-cards-subtitle', 'data-grist-cards-image', 'data-grist-cards-desc'] },
};

function populateSelectedColTraits(cmp: any) {
  const type = cmp?.get?.('type');
  const cfg = type && COL_TRAITS_BY_TYPE[type];
  if (!cfg) return;
  cfg.colTraits.forEach((ct: string) => populateColTrait(cmp, cfg.tableAttr, ct));
}

// Génère, pour chaque table, une catégorie de blocs "champs" glissables (un par colonne).
// Glisser un bloc insère un "Champ Grist" déjà lié à Table + Colonne.
async function buildFieldBlocks() {
  if (!editorRef) return;
  const bm = editorRef.Blocks;
  // Supprime les anciens blocs de champs avant de régénérer.
  (bm.getAll().filter((b: any) => /^grist-fb-/.test(b.get('id'))) as any[]).forEach((b: any) => bm.remove(b.get('id')));
  for (const table of gristTables) {
    const data = await fetchTableData(table);
    let opts = colOptionsCache[table];
    if (!opts) { opts = data.cols.map(c => ({ id: c, name: c })); colOptionsCache[table] = opts; }
    data.cols.forEach((col, i) => {
      bm.add(`grist-fb-${table}-${col}`, {
        label: col,
        category: `Champs : ${table}`,
        media: ICONS.gristField,
        attributes: { title: `Insérer ${table}.${col}` },
        content: { type: 'grist-field', attributes: { 'data-grist-field-table': table, 'data-grist-field-col': col, 'data-grist-field-row': '1' } },
      } as any, { at: i });
    });
  }
}

export function setGristTables(tables: string[]) {
  gristTables = tables;
  // Rafraîchit le composant déjà sélectionné (cas où les tables arrivent après la sélection).
  const selected = editorRef?.getSelected?.();
  if (selected) applyTableOptions(selected);
  buildFieldBlocks();
}
function escapeHtml(s: unknown): string {
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

// Rend les enfants d'un composant non sélectionnables : un clic sur l'aperçu
// sélectionne alors le composant parent (Tableau/Formulaire Grist) et ses réglages.
function lockDescendants(comp: any) {
  comp.components?.().each?.((c: any) => {
    c.set({ selectable: false, hoverable: false, draggable: false, droppable: false, editable: false, copyable: false, removable: false, locked: true });
    lockDescendants(c);
  });
}

// SVG icons matching native GrapesJS style (64x64, stroke-based, currentColor)
const svgIcon = (paths: string) =>
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:48px;"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;

const ICONS = {
  blank: svgIcon('<rect x="8" y="8" width="48" height="48" rx="4" stroke-dasharray="4,4"/>'),
  hero: svgIcon('<rect x="6" y="10" width="52" height="44" rx="4"/><line x1="18" y1="26" x2="46" y2="26"/><line x1="22" y1="34" x2="42" y2="34"/><rect x="24" y="40" width="16" height="8" rx="3"/>'),
  heroPro: svgIcon('<rect x="6" y="10" width="52" height="44" rx="4"/><line x1="18" y1="24" x2="46" y2="24"/><line x1="22" y1="32" x2="42" y2="32"/><rect x="24" y="38" width="16" height="8" rx="3"/><path d="M10 14l8 6-3 0 5 8-3 0 5 10H10z" fill="currentColor" stroke="none" opacity="0.15"/><circle cx="50" cy="16" r="4" fill="currentColor" stroke="none" opacity="0.15"/>'),
  cta: svgIcon('<rect x="6" y="16" width="52" height="32" rx="4"/><line x1="18" y1="28" x2="46" y2="28"/><rect x="22" y="34" width="20" height="8" rx="3"/>'),
  features: svgIcon('<rect x="4" y="12" width="16" height="16" rx="3"/><rect x="24" y="12" width="16" height="16" rx="3"/><rect x="44" y="12" width="16" height="16" rx="3"/><line x1="6" y1="36" x2="18" y2="36"/><line x1="26" y1="36" x2="38" y2="36"/><line x1="46" y1="36" x2="58" y2="36"/><line x1="8" y1="42" x2="16" y2="42"/><line x1="28" y1="42" x2="36" y2="42"/><line x1="48" y1="42" x2="56" y2="42"/>'),
  testimonial: svgIcon('<path d="M12 14 h40 a4 4 0 0 1 4 4 v20 a4 4 0 0 1-4 4 H28 l-8 8 v-8 H12 a4 4 0 0 1-4-4 V18 a4 4 0 0 1 4-4z"/><line x1="18" y1="24" x2="46" y2="24"/><line x1="18" y1="32" x2="38" y2="32"/>'),
  pricing: svgIcon('<rect x="4" y="8" width="16" height="48" rx="3"/><rect x="24" y="4" width="16" height="56" rx="3"/><rect x="44" y="8" width="16" height="48" rx="3"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="28" y1="16" x2="36" y2="16"/><line x1="48" y1="20" x2="56" y2="20"/>'),
  faq: svgIcon('<circle cx="16" cy="20" r="8"/><text x="13" y="24" fill="currentColor" stroke="none" font-size="14" font-weight="bold">?</text><line x1="10" y1="34" x2="54" y2="34"/><line x1="10" y1="42" x2="54" y2="42"/><line x1="10" y1="50" x2="40" y2="50"/>'),
  navbar: svgIcon('<rect x="4" y="22" width="56" height="20" rx="4"/><line x1="10" y1="32" x2="24" y2="32"/><circle cx="38" cy="32" r="2" fill="currentColor"/><circle cx="46" cy="32" r="2" fill="currentColor"/><circle cx="54" cy="32" r="2" fill="currentColor"/>'),
  footer: svgIcon('<rect x="4" y="36" width="56" height="20" rx="4"/><line x1="14" y1="46" x2="50" y2="46"/><line x1="20" y1="52" x2="44" y2="52"/>'),
  separator: svgIcon('<line x1="8" y1="32" x2="56" y2="32"/>'),
  spacer: svgIcon('<line x1="32" y1="12" x2="32" y2="22"/><line x1="28" y1="16" x2="32" y2="12"/><line x1="36" y1="16" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="42"/><line x1="28" y1="48" x2="32" y2="52"/><line x1="36" y1="48" x2="32" y2="52"/>'),
  container: svgIcon('<rect x="12" y="10" width="40" height="44" rx="3"/><line x1="12" y1="10" x2="12" y2="54"/><line x1="52" y1="10" x2="52" y2="54"/><line x1="16" y1="6" x2="12" y2="10"/><line x1="8" y1="10" x2="12" y2="6" stroke="none"/><path d="M8 32 l4-3 v6z" fill="currentColor" stroke="none"/><path d="M56 32 l-4-3 v6z" fill="currentColor" stroke="none"/>'),
  div: svgIcon('<rect x="10" y="14" width="44" height="36" rx="2" stroke-dasharray="4,3"/><text x="24" y="36" fill="currentColor" stroke="none" font-size="12">Div</text>'),
  slider: svgIcon('<rect x="6" y="10" width="52" height="44" rx="4"/><path d="M12 32l6-6v12z" fill="currentColor" stroke="none"/><path d="M52 32l-6-6v12z" fill="currentColor" stroke="none"/><circle cx="28" cy="48" r="2" fill="currentColor" stroke="none"/><circle cx="32" cy="48" r="2" fill="currentColor" stroke="none"/><circle cx="36" cy="48" r="2" fill="currentColor" stroke="none"/>'),
  cardsImg: svgIcon('<rect x="4" y="8" width="16" height="24" rx="2"/><rect x="24" y="8" width="16" height="24" rx="2"/><rect x="44" y="8" width="16" height="24" rx="2"/><line x1="7" y1="20" x2="17" y2="20"/><line x1="27" y1="20" x2="37" y2="20"/><line x1="47" y1="20" x2="57" y2="20"/><line x1="7" y1="26" x2="14" y2="26"/><line x1="27" y1="26" x2="34" y2="26"/><line x1="47" y1="26" x2="54" y2="26"/><rect x="7" y="10" width="10" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/><rect x="27" y="10" width="10" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/><rect x="47" y="10" width="10" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>'),
  cardsColor: svgIcon('<rect x="4" y="8" width="16" height="24" rx="2"/><rect x="24" y="8" width="16" height="24" rx="2"/><rect x="44" y="8" width="16" height="24" rx="2"/><line x1="7" y1="22" x2="17" y2="22"/><line x1="27" y1="22" x2="37" y2="22"/><line x1="47" y1="22" x2="57" y2="22"/><line x1="7" y1="28" x2="14" y2="28"/><line x1="27" y1="28" x2="34" y2="28"/><line x1="47" y1="28" x2="54" y2="28"/><rect x="7" y="10" width="10" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.15"/><rect x="27" y="10" width="10" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.15"/><rect x="47" y="10" width="10" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.15"/><line x1="7" y1="14" x2="17" y2="14" stroke-dasharray="2,2"/>'),
  gristTable: svgIcon('<rect x="6" y="10" width="52" height="44" rx="3"/><line x1="6" y1="22" x2="58" y2="22"/><line x1="24" y1="10" x2="24" y2="54"/><line x1="41" y1="10" x2="41" y2="54"/><line x1="6" y1="34" x2="58" y2="34"/><line x1="6" y1="44" x2="58" y2="44"/><rect x="6" y="10" width="52" height="12" fill="currentColor" stroke="none" opacity="0.15"/>'),
  gristForm: svgIcon('<rect x="10" y="6" width="44" height="52" rx="3"/><line x1="16" y1="16" x2="34" y2="16"/><rect x="16" y="20" width="32" height="7" rx="2"/><line x1="16" y1="33" x2="34" y2="33"/><rect x="16" y="37" width="32" height="7" rx="2"/><rect x="16" y="48" width="18" height="7" rx="2" fill="currentColor" stroke="none" opacity="0.2"/>'),
  gristField: svgIcon('<path d="M14 18 h36 M14 18 v8 M50 18 v8" /><rect x="14" y="30" width="24" height="12" rx="2"/><text x="20" y="55" fill="currentColor" stroke="none" font-size="14" font-weight="bold">{ }</text>'),
  gristCards: svgIcon('<rect x="6" y="10" width="22" height="44" rx="3"/><rect x="36" y="10" width="22" height="44" rx="3"/><rect x="9" y="14" width="16" height="12" rx="2" fill="currentColor" stroke="none" opacity="0.15"/><rect x="39" y="14" width="16" height="12" rx="2" fill="currentColor" stroke="none" opacity="0.15"/><line x1="9" y1="32" x2="25" y2="32"/><line x1="39" y1="32" x2="55" y2="32"/><line x1="9" y1="40" x2="21" y2="40"/><line x1="39" y1="40" x2="51" y2="40"/>'),
  code: svgIcon('<rect x="6" y="10" width="52" height="44" rx="4"/><path d="M24 26l-8 6 8 6"/><path d="M40 26l8 6-8 6"/><line x1="35" y1="22" x2="29" y2="42"/>'),
};

// Type d'input HTML déduit du type Grist de la colonne.
function inputTypeFor(gristType: string): string {
  const t = (gristType || '').split(':')[0];
  if (t === 'Numeric' || t === 'Int') return 'number';
  if (t === 'Bool') return 'checkbox';
  if (t === 'Date') return 'date';
  if (t === 'DateTime') return 'datetime-local';
  return 'text';
}

// HTML des champs d'un formulaire Grist (aperçu éditeur ET export), généré depuis les colonnes.
function buildGristFormFields(cols: { colId: string; type: string; label: string }[], submitLabel: string): string {
  if (!cols.length) {
    return '<div style="padding:24px;text-align:center;color:#94a3b8;border:2px dashed #cbd5e1;border-radius:8px;">📝 Formulaire Grist — choisissez une table dans les réglages (panneau de droite).</div>';
  }
  const fields = cols.map(c => {
    const itype = inputTypeFor(c.type);
    const lab = `<label style="display:block;font-size:13px;font-weight:600;color:#334155;margin-bottom:6px;">${escapeHtml(c.label)}</label>`;
    const base = 'width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;box-sizing:border-box;';
    if (itype === 'checkbox') {
      return `<div style="margin-bottom:16px;display:flex;align-items:center;gap:8px;"><input type="checkbox" name="${escapeHtml(c.colId)}" style="width:18px;height:18px;"><label style="font-size:13px;font-weight:600;color:#334155;">${escapeHtml(c.label)}</label></div>`;
    }
    return `<div style="margin-bottom:16px;">${lab}<input type="${itype}" name="${escapeHtml(c.colId)}" style="${base}"></div>`;
  }).join('');
  const btn = `<button type="submit" style="background:#1d4ed8;color:#fff;border:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;">${escapeHtml(submitLabel || 'Envoyer')}</button>`;
  return fields + btn;
}

export interface CardsMap { title?: string; subtitle?: string; image?: string; desc?: string; }

// Construit le HTML d'une grille de cartes (aperçu éditeur ET rendu export).
function buildGristCardsHtml(rows: Record<string, unknown>[], map: CardsMap, cols: number): string {
  if (!map.title && !map.subtitle && !map.image && !map.desc) {
    return '<div style="padding:24px;text-align:center;color:#94a3b8;border:2px dashed #cbd5e1;border-radius:8px;">🃏 Cartes Grist — choisissez une table et mappez au moins un champ (panneau de droite).</div>';
  }
  const list = rows.length ? rows : [{}];
  const cards = list.map(r => {
    const imgU = map.image ? imgFromVal(r[map.image]) : '';
    const img = imgU ? `<img src="${escapeHtml(imgU)}" alt="" style="width:100%;height:160px;object-fit:cover;display:block;background:#f1f5f9;">` : '';
    const title = map.title ? `<h3 style="margin:0 0 4px;font-size:16px;font-weight:700;color:#0f172a;">${escapeHtml(r[map.title] ?? '')}</h3>` : '';
    const subtitle = map.subtitle ? `<div style="font-size:13px;color:#64748b;margin-bottom:8px;">${escapeHtml(r[map.subtitle] ?? '')}</div>` : '';
    const desc = map.desc ? `<p style="margin:0;font-size:14px;color:#475569;line-height:1.5;">${escapeHtml(r[map.desc] ?? '')}</p>` : '';
    return `<div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.06);">${img}<div style="padding:16px;">${title}${subtitle}${desc}</div></div>`;
  }).join('');
  const min = cols > 0 ? Math.floor(1000 / cols) : 240;
  const tmpl = cols > 0 ? `repeat(${cols},1fr)` : `repeat(auto-fill,minmax(${min}px,1fr))`;
  return `<div style="display:grid;grid-template-columns:${tmpl};gap:16px;">${cards}</div>`;
}

// Construit le HTML d'un tableau (aperçu éditeur ET rendu export) à partir des données Grist.
// Valeur image (URL/data-URI ou pièce jointe) -> rend une vignette ; sinon texte.
function cellPreview(v: unknown): string {
  const src = imgFromVal(v);
  if (src) return `<img src="${escapeHtml(src)}" alt="" style="height:44px;width:auto;max-width:120px;object-fit:cover;border-radius:4px;display:block;">`;
  if (Array.isArray(v) && v.some(x => typeof x === 'number')) return '🖼️ (pièce jointe)';  // jeton indispo
  return escapeHtml(v);
}

function buildGristTableHtml(cols: string[], rows: Record<string, unknown>[], opts: { showHeader: boolean }): string {
  if (!cols.length) {
    return '<div style="padding:24px;text-align:center;color:#94a3b8;border:2px dashed #cbd5e1;border-radius:8px;">📊 Tableau Grist — choisissez une table dans les réglages (panneau de droite).</div>';
  }
  const th = opts.showHeader
    ? '<thead><tr>' + cols.map(c => `<th style="text-align:left;padding:10px 12px;border-bottom:2px solid #e2e8f0;background:#f8fafc;font-weight:700;font-size:13px;color:#334155;">${escapeHtml(c)}</th>`).join('') + '</tr></thead>'
    : '';
  const body = '<tbody>' + (rows.length ? rows : [{}]).map(r =>
    '<tr>' + cols.map(c => `<td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#475569;">${cellPreview((r as Record<string, unknown>)[c])}</td>`).join('') + '</tr>'
  ).join('') + '</tbody>';
  return `<table style="width:100%;border-collapse:collapse;background:#fff;">${th}${body}</table>`;
}

export function registerCustomBlocks(editor: Editor) {
  editorRef = editor;
  const bm = editor.Blocks;

  editor.Components.addType('container', {
    model: {
      defaults: {
        tagName: 'div',
        droppable: true,
        attributes: { 'data-gjs-type': 'container' },
        style: {
          'max-width': '1200px',
          'margin': '0 auto',
          'padding': '20px 40px',
        },
        traits: [
          {
            type: 'select',
            label: 'Largeur max',
            name: 'data-width',
            changeProp: true,
            options: [
              { id: '960px', value: '960px', name: '960px — Compact' },
              { id: '1080px', value: '1080px', name: '1080px — Medium' },
              { id: '1200px', value: '1200px', name: '1200px — Standard' },
              { id: '1400px', value: '1400px', name: '1400px — Large' },
              { id: '100%', value: '100%', name: '100% — Pleine largeur' },
            ],
          },
        ],
      },
      init() {
        this.on('change:data-width', this.onWidthChange);
      },
      onWidthChange() {
        const w = this.get('data-width') || '1200px';
        this.addStyle({ 'max-width': w });
      },
    },
  });

  bm.add('container-block', {
    label: 'Container',
    category: 'Basic',
    media: ICONS.container,
    content: { type: 'container' },
  });

  bm.add('div-block', {
    label: 'Div',
    category: 'Basic',
    media: ICONS.div,
    content: {
      tagName: 'div',
      droppable: true,
      style: { padding: '10px' },
    },
  });

  bm.add('blank-section', {
    label: 'Section vierge',
    category: 'Sections',
    media: ICONS.blank,
    content: {
      tagName: 'section',
      droppable: true,
      style: { padding: '60px 40px', 'min-height': '120px' },
    },
  });

  bm.add('hero-section', {
    label: 'Hero',
    category: 'Sections',
    media: ICONS.hero,
    content: `<section style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:80px 40px;text-align:center;">
      <h1 style="font-size:48px;font-weight:800;margin-bottom:16px;">Titre principal</h1>
      <p style="font-size:20px;opacity:0.9;margin-bottom:32px;max-width:600px;margin-left:auto;margin-right:auto;">Description courte de votre projet ou produit</p>
      <a href="#" style="display:inline-block;background:white;color:#764ba2;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:16px;">Commencer</a>
    </section>`,
  });

  // ── Compression/redimension d'image côté navigateur (réduit le poids base64) ──
  function compressImage(file: File, maxW = 1920, quality = 0.82): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const src = reader.result as string;
        // PNG transparents ou GIF : on garde tel quel (pas de recompression JPEG)
        if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
          resolve(src);
          return;
        }
        const img = new Image();
        img.onerror = () => resolve(src);
        img.onload = () => {
          const scale = Math.min(1, maxW / img.width);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(src); return; }
          // Fond blanc pour les PNG à transparence convertis en JPEG
          const hasAlpha = file.type === 'image/png';
          if (hasAlpha) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }
          ctx.drawImage(img, 0, 0, w, h);
          const out = canvas.toDataURL('image/jpeg', quality);
          // On garde le résultat le plus léger
          resolve(out.length < src.length ? out : src);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  }

  // ── Custom file upload trait types ──
  editor.Traits.addType('file-image', {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createInput({ trait }: { trait: any }) {
      const component = trait.target;
      const propName = trait.get('name');
      const el = document.createElement('div');
      el.style.cssText = 'display:flex;flex-direction:column;gap:4px;width:100%;';
      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.placeholder = 'URL ou glisser image...';
      textInput.value = component.get(propName) || '';
      textInput.style.cssText = 'width:100%;padding:5px 8px;border:1px solid #444;border-radius:4px;background:#363b4a;color:#ddd;font-size:12px;box-sizing:border-box;';

      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:4px;';

      const label = document.createElement('label');
      label.style.cssText = 'display:flex;align-items:center;gap:4px;padding:5px 10px;background:#3b82f6;color:white;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;flex:1;justify-content:center;';
      label.textContent = 'Choisir image';
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      label.prepend(fileInput);

      const clearBtn = document.createElement('button');
      clearBtn.textContent = 'X';
      clearBtn.style.cssText = 'padding:5px 8px;background:#ef4444;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:700;';

      btnRow.append(label, clearBtn);

      const preview = document.createElement('div');
      preview.style.cssText = 'width:100%;height:48px;border-radius:4px;background:#2a2e3a;background-size:cover;background-position:center;display:none;border:1px solid #444;';

      const status = document.createElement('div');
      status.style.cssText = 'font-size:11px;color:#94a3b8;display:none;padding:2px 0;';

      el.append(textInput, btnRow, preview, status);

      const showPreview = (url: string) => {
        if (url) { preview.style.backgroundImage = `url('${url}')`; preview.style.display = 'block'; }
        else { preview.style.display = 'none'; preview.style.backgroundImage = ''; }
      };
      const commit = (val: string) => {
        showPreview(val);
        component.set(propName, val);
      };
      showPreview(textInput.value);

      fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        status.textContent = 'Optimisation...';
        status.style.display = 'block';
        compressImage(file).then((b64) => {
          textInput.value = b64;
          const origKB = Math.round(file.size / 1024);
          const newKB = Math.round((b64.length * 0.75) / 1024);
          status.textContent = `${origKB} Ko → ~${newKB} Ko en base64`;
          commit(b64);
        });
      });
      textInput.addEventListener('change', () => commit(textInput.value));
      clearBtn.addEventListener('click', () => {
        textInput.value = '';
        commit('');
      });
      return el;
    },
    onEvent() {},
    onUpdate() {},
  });

  editor.Traits.addType('file-video', {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createInput({ trait }: { trait: any }) {
      const component = trait.target;
      const propName = trait.get('name');
      const el = document.createElement('div');
      el.style.cssText = 'display:flex;flex-direction:column;gap:4px;width:100%;';
      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.placeholder = 'URL ou choisir vidéo...';
      textInput.value = component.get(propName) || '';
      textInput.style.cssText = 'width:100%;padding:5px 8px;border:1px solid #444;border-radius:4px;background:#363b4a;color:#ddd;font-size:12px;box-sizing:border-box;';

      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:4px;';

      const label = document.createElement('label');
      label.style.cssText = 'display:flex;align-items:center;gap:4px;padding:5px 10px;background:#8b5cf6;color:white;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;flex:1;justify-content:center;';
      label.textContent = 'Choisir vidéo';
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'video/mp4,video/webm,video/ogg';
      fileInput.style.display = 'none';
      label.prepend(fileInput);

      const clearBtn = document.createElement('button');
      clearBtn.textContent = 'X';
      clearBtn.style.cssText = 'padding:5px 8px;background:#ef4444;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:700;';

      btnRow.append(label, clearBtn);

      const status = document.createElement('div');
      status.style.cssText = 'font-size:11px;color:#94a3b8;display:none;padding:2px 0;';

      el.append(textInput, btnRow, status);

      fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        status.textContent = 'Conversion en cours...';
        status.style.display = 'block';
        const reader = new FileReader();
        reader.onload = () => {
          const b64 = reader.result as string;
          textInput.value = b64;
          const sizeMB = (b64.length / 1024 / 1024).toFixed(1);
          status.textContent = `Vidéo chargée (${sizeMB} MB en base64)`;
          component.set(propName, b64);
        };
        reader.readAsDataURL(file);
      });
      textInput.addEventListener('change', () => component.set(propName, textInput.value));
      clearBtn.addEventListener('click', () => {
        textInput.value = '';
        status.style.display = 'none';
        component.set(propName, '');
      });
      return el;
    },
    onEvent() {},
    onUpdate() {},
  });

  // ── Hero Pro component type ──
  function buildHeroProChildren(overlayStyle: string, textAnim: string) {
    const uid = 'hero-' + Math.random().toString(36).slice(2, 8);

    // Le mode "image" utilise un background-image CSS sur la section (via addStyle).
    // Le mode "vidéo" ajoute un composant <video> brut (type:default) dans onHeroRebuild,
    // pour éviter que GrapesJS ne le transforme en lecteur vidéo avec contrôles.

    const overlays: Record<string, string> = {
      none: '',
      dark: 'background:rgba(0,0,0,0.55);',
      light: 'background:rgba(255,255,255,0.4);',
      gradient: 'background:linear-gradient(135deg,rgba(102,126,234,0.7),rgba(118,75,162,0.7));',
      'gradient-bottom': 'background:linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 60%);',
      mesh: 'background:linear-gradient(45deg,rgba(102,126,234,0.5) 0%,rgba(244,63,94,0.4) 50%,rgba(251,191,36,0.3) 100%);',
    };
    const overlayCSS = overlays[overlayStyle] || '';
    const overlayEl = overlayCSS ? `<div style="position:absolute;top:0;left:0;right:0;bottom:0;${overlayCSS}z-index:1;"></div>` : '';

    const textAnimClass = textAnim !== 'none' ? `${uid}-anim` : '';

    const animKeyframes: Record<string, string> = {
      'fade-up': `@keyframes ${uid}FadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}`,
      'fade-in': `@keyframes ${uid}FadeIn{from{opacity:0}to{opacity:1}}`,
      'zoom-in': `@keyframes ${uid}ZoomIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}`,
      'slide-right': `@keyframes ${uid}SlideRight{from{opacity:0;transform:translateX(-60px)}to{opacity:1;transform:translateX(0)}}`,
      'typewriter': `@keyframes ${uid}Typewriter{from{width:0}to{width:100%}}@keyframes ${uid}Blink{50%{border-color:transparent}}`,
    };

    const animNames: Record<string, string> = {
      'fade-up': `${uid}FadeUp`,
      'fade-in': `${uid}FadeIn`,
      'zoom-in': `${uid}ZoomIn`,
      'slide-right': `${uid}SlideRight`,
      'typewriter': `${uid}Typewriter`,
    };

    let css = '';
    if (textAnim !== 'none' && animKeyframes[textAnim]) {
      css += animKeyframes[textAnim];
      if (textAnim === 'typewriter') {
        css += `.${uid}-anim h1{overflow:hidden;white-space:nowrap;border-right:3px solid white;width:0;animation:${animNames[textAnim]} 2.5s steps(30) 0.5s forwards,${uid}Blink 0.75s step-end infinite;}`;
        css += `.${uid}-anim p,.${uid}-anim a{opacity:0;animation:${uid}FadeIn 0.8s ease 3s forwards;}`;
        css += `@keyframes ${uid}FadeIn{from{opacity:0}to{opacity:1}}`;
      } else {
        css += `.${uid}-anim h1{opacity:0;animation:${animNames[textAnim]} 0.8s ease 0.3s forwards;}`;
        css += `.${uid}-anim p{opacity:0;animation:${animNames[textAnim]} 0.8s ease 0.6s forwards;}`;
        css += `.${uid}-anim a{opacity:0;animation:${animNames[textAnim]} 0.8s ease 0.9s forwards;}`;
      }
    }

    return `${overlayEl}
      <div class="${uid}-content ${textAnimClass}" style="position:relative;z-index:2;text-align:center;max-width:800px;padding:80px 40px;">
        <h1 style="font-size:56px;font-weight:900;margin-bottom:20px;text-shadow:0 2px 20px rgba(0,0,0,0.3);line-height:1.1;">Titre principal</h1>
        <p style="font-size:22px;opacity:0.92;margin-bottom:36px;text-shadow:0 1px 10px rgba(0,0,0,0.2);line-height:1.6;">Description courte de votre projet ou produit avec un texte accrocheur</p>
        <a href="#" style="display:inline-block;background:white;color:#764ba2;padding:16px 36px;border-radius:8px;font-weight:700;text-decoration:none;font-size:16px;box-shadow:0 4px 20px rgba(0,0,0,0.2);transition:transform 0.2s,box-shadow 0.2s;">Commencer</a>
      </div>
      ${css ? `<style>${css}</style>` : ''}`;
  }

  function applyHeroMedia(cmp: any) {
    const sectionEl = cmp.getEl();
    const bg = cmp.get('hero-bg') || 'gradient';
    if (bg === 'image') {
      const src = cmp.get('hero-bg-image') || 'https://placehold.co/1920x900/667eea/white?text=Hero+Image';
      const parallax = cmp.get('hero-parallax') === 'on';
      // background-image CSS sur la section : présent dans getCss() → export fiable
      cmp.addStyle({
        'background-color': '#1e293b',
        'background-image': `url("${src}")`,
        'background-size': 'cover',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
        'background-attachment': parallax ? 'fixed' : 'scroll',
      });
    } else if (bg === 'video') {
      const src = cmp.get('hero-bg-video') || '';
      if (!src) return;
      const videoComp = cmp.find('video')[0];
      if (videoComp && videoComp.getAttributes().src !== src) videoComp.addAttributes({ src });
      const video = sectionEl?.querySelector('video') as HTMLVideoElement | null;
      if (video) {
        video.muted = true; // requis pour l'autoplay
        if (video.getAttribute('src') !== src) { video.src = src; video.load(); }
      }
    }
  }

  // Type dédié : isComponent:false empêche GrapesJS de le détecter comme son
  // lecteur vidéo natif (qui ajoute contrôles + allowfullscreen et casse le src base64).
  editor.Components.addType('hero-bg-video', {
    isComponent: () => false,
    model: {
      defaults: {
        tagName: 'video',
        droppable: false,
        highlightable: false,
        attributes: { autoplay: true, muted: true, loop: true, playsinline: true },
        style: {
          position: 'absolute', top: '0', left: '0',
          width: '100%', height: '100%', 'object-fit': 'cover', 'z-index': '0',
        },
      },
    },
  });

  const VIDEO_CHILD = { type: 'hero-bg-video' };

  function scheduleMediaApply(cmp: any) {
    const bg = cmp.get('hero-bg') || 'gradient';
    // Mode image : pas d'élément DOM à attendre, on applique le style directement
    if (bg === 'image') { applyHeroMedia(cmp); return; }
    const tryApply = (attempts: number) => {
      const el = cmp.getEl();
      const mediaEl = el && el.querySelector('video');
      if (mediaEl) {
        applyHeroMedia(cmp);
      } else if (attempts < 10) {
        requestAnimationFrame(() => tryApply(attempts + 1));
      }
    };
    requestAnimationFrame(() => tryApply(0));
  }

  editor.Components.addType('hero-pro', {
    model: {
      defaults: {
        tagName: 'section',
        droppable: false,
        'hero-bg': 'gradient',
        'hero-overlay': 'none',
        'hero-text-anim': 'fade-up',
        'hero-parallax': 'off',
        'hero-height': '500px',
        'hero-bg-image': '',
        'hero-bg-video': '',
        style: {
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
          color: 'white',
          'min-height': '500px',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
        traits: [
          {
            type: 'select' as const,
            label: 'Type de fond',
            name: 'hero-bg',
            changeProp: true,
            options: [
              { id: 'gradient', value: 'gradient', name: 'Dégradé' },
              { id: 'image', value: 'image', name: 'Image' },
              { id: 'video', value: 'video', name: 'Vidéo' },
            ],
          },
          {
            type: 'file-image',
            label: 'Image de fond',
            name: 'hero-bg-image',
            changeProp: true,
          },
          {
            type: 'file-video',
            label: 'Vidéo de fond',
            name: 'hero-bg-video',
            changeProp: true,
          },
          {
            type: 'select' as const,
            label: 'Overlay',
            name: 'hero-overlay',
            changeProp: true,
            options: [
              { id: 'none', value: 'none', name: 'Aucun' },
              { id: 'dark', value: 'dark', name: 'Sombre' },
              { id: 'light', value: 'light', name: 'Clair' },
              { id: 'gradient', value: 'gradient', name: 'Dégradé violet' },
              { id: 'gradient-bottom', value: 'gradient-bottom', name: 'Fondu bas' },
              { id: 'mesh', value: 'mesh', name: 'Mesh coloré' },
            ],
          },
          {
            type: 'select' as const,
            label: 'Animation texte',
            name: 'hero-text-anim',
            changeProp: true,
            options: [
              { id: 'none', value: 'none', name: 'Aucune' },
              { id: 'fade-up', value: 'fade-up', name: 'Fade up' },
              { id: 'fade-in', value: 'fade-in', name: 'Fade in' },
              { id: 'zoom-in', value: 'zoom-in', name: 'Zoom in' },
              { id: 'slide-right', value: 'slide-right', name: 'Slide droite' },
              { id: 'typewriter', value: 'typewriter', name: 'Machine à écrire' },
            ],
          },
          {
            type: 'select' as const,
            label: 'Parallax',
            name: 'hero-parallax',
            changeProp: true,
            options: [
              { id: 'off', value: 'off', name: 'Désactivé' },
              { id: 'on', value: 'on', name: 'Activé (image)' },
            ],
          },
          {
            type: 'select' as const,
            label: 'Hauteur',
            name: 'hero-height',
            changeProp: true,
            options: [
              { id: '400px', value: '400px', name: '400px — Compact' },
              { id: '500px', value: '500px', name: '500px — Standard' },
              { id: '600px', value: '600px', name: '600px — Grand' },
              { id: '80vh', value: '80vh', name: '80vh — Presque plein écran' },
              { id: 'fullscreen', value: 'fullscreen', name: '100vh — Plein écran' },
            ],
          },
        ],
        components: buildHeroProChildren('none', 'fade-up'),
      },
      init() {
        this.on('change:hero-bg', this.onHeroRebuild);
        this.on('change:hero-overlay', this.onHeroRebuild);
        this.on('change:hero-text-anim', this.onHeroRebuild);
        this.on('change:hero-parallax', this.onHeroRebuild);
        this.on('change:hero-height', this.onHeroRebuild);
        this.on('change:hero-bg-image', this.onHeroMediaChange);
        this.on('change:hero-bg-video', this.onHeroMediaChange);
      },
      onHeroRebuild() {
        const bg = this.get('hero-bg') || 'gradient';
        const overlay = this.get('hero-overlay') || 'none';
        const anim = this.get('hero-text-anim') || 'fade-up';
        const height = this.get('hero-height') || '500px';
        const h = height === 'fullscreen' ? '100vh' : height;

        const bgStyle = bg === 'gradient' ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' : '#1e293b';
        this.addStyle({ 'min-height': h, background: bgStyle });

        this.components().reset();
        this.components(buildHeroProChildren(overlay, anim));
        if (bg === 'video') this.components().add(VIDEO_CHILD, { at: 0 });
        if (bg !== 'gradient') scheduleMediaApply(this);
      },
      onHeroMediaChange() {
        scheduleMediaApply(this);
      },
    },
    view: {
      onRender() {
        const model = this.model as any;
        if (model.get('hero-bg') !== 'gradient') {
          scheduleMediaApply(model);
        }
      },
    },
  });

  bm.add('hero-pro', {
    label: 'Hero Pro',
    category: 'Sections',
    media: ICONS.heroPro,
    content: { type: 'hero-pro' },
  });

  bm.add('cta-section', {
    label: 'Call to Action',
    category: 'Sections',
    media: ICONS.cta,
    content: `<section style="background:#1e293b;color:white;padding:60px 40px;text-align:center;">
      <h2 style="font-size:32px;font-weight:700;margin-bottom:12px;">Prêt à commencer ?</h2>
      <p style="font-size:16px;opacity:0.8;margin-bottom:24px;">Rejoignez des milliers d'utilisateurs satisfaits</p>
      <a href="#" style="display:inline-block;background:#3b82f6;color:white;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;">S'inscrire gratuitement</a>
    </section>`,
  });

  bm.add('features-grid', {
    label: 'Features',
    category: 'Sections',
    media: ICONS.features,
    content: `<section style="padding:60px 40px;max-width:1000px;margin:0 auto;">
      <h2 style="text-align:center;font-size:28px;font-weight:700;margin-bottom:40px;">Fonctionnalités</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
        <div style="text-align:center;padding:24px;">
          <div style="font-size:40px;margin-bottom:12px;">🚀</div>
          <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;">Rapide</h3>
          <p style="color:#64748b;font-size:14px;">Performance optimale pour tous vos projets</p>
        </div>
        <div style="text-align:center;padding:24px;">
          <div style="font-size:40px;margin-bottom:12px;">🔒</div>
          <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;">Sécurisé</h3>
          <p style="color:#64748b;font-size:14px;">Vos données sont protégées en permanence</p>
        </div>
        <div style="text-align:center;padding:24px;">
          <div style="font-size:40px;margin-bottom:12px;">💡</div>
          <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;">Intuitif</h3>
          <p style="color:#64748b;font-size:14px;">Prise en main immédiate, sans formation</p>
        </div>
      </div>
    </section>`,
  });

  bm.add('testimonial', {
    label: 'Témoignage',
    category: 'Sections',
    media: ICONS.testimonial,
    content: `<section style="padding:60px 40px;background:#f8fafc;">
      <div style="max-width:600px;margin:0 auto;text-align:center;">
        <div style="font-size:48px;color:#cbd5e1;margin-bottom:16px;">"</div>
        <p style="font-size:18px;font-style:italic;color:#475569;margin-bottom:16px;">Ce produit a transformé notre façon de travailler. Je le recommande vivement !</p>
        <p style="font-weight:700;color:#1e293b;">Marie Dupont</p>
        <p style="font-size:13px;color:#94a3b8;">Directrice, Entreprise XYZ</p>
      </div>
    </section>`,
  });

  bm.add('pricing-cards', {
    label: 'Pricing',
    category: 'Sections',
    media: ICONS.pricing,
    content: `<section style="padding:60px 40px;max-width:900px;margin:0 auto;">
      <h2 style="text-align:center;font-size:28px;font-weight:700;margin-bottom:40px;">Tarifs</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
        <div style="border:1px solid #e2e8f0;border-radius:16px;padding:32px;text-align:center;">
          <h3 style="font-size:18px;font-weight:700;">Gratuit</h3>
          <div style="font-size:36px;font-weight:800;margin:16px 0;">0€</div>
          <p style="color:#64748b;font-size:13px;margin-bottom:20px;">Pour démarrer</p>
          <a href="#" style="display:block;padding:10px;background:#e2e8f0;border-radius:8px;text-decoration:none;color:#1e293b;font-weight:600;">Choisir</a>
        </div>
        <div style="border:2px solid #3b82f6;border-radius:16px;padding:32px;text-align:center;background:#eff6ff;">
          <h3 style="font-size:18px;font-weight:700;color:#3b82f6;">Pro</h3>
          <div style="font-size:36px;font-weight:800;margin:16px 0;">29€</div>
          <p style="color:#64748b;font-size:13px;margin-bottom:20px;">/mois</p>
          <a href="#" style="display:block;padding:10px;background:#3b82f6;color:white;border-radius:8px;text-decoration:none;font-weight:600;">Choisir</a>
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:16px;padding:32px;text-align:center;">
          <h3 style="font-size:18px;font-weight:700;">Enterprise</h3>
          <div style="font-size:36px;font-weight:800;margin:16px 0;">99€</div>
          <p style="color:#64748b;font-size:13px;margin-bottom:20px;">/mois</p>
          <a href="#" style="display:block;padding:10px;background:#e2e8f0;border-radius:8px;text-decoration:none;color:#1e293b;font-weight:600;">Contacter</a>
        </div>
      </div>
    </section>`,
  });

  bm.add('faq-section', {
    label: 'FAQ',
    category: 'Sections',
    media: ICONS.faq,
    content: `<section style="padding:60px 40px;max-width:700px;margin:0 auto;">
      <h2 style="text-align:center;font-size:28px;font-weight:700;margin-bottom:32px;">Questions fréquentes</h2>
      <div style="border-bottom:1px solid #e2e8f0;padding:16px 0;">
        <h4 style="font-weight:700;margin-bottom:8px;">Comment ça marche ?</h4>
        <p style="color:#64748b;font-size:14px;">Créez votre page en glissant-déposant des blocs, personnalisez le style, puis exportez.</p>
      </div>
      <div style="border-bottom:1px solid #e2e8f0;padding:16px 0;">
        <h4 style="font-weight:700;margin-bottom:8px;">C'est gratuit ?</h4>
        <p style="color:#64748b;font-size:14px;">Oui, l'outil est entièrement gratuit et open-source.</p>
      </div>
      <div style="padding:16px 0;">
        <h4 style="font-weight:700;margin-bottom:8px;">Puis-je exporter mon code ?</h4>
        <p style="color:#64748b;font-size:14px;">Oui, exportez en HTML/JS ou téléchargez un fichier ZIP prêt à l'emploi.</p>
      </div>
    </section>`,
  });

  const imgColors = ['667eea', 'f5576c', '4facfe', 'f093fb'];
  const gradients = [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#f5af19,#f12711)',
  ];
  const emojis = ['🚀', '🎯', '💡', '⚡'];

  const cardsTrait = {
    type: 'select' as const,
    label: 'Nombre de cartes',
    name: 'card-count',
    changeProp: true,
    options: [
      { id: '1', value: '1', name: '1 carte' },
      { id: '2', value: '2', name: '2 cartes' },
      { id: '3', value: '3', name: '3 cartes' },
      { id: '4', value: '4', name: '4 cartes' },
    ],
  };

  const hoverTrait = {
    type: 'select' as const,
    label: 'Effet au survol',
    name: 'card-hover',
    changeProp: true,
    options: [
      { id: 'none', value: 'none', name: 'Aucun' },
      { id: 'lift', value: 'lift', name: 'Lift (élévation)' },
      { id: 'scale', value: 'scale', name: 'Scale (zoom)' },
      { id: 'glow', value: 'glow', name: 'Glow (lueur)' },
      { id: 'border', value: 'border', name: 'Bordure colorée' },
    ],
  };

  const entranceTrait = {
    type: 'select' as const,
    label: 'Animation entrée',
    name: 'card-entrance',
    changeProp: true,
    options: [
      { id: 'none', value: 'none', name: 'Aucune' },
      { id: 'fade-up', value: 'fade-up', name: 'Fade up' },
      { id: 'fade-in', value: 'fade-in', name: 'Fade in' },
      { id: 'slide-left', value: 'slide-left', name: 'Slide depuis gauche' },
      { id: 'zoom-in', value: 'zoom-in', name: 'Zoom in' },
    ],
  };

  const hoverStyles: Record<string, string> = {
    none: '',
    lift: 'transform:translateY(-8px);box-shadow:0 12px 32px rgba(0,0,0,0.12);',
    scale: 'transform:scale(1.05);box-shadow:0 8px 24px rgba(0,0,0,0.1);',
    glow: 'box-shadow:0 0 24px rgba(59,130,246,0.4);',
    border: 'border-color:#3b82f6 !important;box-shadow:0 0 0 2px #3b82f6;',
  };

  const entranceKeyframes: Record<string, string> = {
    'fade-up': '@keyframes cardFadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}',
    'fade-in': '@keyframes cardFadeIn{from{opacity:0}to{opacity:1}}',
    'slide-left': '@keyframes cardSlideLeft{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}',
    'zoom-in': '@keyframes cardZoomIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}',
  };

  const entranceAnimName: Record<string, string> = {
    'fade-up': 'cardFadeUp',
    'fade-in': 'cardFadeIn',
    'slide-left': 'cardSlideLeft',
    'zoom-in': 'cardZoomIn',
  };

  function applyEffects(this: any) {
    const hover = this.get('card-hover') || 'none';
    const entrance = this.get('card-entrance') || 'none';
    const id = this.ccid || this.cid;

    let existingStyle = this.components().filter((c: any) => c.get('tagName') === 'style')[0];
    if (existingStyle) existingStyle.remove();

    let existingScript = this.components().filter((c: any) => c.get('tagName') === 'script')[0];
    if (existingScript) existingScript.remove();

    let css = '';

    if (hover !== 'none') {
      css += `[data-cards-id="${id}"] > div > div{transition:transform 0.3s ease,box-shadow 0.3s ease,border-color 0.3s ease;}`;
      css += `[data-cards-id="${id}"] > div > div:hover{${hoverStyles[hover]}}`;
    }

    if (entrance !== 'none') {
      css += entranceKeyframes[entrance];
      css += `[data-cards-id="${id}"] > div > div{opacity:0;}`;
      css += `[data-cards-id="${id}"] > div > div.card-visible{animation:${entranceAnimName[entrance]} 0.6s ease forwards;}`;
    }

    if (css) {
      this.components().add({ tagName: 'style', content: css, layerable: false }, { at: 0 });
    }

    this.addAttributes({ 'data-cards-id': id });

    if (entrance !== 'none') {
      const scriptContent = `(function(){
        var el=document.querySelector('[data-cards-id="${id}"]');
        if(!el)return;
        var cards=el.querySelectorAll(':scope > div > div');
        var obs=new IntersectionObserver(function(entries){
          entries.forEach(function(e,i){
            if(e.isIntersecting){
              setTimeout(function(){e.target.classList.add('card-visible')},i*150);
              obs.unobserve(e.target);
            }
          });
        },{threshold:0.15});
        cards.forEach(function(c){obs.observe(c)});
      })();`;
      this.components().add({ tagName: 'script', content: scriptContent, layerable: false });
    }
  }

  function makeImageCard(i: number) {
    return `<div style="border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:white;">
      <img src="https://placehold.co/600x300/${imgColors[i % imgColors.length]}/white?text=Image" alt="Image" style="width:100%;height:180px;object-fit:cover;display:block;" />
      <div style="padding:24px;">
        <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;">Titre de la carte</h3>
        <p style="color:#64748b;font-size:14px;margin-bottom:16px;">Description courte du service ou de la fonctionnalité proposée.</p>
        <a href="#" style="display:inline-block;padding:8px 20px;background:#3b82f6;color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">En savoir plus</a>
      </div>
    </div>`;
  }

  function makeColorCard(i: number) {
    return `<div style="border-radius:16px;overflow:hidden;background:${gradients[i % gradients.length]};color:white;padding:40px 28px;">
      <div style="font-size:40px;margin-bottom:16px;">${emojis[i % emojis.length]}</div>
      <h3 style="font-size:20px;font-weight:700;margin-bottom:10px;">Titre de la carte</h3>
      <p style="font-size:14px;opacity:0.9;margin-bottom:20px;">Description courte du service ou de la fonctionnalité proposée.</p>
      <a href="#" style="display:inline-block;padding:8px 20px;background:rgba(255,255,255,0.2);color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid rgba(255,255,255,0.3);">En savoir plus</a>
    </div>`;
  }

  function cardsCountHandler(this: any, makeCard: (i: number) => string) {
    const count = parseInt(this.get('card-count') || '3', 10);
    const grid = this.components().filter((c: any) => c.get('tagName') === 'div')[0];
    if (!grid) return;
    const cards = grid.components();
    const current = cards.length;
    grid.addStyle({ 'grid-template-columns': `repeat(${Math.min(count, 4)},1fr)` });
    if (count > current) {
      for (let i = current; i < count; i++) cards.add(makeCard(i));
    } else if (count < current) {
      const toRemove = cards.models.slice(count);
      toRemove.forEach((c: any) => c.remove());
    }
  }

  editor.Components.addType('cards-image-section', {
    model: {
      defaults: {
        tagName: 'section',
        droppable: false,
        'card-count': '3',
        'card-hover': 'none',
        'card-entrance': 'none',
        style: { padding: '60px 40px', 'max-width': '1000px', margin: '0 auto' },
        traits: [cardsTrait, hoverTrait, entranceTrait],
        components: `
          <h2 style="text-align:center;font-size:28px;font-weight:700;margin-bottom:40px;">Nos services</h2>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
            ${[0, 1, 2].map(makeImageCard).join('')}
          </div>`,
      },
      init() {
        this.on('change:card-count', this.onCountChange);
        this.on('change:card-hover', this.onEffectChange);
        this.on('change:card-entrance', this.onEffectChange);
      },
      onCountChange() { cardsCountHandler.call(this, makeImageCard); },
      onEffectChange() { applyEffects.call(this); },
    },
  });

  editor.Components.addType('cards-color-section', {
    model: {
      defaults: {
        tagName: 'section',
        droppable: false,
        'card-count': '3',
        'card-hover': 'none',
        'card-entrance': 'none',
        style: { padding: '60px 40px', 'max-width': '1000px', margin: '0 auto' },
        traits: [cardsTrait, hoverTrait, entranceTrait],
        components: `
          <h2 style="text-align:center;font-size:28px;font-weight:700;margin-bottom:40px;">Nos services</h2>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
            ${[0, 1, 2].map(makeColorCard).join('')}
          </div>`,
      },
      init() {
        this.on('change:card-count', this.onCountChange);
        this.on('change:card-hover', this.onEffectChange);
        this.on('change:card-entrance', this.onEffectChange);
      },
      onCountChange() { cardsCountHandler.call(this, makeColorCard); },
      onEffectChange() { applyEffects.call(this); },
    },
  });

  bm.add('cards-image', {
    label: 'Cards Image',
    category: 'Sections',
    media: ICONS.cardsImg,
    content: { type: 'cards-image-section' },
  });

  bm.add('cards-color', {
    label: 'Cards Couleur',
    category: 'Sections',
    media: ICONS.cardsColor,
    content: { type: 'cards-color-section' },
  });

  const navStyles: Record<string, { bg: string; text: string; accent: string; border: string }> = {
    light:  { bg: '#ffffff', text: '#1e293b', accent: '#3b82f6', border: '1px solid #e2e8f0' },
    dark:   { bg: '#1e293b', text: '#e2e8f0', accent: '#60a5fa', border: 'none' },
    transparent: { bg: 'transparent', text: '#ffffff', accent: '#fbbf24', border: 'none' },
    glass:  { bg: 'rgba(255,255,255,0.1)', text: '#ffffff', accent: '#a78bfa', border: '1px solid rgba(255,255,255,0.15)' },
  };

  // Structure de la navbar : classes only, couleurs via variables CSS (héritées
  // du wrapper). Aucun style de couleur en dur → changer le style ne reconstruit
  // pas le contenu et préserve les textes/liens édités.
  function buildNavbarStructure(uid: string) {
    return `<nav class="${uid}">
      <div class="${uid}-container">
        <a class="${uid}-logo" href="#">MonSite</a>
        <div class="${uid}-menu">
          <a class="${uid}-link" href="#">Accueil</a>
          <div class="${uid}-dropdown" data-navdrop>
            <a class="${uid}-link" href="#">Services <span class="${uid}-caret">▾</span></a>
            <div class="${uid}-sub" data-navsub>
              <a class="${uid}-sub-link" href="#">Web Design</a>
              <a class="${uid}-sub-link" href="#">Développement</a>
              <a class="${uid}-sub-link" href="#">SEO</a>
            </div>
          </div>
          <a class="${uid}-link" href="#">À propos</a>
          <a class="${uid}-link" href="#">Contact</a>
          <a class="${uid}-cta" href="#">CTA</a>
        </div>
        <button class="${uid}-burger" onclick="(function(b){var m=b.closest('.${uid}-container').querySelector('.${uid}-menu');m.dataset.open=m.dataset.open==='1'?'0':'1';})(this)"><span></span><span></span><span></span></button>
      </div>
    </nav>`;
  }

  function buildNavbarCss(uid: string) {
    return `
.${uid}{width:100%;background:var(--nav-bg);border-bottom:var(--nav-border);backdrop-filter:var(--nav-blur);-webkit-backdrop-filter:var(--nav-blur);}
.${uid}-container{max-width:var(--nav-width);margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:14px 32px;position:relative;}
.${uid}-logo{font-size:20px;font-weight:800;color:var(--nav-text);text-decoration:none;}
.${uid}-menu{display:flex;gap:4px;align-items:center;}
.${uid}-link{text-decoration:none;color:var(--nav-text);font-weight:600;padding:8px 14px;border-radius:6px;transition:background .2s,color .2s;display:flex;align-items:center;gap:4px;}
.${uid}-link:hover{background:rgba(127,127,127,0.15);}
.${uid}-caret{font-size:10px;}
.${uid}-dropdown{position:relative;}
.${uid}-sub{display:none;position:absolute;top:100%;left:0;background:#fff;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.12);min-width:200px;padding:6px 0;z-index:1000;}
.${uid}-dropdown:hover .${uid}-sub,.${uid}-sub[data-open="1"]{display:block;animation:${uid}Drop .2s ease;}
.${uid}-sub-link{display:block;padding:10px 18px;color:#1e293b;text-decoration:none;font-size:14px;font-weight:500;transition:background .15s;}
.${uid}-sub-link:hover{background:#f1f5f9;}
.${uid}-cta{display:inline-block;margin-left:12px;padding:8px 20px;background:var(--nav-accent);color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;}
.${uid}-burger{display:none;background:none;border:none;cursor:pointer;padding:6px;}
.${uid}-burger span{display:block;width:24px;height:2px;background:var(--nav-text);margin:5px 0;}
@keyframes ${uid}Drop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:768px){.${uid}-menu{display:none;}.${uid}-burger{display:block;}.${uid}-menu[data-open="1"]{display:flex;flex-direction:column;position:absolute;top:100%;left:0;right:0;background:var(--nav-mobile-bg);padding:16px;z-index:999;}}`;
  }

  function navVars(style: string, width: string) {
    const s = navStyles[style] || navStyles.light;
    return {
      '--nav-bg': s.bg,
      '--nav-text': s.text,
      '--nav-accent': s.accent,
      '--nav-border': s.border,
      '--nav-blur': style === 'glass' ? 'blur(12px)' : 'none',
      '--nav-width': width,
      '--nav-mobile-bg': s.bg === 'transparent' ? '#1e293b' : s.bg,
    };
  }

  editor.Components.addType('advanced-navbar', {
    model: {
      defaults: {
        tagName: 'div',
        droppable: false,
        'nav-style': 'light',
        'nav-width': '1200px',
        'nav-uid': '',
        traits: [
          {
            type: 'select' as const,
            label: 'Style',
            name: 'nav-style',
            changeProp: true,
            options: [
              { id: 'light', value: 'light', name: 'Light (clair)' },
              { id: 'dark', value: 'dark', name: 'Dark (sombre)' },
              { id: 'transparent', value: 'transparent', name: 'Transparent' },
              { id: 'glass', value: 'glass', name: 'Glass (vitreux)' },
            ],
          },
          {
            type: 'select' as const,
            label: 'Largeur container',
            name: 'nav-width',
            changeProp: true,
            options: [
              { id: '960px', value: '960px', name: '960px — Compact' },
              { id: '1080px', value: '1080px', name: '1080px — Medium' },
              { id: '1200px', value: '1200px', name: '1200px — Standard' },
              { id: '1400px', value: '1400px', name: '1400px — Large' },
              { id: '100%', value: '100%', name: '100% — Pleine largeur' },
            ],
          },
        ],
      },
      init() {
        if (!this.get('nav-uid')) {
          this.set('nav-uid', 'navp-' + Math.random().toString(36).slice(2, 8));
        }
        // Construction unique (pas au rechargement d'un projet sauvegardé)
        if (this.components().length === 0) {
          const uid = this.get('nav-uid');
          this.append(buildNavbarStructure(uid));
          this.append({ tagName: 'style', type: 'default', content: buildNavbarCss(uid), layerable: false, selectable: false, droppable: false });
        }
        this.applyNavVars();
        this.on('change:nav-style', this.applyNavVars);
        this.on('change:nav-width', this.applyNavVars);
      },
      applyNavVars() {
        const style = this.get('nav-style') || 'light';
        const width = this.get('nav-width') || '1200px';
        // Variables CSS sur le wrapper : mises à jour en place, sans toucher au contenu
        this.addStyle(navVars(style, width));
      },
    },
  });

  // Éditeur : garder le sous-menu ouvert quand on le sélectionne (sinon impossible à éditer)
  let navOpenSub: HTMLElement | null = null;
  const closeNavSub = () => { if (navOpenSub) { navOpenSub.removeAttribute('data-open'); navOpenSub = null; } };
  editor.on('component:selected', (sel: any) => {
    const el: HTMLElement | undefined = sel?.getEl?.();
    const drop = el?.closest?.('[data-navdrop]') as HTMLElement | null;
    const sub = drop?.querySelector('[data-navsub]') as HTMLElement | null;
    if (sub !== navOpenSub) closeNavSub();
    if (sub) { sub.setAttribute('data-open', '1'); navOpenSub = sub; }
  });
  editor.on('component:deselected', closeNavSub);

  // ── Bouton "+▾" : convertit un item de menu simple en menu déroulant ──
  editor.Commands.add('navbar-to-dropdown', {
    run(ed: any) {
      const cmp = ed.getSelected();
      if (!cmp) return;
      const parent = cmp.parent();
      if (!parent) return;
      const idx = parent.components().indexOf(cmp);
      const text = ((cmp.getEl()?.textContent || 'Menu').trim()) || 'Menu';
      const href = cmp.getAttributes().href || '#';
      let uid = '';
      let p: any = cmp;
      while (p) { const u = p.get?.('nav-uid'); if (u) { uid = u; break; } p = p.parent?.(); }
      if (!uid) return;
      const html = `<div class="${uid}-dropdown" data-navdrop>
        <a class="${uid}-link" href="${href}">${text} <span class="${uid}-caret">▾</span></a>
        <div class="${uid}-sub" data-navsub>
          <a class="${uid}-sub-link" href="#">Sous-menu 1</a>
          <a class="${uid}-sub-link" href="#">Sous-menu 2</a>
        </div>
      </div>`;
      const added = parent.components().add(html, { at: idx });
      cmp.remove();
      ed.select(Array.isArray(added) ? added[0] : added);
    },
  });

  function isConvertibleNavLink(cmp: any): boolean {
    const el = cmp?.getEl?.() as HTMLElement | undefined;
    if (!el || el.tagName !== 'A') return false;
    if (!/-link\b/.test(el.className) || /-cta\b/.test(el.className)) return false;
    const par = el.parentElement;
    return !!par && /-menu\b/.test(par.className);
  }

  editor.on('component:selected', (cmp: any) => {
    if (!isConvertibleNavLink(cmp)) return;
    const tb = [...(cmp.get('toolbar') || [])];
    if (!tb.some((t: any) => t.command === 'navbar-to-dropdown')) {
      tb.push({
        attributes: { class: 'gjs-toolbar-item nav-conv-btn', title: 'Transformer en menu déroulant' },
        command: 'navbar-to-dropdown',
      });
      cmp.set('toolbar', tb);
    }
  });

  // Icône du bouton (rendu dans le document parent, hors iframe)
  if (!document.getElementById('nav-conv-style')) {
    const st = document.createElement('style');
    st.id = 'nav-conv-style';
    st.textContent = '.gjs-toolbar-item.nav-conv-btn::before{content:"+\\25BE";font-size:12px;font-weight:700;line-height:1;}';
    document.head.appendChild(st);
  }

  bm.add('navbar-pro', {
    label: 'Navbar Pro',
    category: 'Navigation',
    media: ICONS.navbar,
    content: { type: 'advanced-navbar' },
  });

  bm.add('footer-block', {
    label: 'Footer',
    category: 'Navigation',
    media: ICONS.footer,
    content: `<footer style="background:#1e293b;color:#94a3b8;padding:40px 32px;text-align:center;">
      <p style="margin-bottom:8px;">© 2026 MonSite. Tous droits réservés.</p>
      <div style="display:flex;gap:16px;justify-content:center;">
        <a href="#" style="color:#94a3b8;text-decoration:none;">Mentions légales</a>
        <a href="#" style="color:#94a3b8;text-decoration:none;">Confidentialité</a>
        <a href="#" style="color:#94a3b8;text-decoration:none;">Contact</a>
      </div>
    </footer>`,
  });

  bm.add('slider-block', {
    label: 'Slider',
    category: 'Extra',
    media: ICONS.slider,
    content: `<div class="simple-slider" style="position:relative;overflow:hidden;width:100%;max-width:900px;margin:0 auto;">
      <div class="slider-track" style="display:flex;transition:transform 0.5s ease;">
        <div class="slider-slide" style="min-width:100%;padding:60px 40px;text-align:center;background:linear-gradient(135deg,#667eea,#764ba2);color:white;">
          <h2 style="font-size:32px;font-weight:800;">Slide 1</h2>
          <p style="font-size:16px;opacity:0.9;">Description de la première slide</p>
        </div>
        <div class="slider-slide" style="min-width:100%;padding:60px 40px;text-align:center;background:linear-gradient(135deg,#f093fb,#f5576c);color:white;">
          <h2 style="font-size:32px;font-weight:800;">Slide 2</h2>
          <p style="font-size:16px;opacity:0.9;">Description de la deuxième slide</p>
        </div>
        <div class="slider-slide" style="min-width:100%;padding:60px 40px;text-align:center;background:linear-gradient(135deg,#4facfe,#00f2fe);color:white;">
          <h2 style="font-size:32px;font-weight:800;">Slide 3</h2>
          <p style="font-size:16px;opacity:0.9;">Description de la troisième slide</p>
        </div>
      </div>
      <button class="slider-prev" style="position:absolute;top:50%;left:10px;transform:translateY(-50%);background:rgba(255,255,255,0.8);border:none;width:40px;height:40px;border-radius:50%;font-size:20px;cursor:pointer;" onclick="(function(b){var s=b.closest('.simple-slider').querySelector('.slider-track');var w=s.parentElement.offsetWidth;var m=-(s.children.length-1)*w;var t=parseFloat(s.style.transform.replace('translateX(','').replace('px)',''))||0;s.style.transform='translateX('+Math.min(0,t+w)+'px)'})(this)">‹</button>
      <button class="slider-next" style="position:absolute;top:50%;right:10px;transform:translateY(-50%);background:rgba(255,255,255,0.8);border:none;width:40px;height:40px;border-radius:50%;font-size:20px;cursor:pointer;" onclick="(function(b){var s=b.closest('.simple-slider').querySelector('.slider-track');var w=s.parentElement.offsetWidth;var m=-(s.children.length-1)*w;var t=parseFloat(s.style.transform.replace('translateX(','').replace('px)',''))||0;s.style.transform='translateX('+Math.max(m,t-w)+'px)'})(this)">›</button>
    </div>`,
  });

  bm.add('separator', {
    label: 'Séparateur',
    category: 'Base',
    media: ICONS.separator,
    content: '<hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;">',
  });

  bm.add('spacer', {
    label: 'Espace',
    category: 'Base',
    media: ICONS.spacer,
    content: '<div style="height:60px;"></div>',
  });

  // ===== Bloc dynamique : Tableau Grist (lit une table du document) =====
  editor.Components.addType('grist-table', {
    isComponent: (el: HTMLElement) => el.tagName === 'DIV' && el.hasAttribute?.('data-grist-table'),
    model: {
      defaults: {
        tagName: 'div',
        name: 'Tableau Grist',
        droppable: false,
        editable: false,
        attributes: { 'data-grist-table': '', 'data-grist-cols': '', 'data-grist-limit': '50', 'data-grist-header': '1' },
        style: { 'overflow-x': 'auto', 'margin': '16px 0' },
        traits: [
          { type: 'select', name: 'data-grist-table', label: 'Table Grist', options: [{ id: '', name: '— choisir —' }] },
          { type: 'text', name: 'data-grist-cols', label: 'Colonnes (vide = toutes)', placeholder: 'Col1, Col2' },
          { type: 'number', name: 'data-grist-limit', label: 'Nb lignes max' },
          { type: 'checkbox', name: 'data-grist-header', label: 'En-tête', valueTrue: '1', valueFalse: '0' },
        ],
      },
      init(this: any) {
        this.on('change:attributes:data-grist-table change:attributes:data-grist-cols change:attributes:data-grist-limit change:attributes:data-grist-header', this.refreshPreview);
        this.refreshPreview();
      },
      async refreshPreview(this: any) {
        const a: Record<string, string> = this.getAttributes();
        const name = a['data-grist-table'];
        const showHeader = a['data-grist-header'] !== '0';
        if (!name) { this.components(buildGristTableHtml([], [], { showHeader })); lockDescendants(this); return; }
        const limit = parseInt(a['data-grist-limit'] || '50', 10) || 0;
        const wanted = (a['data-grist-cols'] || '').split(',').map(s => s.trim()).filter(Boolean);
        await ensureTok();
        const data = await fetchTableData(name);
        const cols = wanted.length ? wanted.filter(c => data.cols.indexOf(c) !== -1) : data.cols;
        const rows = limit > 0 ? data.rows.slice(0, limit) : data.rows;
        this.components(buildGristTableHtml(cols.length ? cols : data.cols, rows, { showHeader }));
        lockDescendants(this);
      },
    } as unknown as Record<string, unknown>,
  });

  bm.add('grist-table-block', {
    label: 'Tableau Grist',
    category: 'Données Grist',
    media: ICONS.gristTable,
    content: { type: 'grist-table' },
  });

  // ===== Bloc dynamique : Champ Grist (insère la valeur d'une colonne — publipostage) =====
  editor.Components.addType('grist-field', {
    isComponent: (el: HTMLElement) => el.tagName === 'SPAN' && el.hasAttribute?.('data-grist-field-table'),
    model: {
      defaults: {
        tagName: 'span',
        name: 'Champ Grist',
        droppable: false,
        editable: false,
        attributes: { 'data-grist-field-table': '', 'data-grist-field-col': '', 'data-grist-field-row': '1' },
        style: { 'display': 'inline-block' },
        traits: [
          { type: 'select', name: 'data-grist-field-table', label: 'Table', options: [{ id: '', name: '— choisir —' }] },
          { type: 'select', name: 'data-grist-field-col', label: 'Colonne', options: [{ id: '', name: '— choisir —' }] },
          { type: 'number', name: 'data-grist-field-row', label: 'N° de ligne', min: 1 },
        ],
      },
      init(this: any) {
        this.on('change:attributes:data-grist-field-table', this.onTableChange);
        this.on('change:attributes:data-grist-field-col change:attributes:data-grist-field-row', this.refreshField);
        populateColTrait(this, 'data-grist-field-table', 'data-grist-field-col');
        this.refreshField();
      },
      async onTableChange(this: any) {
        this.addAttributes({ 'data-grist-field-col': '' });
        await populateColTrait(this, 'data-grist-field-table', 'data-grist-field-col');
        this.refreshField();
      },
      async refreshField(this: any) {
        const a: Record<string, string> = this.getAttributes();
        const table = a['data-grist-field-table'];
        const col = a['data-grist-field-col'];
        const rowIdx = Math.max(1, parseInt(a['data-grist-field-row'] || '1', 10) || 1);
        if (!table || !col) { this.components('{{ champ }}'); lockDescendants(this); return; }
        await ensureTok();
        const data = await fetchTableData(table);
        const row = data.rows[rowIdx - 1];
        const val = row ? row[col] : '';
        const src = imgFromVal(val);
        if (src) this.components(`<img src="${escapeHtml(src)}" alt="" style="max-width:100%;height:auto;display:block;border-radius:6px;">`);
        else this.components(escapeHtml(val == null || val === '' ? '(vide)' : String(val)));
        lockDescendants(this);
      },
    } as unknown as Record<string, unknown>,
  });

  bm.add('grist-field-block', {
    label: 'Champ Grist',
    category: 'Données Grist',
    media: ICONS.gristField,
    content: { type: 'grist-field' },
  });

  // ===== Bloc dynamique : Cartes Grist (une carte par ligne, colonnes mappées) =====
  editor.Components.addType('grist-cards', {
    isComponent: (el: HTMLElement) => el.tagName === 'DIV' && el.hasAttribute?.('data-grist-cards-table'),
    model: {
      defaults: {
        tagName: 'div',
        name: 'Cartes Grist',
        droppable: false,
        editable: false,
        attributes: {
          'data-grist-cards-table': '', 'data-grist-cards-title': '', 'data-grist-cards-subtitle': '',
          'data-grist-cards-image': '', 'data-grist-cards-desc': '', 'data-grist-cards-limit': '12', 'data-grist-cards-cols': '0',
        },
        style: { 'margin': '16px 0' },
        traits: [
          { type: 'select', name: 'data-grist-cards-table', label: 'Table', options: [{ id: '', name: '— choisir —' }] },
          { type: 'select', name: 'data-grist-cards-title', label: 'Champ Titre', options: [{ id: '', name: '— choisir —' }] },
          { type: 'select', name: 'data-grist-cards-subtitle', label: 'Champ Sous-titre', options: [{ id: '', name: '— choisir —' }] },
          { type: 'select', name: 'data-grist-cards-image', label: 'Champ Image (URL)', options: [{ id: '', name: '— choisir —' }] },
          { type: 'select', name: 'data-grist-cards-desc', label: 'Champ Description', options: [{ id: '', name: '— choisir —' }] },
          { type: 'number', name: 'data-grist-cards-limit', label: 'Nb cartes max', min: 0 },
          { type: 'number', name: 'data-grist-cards-cols', label: 'Colonnes (0 = auto)', min: 0 },
        ],
      },
      init(this: any) {
        this.on('change:attributes:data-grist-cards-table', this.onTableChange);
        this.on('change:attributes:data-grist-cards-title change:attributes:data-grist-cards-subtitle change:attributes:data-grist-cards-image change:attributes:data-grist-cards-desc change:attributes:data-grist-cards-limit change:attributes:data-grist-cards-cols', this.refreshCards);
        populateSelectedColTraits(this);
        this.refreshCards();
      },
      async onTableChange(this: any) {
        this.addAttributes({ 'data-grist-cards-title': '', 'data-grist-cards-subtitle': '', 'data-grist-cards-image': '', 'data-grist-cards-desc': '' });
        populateSelectedColTraits(this);
        this.refreshCards();
      },
      async refreshCards(this: any) {
        const a: Record<string, string> = this.getAttributes();
        const table = a['data-grist-cards-table'];
        const map = {
          title: a['data-grist-cards-title'] || undefined,
          subtitle: a['data-grist-cards-subtitle'] || undefined,
          image: a['data-grist-cards-image'] || undefined,
          desc: a['data-grist-cards-desc'] || undefined,
        };
        const limit = parseInt(a['data-grist-cards-limit'] || '0', 10) || 0;
        const cols = parseInt(a['data-grist-cards-cols'] || '0', 10) || 0;
        if (!table) { this.components(buildGristCardsHtml([], {}, cols)); lockDescendants(this); return; }
        await ensureTok();
        const data = await fetchTableData(table);
        const rows = limit > 0 ? data.rows.slice(0, limit) : data.rows;
        this.components(buildGristCardsHtml(rows, map, cols));
        lockDescendants(this);
      },
    } as unknown as Record<string, unknown>,
  });

  bm.add('grist-cards-block', {
    label: 'Cartes Grist',
    category: 'Données Grist',
    media: ICONS.gristCards,
    content: { type: 'grist-cards' },
  });

  // ===== Bloc dynamique : Formulaire Grist (crée une ligne dans une table) =====
  editor.Components.addType('grist-form', {
    isComponent: (el: HTMLElement) => el.tagName === 'FORM' && el.hasAttribute?.('data-grist-form'),
    model: {
      defaults: {
        tagName: 'form',
        name: 'Formulaire Grist',
        droppable: false,
        attributes: { 'data-grist-form': '', 'data-grist-msg': 'Enregistré ✓' },
        style: { 'max-width': '480px', 'margin': '16px 0', 'padding': '24px', 'background': '#fff', 'border': '1px solid #e2e8f0', 'border-radius': '12px' },
        traits: [
          { type: 'select', name: 'data-grist-form', label: 'Table cible', options: [{ id: '', name: '— choisir —' }] },
          { type: 'text', name: 'data-submit-label', label: 'Texte du bouton', placeholder: 'Envoyer' },
          { type: 'text', name: 'data-grist-msg', label: 'Message de succès' },
        ],
      },
      init(this: any) {
        this.on('change:attributes:data-grist-form change:attributes:data-submit-label', this.refreshForm);
        this.refreshForm();
      },
      async refreshForm(this: any) {
        const a: Record<string, string> = this.getAttributes();
        const name = a['data-grist-form'];
        const submitLabel = a['data-submit-label'] || 'Envoyer';
        if (!name) { this.components(buildGristFormFields([], submitLabel)); lockDescendants(this); return; }
        const cols = await fetchWritableColumns(name);
        this.components(buildGristFormFields(cols, submitLabel));
        lockDescendants(this);
      },
    } as unknown as Record<string, unknown>,
  });

  bm.add('grist-form-block', {
    label: 'Formulaire Grist',
    category: 'Données Grist',
    media: ICONS.gristForm,
    content: { type: 'grist-form' },
  });

  // ===== Bloc « Code HTML + JS » (2 zones séparées, sans coder dans un éditeur unique) =====
  const codePlaceholder = '<div data-ce-ph="1" style="padding:18px;color:#94a3b8;border:2px dashed #cbd5e1;border-radius:8px;text-align:center;font-family:sans-serif;">&lt;/&gt; Code HTML + JS — double-cliquez pour éditer</div>';
  editor.Components.addType('code-embed', {
    isComponent: (el: HTMLElement) => el.tagName === 'DIV' && el.classList?.contains('dw-code-embed'),
    model: {
      defaults: {
        tagName: 'div', name: 'Code HTML/CSS + JS', classes: ['dw-code-embed'], droppable: false,
        style: { 'min-height': '40px', margin: '12px 0' },
        'ce-html': '', 'ce-js': '',   // sources conservées (HTML+CSS / JavaScript) pour ré-édition fidèle
      },
      init(this: any) {
        const hasSrc = String(this.get('ce-html') || '').trim() || String(this.get('ce-js') || '').trim();
        if (hasSrc) {
          this.ceRender();
        } else {
          // Chargement d'une page sauvegardée : reconstruire les sources depuis les enfants persistés
          const kids = this.components();
          const sc = kids.filter((c: any) => c.get('tagName') === 'script')[0];
          const js = sc ? (sc.get('content') || '') : '';
          const htmlCss = kids
            .filter((c: any) => c.get('tagName') !== 'script' && !c.getAttributes?.()['data-ce-ph'])
            .map((c: any) => c.toHTML()).join('');
          if (htmlCss || js) this.set({ 'ce-html': htmlCss, 'ce-js': js }, { silent: true });
          else if (!kids.length) this.components(codePlaceholder);
        }
        this.on('change:ce-html change:ce-js', this.ceRender);
        const tb = this.get('toolbar') || [];
        if (!tb.some((x: any) => x.command === 'open-code-embed')) {
          tb.unshift({ attributes: { title: 'Éditer le code' }, label: '&lt;/&gt;', command: 'open-code-embed' });
          this.set('toolbar', tb);
        }
      },
      ceRender(this: any) {
        const htmlCss = String(this.get('ce-html') || '');
        const js = String(this.get('ce-js') || '');
        this.components(htmlCss.trim() ? htmlCss : codePlaceholder);
        if (js.trim()) {
          this.append({ tagName: 'script', attributes: { type: 'text/embed-js' }, content: js, selectable: false, layerable: false, draggable: false, copyable: false, removable: false, hoverable: false });
        }
      },
      // Export VERBATIM : on ressort le HTML/CSS collé tel quel (GrapesJS ne le réinterprète pas,
      // donc le <style> et les règles type .square.light restent intactes) + le JS en script différé.
      toHTML(this: any) {
        const htmlCss = String(this.get('ce-html') || '');
        const js = String(this.get('ce-js') || '');
        const script = js.trim() ? '<script type="text/embed-js">' + js + '<' + '/script>' : '';
        return '<div class="dw-code-embed">' + (htmlCss.trim() ? htmlCss : '') + script + '</div>';
      },
    } as unknown as Record<string, unknown>,
    view: {
      events: { dblclick: 'onCeEdit' },
      onCeEdit(this: any) { editor.runCommand('open-code-embed', { target: this.model }); },
    } as unknown as Record<string, unknown>,
  });

  editor.Commands.add('open-code-embed', {
    run(ed: any, _s: any, opts: any = {}) {
      const target = opts.target || ed.getSelected();
      if (!target || target.get('type') !== 'code-embed') return;
      const wrap = document.createElement('div');
      const taStyle = 'width:100%;height:220px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;padding:10px;border:1px solid #cbd5e1;border-radius:8px;box-sizing:border-box;resize:vertical;background:#ffffff;color:#0f172a;';
      wrap.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px;min-width:600px;">
          <div style="font-size:12px;color:#94a3b8;">Comme le « custom widget builder » de Grist : HTML + CSS d'un côté, JavaScript de l'autre. Collez le code de votre widget existant.</div>
          <div>
            <label style="display:block;font-weight:700;font-size:13px;margin-bottom:6px;color:#e2e8f0;">HTML / CSS <span style="font-weight:400;color:#94a3b8;">(le CSS peut être dans une balise &lt;style&gt;…&lt;/style&gt;)</span></label>
            <textarea id="ce-html" spellcheck="false" style="${taStyle}"></textarea>
          </div>
          <div>
            <label style="display:block;font-weight:700;font-size:13px;margin-bottom:6px;color:#e2e8f0;">JavaScript <span style="font-weight:400;color:#94a3b8;">(sans la balise &lt;script&gt; ; s'exécute sur la page publiée, pas dans l'éditeur)</span></label>
            <textarea id="ce-js" spellcheck="false" style="${taStyle.replace('height:220px', 'height:180px')}"></textarea>
          </div>
          <div style="text-align:right;"><button id="ce-save" style="background:#1d4ed8;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;">Enregistrer</button></div>
        </div>`;
      const taH = wrap.querySelector('#ce-html') as HTMLTextAreaElement;
      const taJ = wrap.querySelector('#ce-js') as HTMLTextAreaElement;
      taH.value = String(target.get('ce-html') || '');
      taJ.value = String(target.get('ce-js') || '');
      (wrap.querySelector('#ce-save') as HTMLButtonElement).addEventListener('click', () => {
        target.set('ce-html', taH.value);
        target.set('ce-js', taJ.value);
        ed.Modal.close();
      });
      ed.Modal.open({ title: 'Code HTML/CSS + JavaScript', content: wrap });
    },
  });

  bm.add('code-embed-block', {
    label: 'Code HTML/CSS + JS',
    category: 'Extra',
    media: ICONS.code,
    content: { type: 'code-embed' },
  });

  // Renseigne dynamiquement la liste des tables dans le réglage des blocs Grist sélectionnés.
  // Si l'utilisateur clique sur un descendant de l'aperçu, on re-sélectionne le bloc Grist parent.
  editor.on('component:selected', (cmp: any) => {
    if (!cmp) return;
    if (gristTraitName(cmp)) { applyTableOptions(cmp); populateSelectedColTraits(cmp); return; }
    let anc = cmp.parent?.();
    while (anc) {
      if (gristTraitName(anc)) { editor.select(anc); return; }
      anc = anc.parent?.();
    }
  });
}
