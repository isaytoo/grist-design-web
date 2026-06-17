import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Editor } from 'grapesjs';

export function getExportData(editor: Editor) {
  const html = editor.getHtml();
  const css = editor.getCss() || '';
  const js = editor.getJs() || '';

  const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page</title>
  <script src="https://docs.getgrist.com/grist-plugin-api.js"><\/script>
  <style>
* { box-sizing: border-box; }
body { margin: 0; }
${css}
  </style>
</head>
<body>
${html}
  <script src="widget.js"><\/script>
</body>
</html>`;

  const fullJs = `// Widget JavaScript
${js || '// (votre JS personnalisé)'}

// ===== Liaison données Grist (généré par Grist Design Web) =====
// - [data-grist-table] : affiche une table du document
// - {{Table.Colonne}}  : insère la 1re ligne (publipostage)
// - <form data-grist-form="MaTable"> : à la soumission, crée une ligne (champs name=Colonne)
(function () {
  if (typeof grist === 'undefined') return;
  grist.ready({ requiredAccess: 'full' });

  function esc(s) { s = (s == null ? '' : '' + s); return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function toObjects(d) {
    if (!d || !d.id) return { cols: [], rows: [] };
    var cols = Object.keys(d).filter(function (c) { return c !== 'id' && c !== 'manualSort'; });
    var rows = d.id.map(function (_, i) { var o = {}; cols.forEach(function (c) { o[c] = d[c][i]; }); return o; });
    return { cols: cols, rows: rows };
  }

  function renderTables() {
    var els = document.querySelectorAll('[data-grist-table]');
    Array.prototype.forEach.call(els, function (el) {
      var name = el.getAttribute('data-grist-table'); if (!name) return;
      grist.docApi.fetchTable(name).then(function (d) {
        var t = toObjects(d);
        var wanted = (el.getAttribute('data-grist-cols') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        var cols = wanted.length ? wanted.filter(function (c) { return t.cols.indexOf(c) !== -1; }) : t.cols;
        if (!cols.length) cols = t.cols;
        var limit = parseInt(el.getAttribute('data-grist-limit') || '0', 10);
        var rows = limit > 0 ? t.rows.slice(0, limit) : t.rows;
        var showHead = el.getAttribute('data-grist-header') !== '0';
        var th = showHead ? '<thead><tr>' + cols.map(function (c) { return '<th style="text-align:left;padding:10px 12px;border-bottom:2px solid #e2e8f0;background:#f8fafc;font-weight:700;font-size:13px;color:#334155;">' + esc(c) + '</th>'; }).join('') + '</tr></thead>' : '';
        var body = '<tbody>' + rows.map(function (r) { return '<tr>' + cols.map(function (c) { return '<td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#475569;">' + esc(r[c]) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody>';
        el.innerHTML = '<table style="width:100%;border-collapse:collapse;background:#fff;">' + th + body + '</table>';
      }).catch(function () {});
    });
  }

  function fillPlaceholders() {
    var reg = /\\{\\{\\s*([A-Za-z0-9_]+)\\.([A-Za-z0-9_]+)\\s*\\}\\}/g;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [], tables = {};
    while (walker.nextNode()) {
      var node = walker.currentNode; reg.lastIndex = 0;
      if (reg.test(node.nodeValue)) { nodes.push(node); reg.lastIndex = 0; var mm; while ((mm = reg.exec(node.nodeValue))) { tables[mm[1]] = 1; } }
    }
    var names = Object.keys(tables); if (!names.length) return;
    Promise.all(names.map(function (n) { return grist.docApi.fetchTable(n).then(function (d) { return { n: n, d: d }; }).catch(function () { return { n: n, d: null }; }); }))
      .then(function (res) {
        var map = {}; res.forEach(function (r) { map[r.n] = r.d; });
        nodes.forEach(function (node) {
          node.nodeValue = node.nodeValue.replace(reg, function (full, t, c) {
            var d = map[t]; if (d && d.id && d.id.length && d[c]) { var v = d[c][0]; return v == null ? '' : '' + v; } return '';
          });
        });
      });
  }

  function bindForms() {
    Array.prototype.forEach.call(document.querySelectorAll('form[data-grist-form]'), function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var table = f.getAttribute('data-grist-form'); if (!table) return;
        var rec = {};
        Array.prototype.forEach.call(f.querySelectorAll('[name]'), function (inp) {
          var n = inp.getAttribute('name'); if (!n) return;
          rec[n] = (inp.type === 'checkbox') ? inp.checked : inp.value;
        });
        grist.docApi.applyUserActions([['AddRecord', table, null, rec]]).then(function () {
          var ok = document.createElement('div');
          ok.textContent = f.getAttribute('data-grist-msg') || 'Enregistré ✓';
          ok.style.cssText = 'margin-top:10px;color:#16a34a;font-weight:600;';
          f.appendChild(ok); f.reset(); renderTables();
          setTimeout(function () { ok.remove(); }, 3000);
        }).catch(function (err) { alert('Erreur Grist : ' + (err && err.message || err)); });
      });
    });
  }

  function run() { fillPlaceholders(); renderTables(); bindForms(); }
  if (document.readyState !== 'loading') run(); else document.addEventListener('DOMContentLoaded', run);
})();
`;

  return { html: fullHtml, js: fullJs, rawHtml: html, rawCss: css, rawJs: js };
}

export async function downloadZip(editor: Editor, pageName: string) {
  const { html, js } = getExportData(editor);
  const zip = new JSZip();
  zip.file('index.html', html);
  zip.file('widget.js', js);
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, (pageName || 'page') + '.zip');
}
