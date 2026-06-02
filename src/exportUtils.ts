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
${css}
  </style>
</head>
<body>
${html}
  <script src="widget.js"><\/script>
</body>
</html>`;

  const fullJs = `// Widget JavaScript
${js || '// Add your custom JavaScript here'}

// Grist integration
if (typeof grist !== 'undefined') {
  grist.ready({ requiredAccess: 'full' });
}
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
