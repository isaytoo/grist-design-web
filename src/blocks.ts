import type { Editor } from 'grapesjs';

// SVG icons matching native GrapesJS style (64x64, stroke-based, currentColor)
const svgIcon = (paths: string) =>
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:48px;"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;

const ICONS = {
  blank: svgIcon('<rect x="8" y="8" width="48" height="48" rx="4" stroke-dasharray="4,4"/>'),
  hero: svgIcon('<rect x="6" y="10" width="52" height="44" rx="4"/><line x1="18" y1="26" x2="46" y2="26"/><line x1="22" y1="34" x2="42" y2="34"/><rect x="24" y="40" width="16" height="8" rx="3"/>'),
  cta: svgIcon('<rect x="6" y="16" width="52" height="32" rx="4"/><line x1="18" y1="28" x2="46" y2="28"/><rect x="22" y="34" width="20" height="8" rx="3"/>'),
  features: svgIcon('<rect x="4" y="12" width="16" height="16" rx="3"/><rect x="24" y="12" width="16" height="16" rx="3"/><rect x="44" y="12" width="16" height="16" rx="3"/><line x1="6" y1="36" x2="18" y2="36"/><line x1="26" y1="36" x2="38" y2="36"/><line x1="46" y1="36" x2="58" y2="36"/><line x1="8" y1="42" x2="16" y2="42"/><line x1="28" y1="42" x2="36" y2="42"/><line x1="48" y1="42" x2="56" y2="42"/>'),
  testimonial: svgIcon('<path d="M12 14 h40 a4 4 0 0 1 4 4 v20 a4 4 0 0 1-4 4 H28 l-8 8 v-8 H12 a4 4 0 0 1-4-4 V18 a4 4 0 0 1 4-4z"/><line x1="18" y1="24" x2="46" y2="24"/><line x1="18" y1="32" x2="38" y2="32"/>'),
  pricing: svgIcon('<rect x="4" y="8" width="16" height="48" rx="3"/><rect x="24" y="4" width="16" height="56" rx="3"/><rect x="44" y="8" width="16" height="48" rx="3"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="28" y1="16" x2="36" y2="16"/><line x1="48" y1="20" x2="56" y2="20"/>'),
  faq: svgIcon('<circle cx="16" cy="20" r="8"/><text x="13" y="24" fill="currentColor" stroke="none" font-size="14" font-weight="bold">?</text><line x1="10" y1="34" x2="54" y2="34"/><line x1="10" y1="42" x2="54" y2="42"/><line x1="10" y1="50" x2="40" y2="50"/>'),
  navbar: svgIcon('<rect x="4" y="22" width="56" height="20" rx="4"/><line x1="10" y1="32" x2="24" y2="32"/><circle cx="38" cy="32" r="2" fill="currentColor"/><circle cx="46" cy="32" r="2" fill="currentColor"/><circle cx="54" cy="32" r="2" fill="currentColor"/>'),
  footer: svgIcon('<rect x="4" y="36" width="56" height="20" rx="4"/><line x1="14" y1="46" x2="50" y2="46"/><line x1="20" y1="52" x2="44" y2="52"/>'),
  separator: svgIcon('<line x1="8" y1="32" x2="56" y2="32"/>'),
  spacer: svgIcon('<line x1="32" y1="12" x2="32" y2="22"/><line x1="28" y1="16" x2="32" y2="12"/><line x1="36" y1="16" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="42"/><line x1="28" y1="48" x2="32" y2="52"/><line x1="36" y1="48" x2="32" y2="52"/>'),
  div: svgIcon('<rect x="10" y="14" width="44" height="36" rx="2" stroke-dasharray="4,3"/><text x="24" y="36" fill="currentColor" stroke="none" font-size="12">Div</text>'),
  slider: svgIcon('<rect x="6" y="10" width="52" height="44" rx="4"/><path d="M12 32l6-6v12z" fill="currentColor" stroke="none"/><path d="M52 32l-6-6v12z" fill="currentColor" stroke="none"/><circle cx="28" cy="48" r="2" fill="currentColor" stroke="none"/><circle cx="32" cy="48" r="2" fill="currentColor" stroke="none"/><circle cx="36" cy="48" r="2" fill="currentColor" stroke="none"/>'),
  cardsImg: svgIcon('<rect x="4" y="8" width="16" height="24" rx="2"/><rect x="24" y="8" width="16" height="24" rx="2"/><rect x="44" y="8" width="16" height="24" rx="2"/><line x1="7" y1="20" x2="17" y2="20"/><line x1="27" y1="20" x2="37" y2="20"/><line x1="47" y1="20" x2="57" y2="20"/><line x1="7" y1="26" x2="14" y2="26"/><line x1="27" y1="26" x2="34" y2="26"/><line x1="47" y1="26" x2="54" y2="26"/><rect x="7" y="10" width="10" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/><rect x="27" y="10" width="10" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/><rect x="47" y="10" width="10" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>'),
  cardsColor: svgIcon('<rect x="4" y="8" width="16" height="24" rx="2"/><rect x="24" y="8" width="16" height="24" rx="2"/><rect x="44" y="8" width="16" height="24" rx="2"/><line x1="7" y1="22" x2="17" y2="22"/><line x1="27" y1="22" x2="37" y2="22"/><line x1="47" y1="22" x2="57" y2="22"/><line x1="7" y1="28" x2="14" y2="28"/><line x1="27" y1="28" x2="34" y2="28"/><line x1="47" y1="28" x2="54" y2="28"/><rect x="7" y="10" width="10" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.15"/><rect x="27" y="10" width="10" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.15"/><rect x="47" y="10" width="10" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.15"/><line x1="7" y1="14" x2="17" y2="14" stroke-dasharray="2,2"/>'),
};

export function registerCustomBlocks(editor: Editor) {
  const bm = editor.Blocks;

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

  bm.add('cards-image', {
    label: 'Cards Image',
    category: 'Sections',
    media: ICONS.cardsImg,
    content: `<section style="padding:60px 40px;max-width:1000px;margin:0 auto;">
      <h2 style="text-align:center;font-size:28px;font-weight:700;margin-bottom:40px;">Nos services</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
        <div style="border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:white;">
          <img src="https://placehold.co/600x300/667eea/white?text=Image" alt="Image" style="width:100%;height:180px;object-fit:cover;display:block;" />
          <div style="padding:24px;">
            <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;">Titre de la carte</h3>
            <p style="color:#64748b;font-size:14px;margin-bottom:16px;">Description courte du service ou de la fonctionnalité proposée.</p>
            <a href="#" style="display:inline-block;padding:8px 20px;background:#3b82f6;color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">En savoir plus</a>
          </div>
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:white;">
          <img src="https://placehold.co/600x300/f5576c/white?text=Image" alt="Image" style="width:100%;height:180px;object-fit:cover;display:block;" />
          <div style="padding:24px;">
            <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;">Titre de la carte</h3>
            <p style="color:#64748b;font-size:14px;margin-bottom:16px;">Description courte du service ou de la fonctionnalité proposée.</p>
            <a href="#" style="display:inline-block;padding:8px 20px;background:#3b82f6;color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">En savoir plus</a>
          </div>
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:white;">
          <img src="https://placehold.co/600x300/4facfe/white?text=Image" alt="Image" style="width:100%;height:180px;object-fit:cover;display:block;" />
          <div style="padding:24px;">
            <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;">Titre de la carte</h3>
            <p style="color:#64748b;font-size:14px;margin-bottom:16px;">Description courte du service ou de la fonctionnalité proposée.</p>
            <a href="#" style="display:inline-block;padding:8px 20px;background:#3b82f6;color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">En savoir plus</a>
          </div>
        </div>
      </div>
    </section>`,
  });

  bm.add('cards-color', {
    label: 'Cards Couleur',
    category: 'Sections',
    media: ICONS.cardsColor,
    content: `<section style="padding:60px 40px;max-width:1000px;margin:0 auto;">
      <h2 style="text-align:center;font-size:28px;font-weight:700;margin-bottom:40px;">Nos services</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
        <div style="border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:40px 28px;">
          <div style="font-size:40px;margin-bottom:16px;">🚀</div>
          <h3 style="font-size:20px;font-weight:700;margin-bottom:10px;">Titre de la carte</h3>
          <p style="font-size:14px;opacity:0.9;margin-bottom:20px;">Description courte du service ou de la fonctionnalité proposée.</p>
          <a href="#" style="display:inline-block;padding:8px 20px;background:rgba(255,255,255,0.2);color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid rgba(255,255,255,0.3);">En savoir plus</a>
        </div>
        <div style="border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#f093fb,#f5576c);color:white;padding:40px 28px;">
          <div style="font-size:40px;margin-bottom:16px;">🎯</div>
          <h3 style="font-size:20px;font-weight:700;margin-bottom:10px;">Titre de la carte</h3>
          <p style="font-size:14px;opacity:0.9;margin-bottom:20px;">Description courte du service ou de la fonctionnalité proposée.</p>
          <a href="#" style="display:inline-block;padding:8px 20px;background:rgba(255,255,255,0.2);color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid rgba(255,255,255,0.3);">En savoir plus</a>
        </div>
        <div style="border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#4facfe,#00f2fe);color:white;padding:40px 28px;">
          <div style="font-size:40px;margin-bottom:16px;">💡</div>
          <h3 style="font-size:20px;font-weight:700;margin-bottom:10px;">Titre de la carte</h3>
          <p style="font-size:14px;opacity:0.9;margin-bottom:20px;">Description courte du service ou de la fonctionnalité proposée.</p>
          <a href="#" style="display:inline-block;padding:8px 20px;background:rgba(255,255,255,0.2);color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid rgba(255,255,255,0.3);">En savoir plus</a>
        </div>
      </div>
    </section>`,
  });

  bm.add('navbar-block', {
    label: 'Navbar',
    category: 'Navigation',
    media: ICONS.navbar,
    content: `<nav style="display:flex;align-items:center;justify-content:space-between;padding:16px 32px;background:white;border-bottom:1px solid #e2e8f0;">
      <div style="font-size:20px;font-weight:800;color:#1e293b;">MonSite</div>
      <div style="display:flex;gap:24px;">
        <a href="#" style="text-decoration:none;color:#64748b;font-weight:600;">Accueil</a>
        <a href="#" style="text-decoration:none;color:#64748b;font-weight:600;">Services</a>
        <a href="#" style="text-decoration:none;color:#64748b;font-weight:600;">Contact</a>
      </div>
    </nav>`,
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
