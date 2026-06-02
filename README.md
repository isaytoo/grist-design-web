# 🎨 Grist Design Web

> **FR** — Constructeur de pages web visuel (glisser-déposer) intégré à Grist. Créez des pages HTML/CSS/JS, sauvegardez-les dans votre document Grist, et exportez un widget Grist prêt à l'emploi.
>
> **EN** — Visual drag-and-drop web page builder embedded in Grist. Build HTML/CSS/JS pages, save them in your Grist document, and export a ready-to-use Grist widget.

🔗 **Widget URL** : `https://grist-design-web.vercel.app`
📦 **GitHub** : [isaytoo/grist-design-web](https://github.com/isaytoo/grist-design-web)

---

## 🇫🇷 Français

### Présentation
Grist Design Web est un widget Grist basé sur **GrapesJS** qui transforme votre document en éditeur de pages visuel. Vous composez une page par glisser-déposer (sections Hero, CTA, Features, Pricing, FAQ, Navbar, Footer, formulaires…), vous ajustez les styles, et le résultat est :
- **sauvegardé dans Grist** (table `Design_Pages`) ;
- **exportable en ZIP** (`index.html` + `widget.js`) directement réutilisable comme widget Grist.

### Fonctionnalités
- **Blocs prêts à l'emploi** : sections, navigation, formulaires, texte, images, colonnes.
- **Panneaux** : Styles (CSS visuel), Propriétés (attributs), Calques (arborescence).
- **Aperçus responsive** : Desktop / Tablette / Mobile.
- **Annuler / Rétablir**, **Aperçu**, **Plein écran**.
- **Multilingue** : interface FR / EN.
- **Sauvegarde Grist** + **chargement** des pages enregistrées.
- **Export ZIP** fidèle à la mise en page (styles inline + media queries + reset CSS).

### Intégration dans Grist (en tant que widget)
1. Ouvrez votre document Grist.
2. Ajoutez une vue **« Custom » / « Widget personnalisé »**.
3. Dans **URL personnalisée**, collez : `https://grist-design-web.vercel.app`
4. Réglez **Niveau d'accès** sur **« Accès complet au document »** (`full`) — requis pour créer/lire les tables.
5. Le widget crée automatiquement les tables nécessaires au premier lancement.

### Tables créées automatiquement
| Table | Colonnes |
|-------|----------|
| `Design_Pages` | `Page_Name`, `HTML_Content`, `CSS_Content`, `JS_Content`, `GrapesJS_Data`, `Created_At`, `Updated_At` |
| `Design_Assets` | `Asset_Name`, `Asset_URL`, `Asset_Type` |

### Réutiliser une page exportée comme widget
1. Cliquez sur **📦 Exporter ZIP** : vous obtenez `index.html` + `widget.js`.
2. Hébergez ces deux fichiers (Vercel, Netlify, GitHub Pages…).
3. Dans Grist, ajoutez un widget personnalisé pointant vers l'`index.html` hébergé.
4. Le fichier inclut déjà l'API Grist (`grist-plugin-api.js`) et `grist.ready({ requiredAccess: 'full' })`.

### Développement local
```bash
npm install
npm run dev      # serveur de dev (http://localhost:5173)
npm run build    # build de production (dossier dist/)
npm run preview  # prévisualiser le build
```

---

## 🇬🇧 English

### Overview
Grist Design Web is a Grist widget powered by **GrapesJS** that turns your document into a visual page editor. Compose a page by drag-and-drop (Hero, CTA, Features, Pricing, FAQ, Navbar, Footer, forms…), tweak the styles, and the result is:
- **saved into Grist** (`Design_Pages` table);
- **exportable as a ZIP** (`index.html` + `widget.js`) directly reusable as a Grist widget.

### Features
- **Ready-made blocks**: sections, navigation, forms, text, images, columns.
- **Panels**: Styles (visual CSS), Properties (attributes), Layers (tree).
- **Responsive previews**: Desktop / Tablet / Mobile.
- **Undo / Redo**, **Preview**, **Fullscreen**.
- **Bilingual** UI: FR / EN.
- **Save to Grist** + **load** stored pages.
- **ZIP export** faithful to the layout (inline styles + media queries + CSS reset).

### Integrate into Grist (as a widget)
1. Open your Grist document.
2. Add a **Custom widget** view.
3. In **Custom URL**, paste: `https://grist-design-web.vercel.app`
4. Set **Access level** to **Full document access** (`full`) — required to create/read tables.
5. The widget auto-creates the required tables on first launch.

### Auto-created tables
| Table | Columns |
|-------|---------|
| `Design_Pages` | `Page_Name`, `HTML_Content`, `CSS_Content`, `JS_Content`, `GrapesJS_Data`, `Created_At`, `Updated_At` |
| `Design_Assets` | `Asset_Name`, `Asset_URL`, `Asset_Type` |

### Reuse an exported page as a widget
1. Click **📦 Export ZIP**: you get `index.html` + `widget.js`.
2. Host both files (Vercel, Netlify, GitHub Pages…).
3. In Grist, add a custom widget pointing to the hosted `index.html`.
4. The file already includes the Grist API (`grist-plugin-api.js`) and `grist.ready({ requiredAccess: 'full' })`.

### Local development
```bash
npm install
npm run dev      # dev server (http://localhost:5173)
npm run build    # production build (dist/ folder)
npm run preview  # preview the build
```

---

## 🛠️ Tech stack
React 19 · TypeScript · Vite · GrapesJS (`@grapesjs/react`) · `grapesjs-preset-webpage` · `grapesjs-blocks-basic` · `grapesjs-plugin-forms` · JSZip · FileSaver

## 📄 License
© 2026 Said Hamadou (isaytoo) — [gristup.fr](https://gristup.fr)
