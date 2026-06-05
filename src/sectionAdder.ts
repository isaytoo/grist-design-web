import type { Editor, Component } from 'grapesjs';

const NEW_SECTION = `<section style="padding:60px 40px;min-height:80px;"></section>`;

function isTopLevel(cmp: Component): boolean {
  const parent = cmp.parent();
  return !!parent && !parent.parent();
}

function createBtn(onClick: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.textContent = '+';
  Object.assign(btn.style, {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '2px solid #3b82f6',
    background: 'white',
    color: '#3b82f6',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1',
    padding: '0',
    zIndex: '100',
    opacity: '0',
    transition: 'opacity 0.2s, transform 0.15s',
    boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
    pointerEvents: 'all',
  });
  btn.addEventListener('mouseenter', () => { btn.style.opacity = '1'; btn.style.transform = 'translateX(-50%) scale(1.15)'; });
  btn.addEventListener('mouseleave', () => { btn.style.opacity = '0'; btn.style.transform = 'translateX(-50%) scale(1)'; });
  btn.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); onClick(); });
  return btn;
}

function createLine(): HTMLDivElement {
  const line = document.createElement('div');
  Object.assign(line.style, {
    position: 'absolute',
    left: '0',
    right: '0',
    height: '2px',
    background: '#3b82f6',
    opacity: '0',
    transition: 'opacity 0.2s',
    pointerEvents: 'none',
    zIndex: '99',
  });
  return line;
}

function createZone(position: 'top' | 'bottom'): HTMLDivElement {
  const zone = document.createElement('div');
  Object.assign(zone.style, {
    position: 'absolute',
    left: '0',
    right: '0',
    height: '30px',
    zIndex: '98',
    pointerEvents: 'all',
    cursor: 'default',
  });
  zone.dataset.position = position;
  return zone;
}

export function registerSectionAdder(editor: Editor) {
  let cleanup: (() => void) | null = null;

  function clearOverlays() {
    if (cleanup) { cleanup(); cleanup = null; }
  }

  function showOverlays(cmp: Component) {
    clearOverlays();
    if (!isTopLevel(cmp)) return;

    const el = cmp.getEl();
    if (!el) return;

    const spotsEl = editor.Canvas.getSpotsEl();
    if (!spotsEl) return;

    const btnAbove = createBtn(() => insertSection(cmp, 'above'));
    const btnBelow = createBtn(() => insertSection(cmp, 'below'));
    const lineAbove = createLine();
    const lineBelow = createLine();
    const zoneAbove = createZone('top');
    const zoneBelow = createZone('bottom');

    zoneAbove.addEventListener('mouseenter', () => { btnAbove.style.opacity = '1'; lineAbove.style.opacity = '1'; });
    zoneAbove.addEventListener('mouseleave', () => { btnAbove.style.opacity = '0'; lineAbove.style.opacity = '0'; });
    zoneBelow.addEventListener('mouseenter', () => { btnBelow.style.opacity = '1'; lineBelow.style.opacity = '1'; });
    zoneBelow.addEventListener('mouseleave', () => { btnBelow.style.opacity = '0'; lineBelow.style.opacity = '0'; });

    spotsEl.appendChild(zoneAbove);
    spotsEl.appendChild(zoneBelow);
    spotsEl.appendChild(lineAbove);
    spotsEl.appendChild(lineBelow);
    spotsEl.appendChild(btnAbove);
    spotsEl.appendChild(btnBelow);

    const elements = [btnAbove, btnBelow, lineAbove, lineBelow, zoneAbove, zoneBelow];

    function updatePositions() {
      const cv = editor.Canvas;
      const rect = cv.getElementPos(el!);
      if (!rect) return;

      const top = rect.top;
      const bottom = rect.top + rect.height;
      const left = rect.left;
      const width = rect.width;

      Object.assign(zoneAbove.style, { top: `${top - 15}px`, left: `${left}px`, width: `${width}px` });
      Object.assign(zoneBelow.style, { top: `${bottom - 15}px`, left: `${left}px`, width: `${width}px` });
      Object.assign(lineAbove.style, { top: `${top}px`, left: `${left}px`, width: `${width}px` });
      Object.assign(lineBelow.style, { top: `${bottom}px`, left: `${left}px`, width: `${width}px` });
      Object.assign(btnAbove.style, { top: `${top - 14}px`, left: `${left + width / 2}px` });
      Object.assign(btnBelow.style, { top: `${bottom - 14}px`, left: `${left + width / 2}px` });
    }

    updatePositions();

    const onUpdate = () => { try { updatePositions(); } catch {} };
    editor.on('canvas:refresh', onUpdate);
    editor.on('frame:updated', onUpdate);

    cleanup = () => {
      elements.forEach(e => e.remove());
      editor.off('canvas:refresh', onUpdate);
      editor.off('frame:updated', onUpdate);
    };
  }

  function insertSection(cmp: Component, position: 'above' | 'below') {
    const parent = cmp.parent();
    if (!parent) return;
    const idx = parent.components().indexOf(cmp);
    const insertAt = position === 'above' ? idx : idx + 1;
    const added = parent.components().add(NEW_SECTION, { at: insertAt });
    const newCmp = Array.isArray(added) ? added[0] : added;
    if (newCmp) editor.select(newCmp);
  }

  editor.on('component:selected', (cmp: Component) => showOverlays(cmp));
  editor.on('component:deselected', clearOverlays);
}
