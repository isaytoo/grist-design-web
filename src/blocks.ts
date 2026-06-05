import type { Editor } from 'grapesjs';

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
};

export function registerCustomBlocks(editor: Editor) {
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

  // ── Custom file upload trait types ──
  editor.Traits.addType('file-image', {
    createInput({ trait }: { trait: any }) {
      const el = document.createElement('div');
      el.style.cssText = 'display:flex;flex-direction:column;gap:4px;width:100%;';
      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.placeholder = 'URL ou glisser image...';
      textInput.value = trait.get('value') || '';
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

      el.append(textInput, btnRow, preview);

      const showPreview = (url: string) => {
        if (url) { preview.style.backgroundImage = `url('${url}')`; preview.style.display = 'block'; }
        else { preview.style.display = 'none'; preview.style.backgroundImage = ''; }
      };
      showPreview(textInput.value);

      fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const b64 = reader.result as string;
          textInput.value = b64;
          showPreview(b64);
          el.dispatchEvent(new Event('change'));
        };
        reader.readAsDataURL(file);
      });
      textInput.addEventListener('change', () => {
        showPreview(textInput.value);
        el.dispatchEvent(new Event('change'));
      });
      clearBtn.addEventListener('click', () => {
        textInput.value = '';
        showPreview('');
        el.dispatchEvent(new Event('change'));
      });
      (el as any).__textInput = textInput;
      return el;
    },
    onEvent({ elInput, component }: { elInput: HTMLElement; component: any }) {
      const val = (elInput as any).__textInput?.value || '';
      component.set('hero-bg-image', val);
    },
    onUpdate({ elInput, component }: { elInput: HTMLElement; component: any }) {
      const inp = (elInput as any).__textInput;
      if (inp) {
        const val = component.get('hero-bg-image') || '';
        inp.value = val;
        const preview = elInput.querySelector('div:last-child') as HTMLElement;
        if (preview) {
          if (val) { preview.style.backgroundImage = `url('${val}')`; preview.style.display = 'block'; }
          else { preview.style.display = 'none'; }
        }
      }
    },
  });

  editor.Traits.addType('file-video', {
    createInput({ trait }: { trait: any }) {
      const el = document.createElement('div');
      el.style.cssText = 'display:flex;flex-direction:column;gap:4px;width:100%;';
      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.placeholder = 'URL ou choisir vidéo...';
      textInput.value = trait.get('value') || '';
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
          el.dispatchEvent(new Event('change'));
        };
        reader.readAsDataURL(file);
      });
      textInput.addEventListener('change', () => {
        el.dispatchEvent(new Event('change'));
      });
      clearBtn.addEventListener('click', () => {
        textInput.value = '';
        status.style.display = 'none';
        el.dispatchEvent(new Event('change'));
      });
      (el as any).__textInput = textInput;
      return el;
    },
    onEvent({ elInput, component }: { elInput: HTMLElement; component: any }) {
      const val = (elInput as any).__textInput?.value || '';
      component.set('hero-bg-video', val);
    },
    onUpdate({ elInput, component }: { elInput: HTMLElement; component: any }) {
      const inp = (elInput as any).__textInput;
      if (inp) inp.value = component.get('hero-bg-video') || '';
    },
  });

  // ── Hero Pro component type ──
  const HERO_MEDIA_ATTR = 'data-hero-media';

  function buildHeroProChildren(bgType: string, overlayStyle: string, textAnim: string) {
    const uid = 'hero-' + Math.random().toString(36).slice(2, 8);

    let bgLayer = '';
    if (bgType === 'video') {
      bgLayer = `<video ${HERO_MEDIA_ATTR}="1" autoplay muted loop playsinline style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0;"></video>`;
    } else if (bgType === 'image') {
      bgLayer = `<img ${HERO_MEDIA_ATTR}="1" alt="" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;" />`;
    }

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

    return `${bgLayer}${overlayEl}
      <div class="${uid}-content ${textAnimClass}" style="position:relative;z-index:2;text-align:center;max-width:800px;padding:80px 40px;">
        <h1 style="font-size:56px;font-weight:900;margin-bottom:20px;text-shadow:0 2px 20px rgba(0,0,0,0.3);line-height:1.1;">Titre principal</h1>
        <p style="font-size:22px;opacity:0.92;margin-bottom:36px;text-shadow:0 1px 10px rgba(0,0,0,0.2);line-height:1.6;">Description courte de votre projet ou produit avec un texte accrocheur</p>
        <a href="#" style="display:inline-block;background:white;color:#764ba2;padding:16px 36px;border-radius:8px;font-weight:700;text-decoration:none;font-size:16px;box-shadow:0 4px 20px rgba(0,0,0,0.2);transition:transform 0.2s,box-shadow 0.2s;">Commencer</a>
      </div>
      ${css ? `<style>${css}</style>` : ''}`;
  }

  function applyHeroMedia(cmp: any) {
    const bg = cmp.get('hero-bg') || 'gradient';
    const bgImage = cmp.get('hero-bg-image') || '';
    const bgVideo = cmp.get('hero-bg-video') || '';
    const mediaCmp = cmp.components().filter((c: any) => c.getAttributes()[HERO_MEDIA_ATTR])[0];
    if (!mediaCmp) return;
    const el = mediaCmp.getEl();
    if (!el) return;
    if (bg === 'image') {
      const src = bgImage || 'https://placehold.co/1920x900/667eea/white?text=Hero+Image';
      el.setAttribute('src', src);
      mediaCmp.addAttributes({ src });
    } else if (bg === 'video' && bgVideo) {
      el.setAttribute('src', bgVideo);
      mediaCmp.addAttributes({ src: bgVideo });
      (el as HTMLVideoElement).load();
    }
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
        components: buildHeroProChildren('gradient', 'none', 'fade-up'),
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
        this.components(buildHeroProChildren(bg, overlay, anim));
        setTimeout(() => applyHeroMedia(this), 50);
      },
      onHeroMediaChange() {
        applyHeroMedia(this);
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

  function buildNavbarHtml(style: string, maxWidth: string) {
    const s = navStyles[style] || navStyles.light;
    const uid = 'nav-' + Math.random().toString(36).slice(2, 8);
    return `<nav class="${uid}" style="width:100%;background:${s.bg};border-bottom:${s.border};${style === 'glass' ? 'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' : ''}">
      <div class="${uid}-container" style="max-width:${maxWidth};margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:14px 32px;position:relative;">
        <a href="#" style="font-size:20px;font-weight:800;color:${s.text};text-decoration:none;">MonSite</a>
        <div class="${uid}-menu" style="display:flex;gap:4px;align-items:center;">
          <a href="#" style="text-decoration:none;color:${s.text};font-weight:600;padding:8px 14px;border-radius:6px;transition:background 0.2s,color 0.2s;">Accueil</a>
          <div class="${uid}-dropdown" style="position:relative;">
            <a href="#" style="text-decoration:none;color:${s.text};font-weight:600;padding:8px 14px;border-radius:6px;transition:background 0.2s,color 0.2s;display:flex;align-items:center;gap:4px;">Services <span style="font-size:10px;">▼</span></a>
            <div class="${uid}-sub" style="display:none;position:absolute;top:100%;left:0;background:white;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.12);min-width:200px;padding:6px 0;z-index:1000;">
              <a href="#" style="display:block;padding:10px 18px;color:#1e293b;text-decoration:none;font-size:14px;font-weight:500;transition:background 0.15s;">Web Design</a>
              <a href="#" style="display:block;padding:10px 18px;color:#1e293b;text-decoration:none;font-size:14px;font-weight:500;transition:background 0.15s;">Développement</a>
              <a href="#" style="display:block;padding:10px 18px;color:#1e293b;text-decoration:none;font-size:14px;font-weight:500;transition:background 0.15s;">SEO</a>
            </div>
          </div>
          <a href="#" style="text-decoration:none;color:${s.text};font-weight:600;padding:8px 14px;border-radius:6px;transition:background 0.2s,color 0.2s;">À propos</a>
          <a href="#" style="text-decoration:none;color:${s.text};font-weight:600;padding:8px 14px;border-radius:6px;transition:background 0.2s,color 0.2s;">Contact</a>
          <a href="#" style="display:inline-block;margin-left:12px;padding:8px 20px;background:${s.accent};color:white;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;transition:opacity 0.2s;">CTA</a>
        </div>
        <button class="${uid}-burger" style="display:none;background:none;border:none;cursor:pointer;padding:6px;" onclick="(function(b){var c=b.closest('.${uid}-container');var m=c.querySelector('.${uid}-menu');if(m.dataset.open==='1'){m.style.display='';m.style.flexDirection='';m.style.position='';m.style.top='';m.style.left='';m.style.right='';m.style.background='';m.style.padding='';m.style.zIndex='';m.dataset.open='0';}else{m.style.display='flex';m.style.flexDirection='column';m.style.position='absolute';m.style.top='100%';m.style.left='0';m.style.right='0';m.style.background='${s.bg === 'transparent' ? '#1e293b' : s.bg}';m.style.padding='16px';m.style.zIndex='999';m.dataset.open='1';}})(this)">
          <span style="display:block;width:24px;height:2px;background:${s.text};margin:5px 0;transition:transform 0.2s;"></span>
          <span style="display:block;width:24px;height:2px;background:${s.text};margin:5px 0;transition:opacity 0.2s;"></span>
          <span style="display:block;width:24px;height:2px;background:${s.text};margin:5px 0;transition:transform 0.2s;"></span>
        </button>
      </div>
      <style>
        .${uid}-dropdown:hover .${uid}-sub{display:block!important;animation:navDropIn 0.2s ease;}
        .${uid}-sub a:hover{background:#f1f5f9;}
        .${uid}-menu>a:hover,.${uid}-dropdown>a:hover{background:rgba(0,0,0,0.06);}
        @keyframes navDropIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:768px){.${uid}-menu{display:none!important;}.${uid}-burger{display:block!important;}}
      </style>
    </nav>`;
  }

  editor.Components.addType('advanced-navbar', {
    model: {
      defaults: {
        tagName: 'div',
        droppable: false,
        'nav-style': 'light',
        'nav-width': '1200px',
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
        components: buildNavbarHtml('light', '1200px'),
      },
      init() {
        this.on('change:nav-style', this.onNavChange);
        this.on('change:nav-width', this.onNavChange);
      },
      onNavChange() {
        const style = this.get('nav-style') || 'light';
        const width = this.get('nav-width') || '1200px';
        this.components().reset();
        this.components(buildNavbarHtml(style, width));
      },
    },
  });

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
}
