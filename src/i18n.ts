export type Lang = 'fr' | 'en';

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    appTitle: 'Grist Design Web',
    appSubtitle: 'Créez vos pages web en glissé-déposé',
    blocks: 'Blocs',
    layers: 'Calques',
    styles: 'Styles',
    traits: 'Propriétés',
    exportZip: 'Télécharger ZIP',
    saveToGrist: 'Sauvegarder',
    loadFromGrist: 'Charger',
    newPage: 'Nouvelle page',
    pageName: 'Nom de la page',
    saved: 'Sauvegardé ✓',
    exported: 'ZIP téléchargé ✓',
    preview: 'Aperçu',
    undo: 'Annuler',
    redo: 'Refaire',
    fullscreen: 'Plein écran',
    desktop: 'Bureau',
    tablet: 'Tablette',
    mobile: 'Mobile',
    clear: 'Tout effacer',
    confirmClear: 'Effacer tout le contenu ?',
    noPages: 'Aucune page sauvegardée',
    loadPage: 'Charger cette page',
    deletePage: 'Supprimer',
    pageDeleted: 'Page supprimée',
    pageLoaded: 'Page chargée ✓',
    cancel: 'Annuler',
    close: 'Fermer',
    myPages: 'Mes pages',
  },
  en: {
    appTitle: 'Grist Design Web',
    appSubtitle: 'Build your web pages with drag & drop',
    blocks: 'Blocks',
    layers: 'Layers',
    styles: 'Styles',
    traits: 'Properties',
    exportZip: 'Download ZIP',
    saveToGrist: 'Save',
    loadFromGrist: 'Load',
    newPage: 'New page',
    pageName: 'Page name',
    saved: 'Saved ✓',
    exported: 'ZIP downloaded ✓',
    preview: 'Preview',
    undo: 'Undo',
    redo: 'Redo',
    fullscreen: 'Fullscreen',
    desktop: 'Desktop',
    tablet: 'Tablet',
    mobile: 'Mobile',
    clear: 'Clear all',
    confirmClear: 'Clear all content?',
    noPages: 'No saved pages',
    loadPage: 'Load this page',
    deletePage: 'Delete',
    pageDeleted: 'Page deleted',
    pageLoaded: 'Page loaded ✓',
    cancel: 'Cancel',
    close: 'Close',
    myPages: 'My pages',
  },
};

let currentLang: Lang = (navigator.language || 'fr').substring(0, 2) === 'en' ? 'en' : 'fr';

export function t(key: string): string {
  return translations[currentLang]?.[key] || key;
}

export function setLang(lang: Lang) {
  currentLang = lang;
}

export function getLang(): Lang {
  return currentLang;
}
