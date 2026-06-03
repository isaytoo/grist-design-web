import type { Editor } from 'grapesjs';

export function registerCustomBlocks(editor: Editor) {
  const bm = editor.Blocks;

  // Blank Section (empty, droppable container to build from scratch)
  bm.add('blank-section', {
    label: '⬜ Section vierge',
    category: 'Sections',
    content: {
      tagName: 'section',
      droppable: true,
      style: { padding: '60px 40px', 'min-height': '120px' },
    },
  });

  // Hero Section
  bm.add('hero-section', {
    label: '🦸 Hero',
    category: 'Sections',
    content: `<section style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:80px 40px;text-align:center;">
      <h1 style="font-size:48px;font-weight:800;margin-bottom:16px;">Titre principal</h1>
      <p style="font-size:20px;opacity:0.9;margin-bottom:32px;max-width:600px;margin-left:auto;margin-right:auto;">Description courte de votre projet ou produit</p>
      <a href="#" style="display:inline-block;background:white;color:#764ba2;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:16px;">Commencer</a>
    </section>`,
  });

  // CTA Section
  bm.add('cta-section', {
    label: '📢 Call to Action',
    category: 'Sections',
    content: `<section style="background:#1e293b;color:white;padding:60px 40px;text-align:center;">
      <h2 style="font-size:32px;font-weight:700;margin-bottom:12px;">Prêt à commencer ?</h2>
      <p style="font-size:16px;opacity:0.8;margin-bottom:24px;">Rejoignez des milliers d'utilisateurs satisfaits</p>
      <a href="#" style="display:inline-block;background:#3b82f6;color:white;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;">S'inscrire gratuitement</a>
    </section>`,
  });

  // Features Grid
  bm.add('features-grid', {
    label: '⭐ Features',
    category: 'Sections',
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

  // Testimonial
  bm.add('testimonial', {
    label: '💬 Témoignage',
    category: 'Sections',
    content: `<section style="padding:60px 40px;background:#f8fafc;">
      <div style="max-width:600px;margin:0 auto;text-align:center;">
        <div style="font-size:48px;color:#cbd5e1;margin-bottom:16px;">"</div>
        <p style="font-size:18px;font-style:italic;color:#475569;margin-bottom:16px;">Ce produit a transformé notre façon de travailler. Je le recommande vivement !</p>
        <p style="font-weight:700;color:#1e293b;">Marie Dupont</p>
        <p style="font-size:13px;color:#94a3b8;">Directrice, Entreprise XYZ</p>
      </div>
    </section>`,
  });

  // Pricing
  bm.add('pricing-cards', {
    label: '💰 Pricing',
    category: 'Sections',
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

  // FAQ
  bm.add('faq-section', {
    label: '❓ FAQ',
    category: 'Sections',
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

  // Header / Navbar
  bm.add('navbar-block', {
    label: '🧭 Navbar',
    category: 'Navigation',
    content: `<nav style="display:flex;align-items:center;justify-content:space-between;padding:16px 32px;background:white;border-bottom:1px solid #e2e8f0;">
      <div style="font-size:20px;font-weight:800;color:#1e293b;">MonSite</div>
      <div style="display:flex;gap:24px;">
        <a href="#" style="text-decoration:none;color:#64748b;font-weight:600;">Accueil</a>
        <a href="#" style="text-decoration:none;color:#64748b;font-weight:600;">Services</a>
        <a href="#" style="text-decoration:none;color:#64748b;font-weight:600;">Contact</a>
      </div>
    </nav>`,
  });

  // Footer
  bm.add('footer-block', {
    label: '🔻 Footer',
    category: 'Navigation',
    content: `<footer style="background:#1e293b;color:#94a3b8;padding:40px 32px;text-align:center;">
      <p style="margin-bottom:8px;">© 2026 MonSite. Tous droits réservés.</p>
      <div style="display:flex;gap:16px;justify-content:center;">
        <a href="#" style="color:#94a3b8;text-decoration:none;">Mentions légales</a>
        <a href="#" style="color:#94a3b8;text-decoration:none;">Confidentialité</a>
        <a href="#" style="color:#94a3b8;text-decoration:none;">Contact</a>
      </div>
    </footer>`,
  });

  // Separator
  bm.add('separator', {
    label: '➖ Séparateur',
    category: 'Base',
    content: '<hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;">',
  });

  // Spacer
  bm.add('spacer', {
    label: '↕️ Espace',
    category: 'Base',
    content: '<div style="height:60px;"></div>',
  });
}
