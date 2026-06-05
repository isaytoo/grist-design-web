import type { Editor, Component } from 'grapesjs';

const SPOT_ABOVE = 'add-section-above';
const SPOT_BELOW = 'add-section-below';

const NEW_SECTION = `<section style="padding:60px 40px;min-height:80px;"></section>`;

function isTopLevel(cmp: Component): boolean {
  const parent = cmp.parent();
  return !!parent && !parent.parent();
}

export function registerSectionAdder(editor: Editor) {
  const canvas = editor.Canvas;

  function clearSpots() {
    canvas.removeSpots({ type: SPOT_ABOVE });
    canvas.removeSpots({ type: SPOT_BELOW });
  }

  editor.on('component:selected', (cmp: Component) => {
    clearSpots();
    if (!isTopLevel(cmp)) return;
    canvas.addSpot({ type: SPOT_ABOVE, component: cmp });
    canvas.addSpot({ type: SPOT_BELOW, component: cmp });
  });

  editor.on('component:deselected', clearSpots);

  // @ts-ignore — canvas:spot event signature not in typings
  editor.on('canvas:spot', ({ spot, el }: { spot: any; el: HTMLElement }) => {
    if (!spot.isType(SPOT_ABOVE) && !spot.isType(SPOT_BELOW)) return;

    const isAbove = spot.isType(SPOT_ABOVE);
    const rect = spot.getBoxRect();

    Object.assign(el.style, {
      position: 'absolute',
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      top: isAbove ? `${rect.top - 14}px` : `${rect.top + rect.height - 14}px`,
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '10',
      pointerEvents: 'all',
    });

    if (el.dataset.init) return;
    el.dataset.init = '1';

    const line = document.createElement('div');
    Object.assign(line.style, {
      position: 'absolute',
      left: '0',
      right: '0',
      top: '50%',
      height: '2px',
      background: '#3b82f6',
      opacity: '0',
      transition: 'opacity 0.2s',
      pointerEvents: 'none',
    });
    el.appendChild(line);

    const btn = document.createElement('button');
    btn.textContent = '+';
    Object.assign(btn.style, {
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
      zIndex: '2',
      opacity: '0',
      transition: 'opacity 0.2s, transform 0.15s',
      boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
    });

    el.appendChild(btn);

    el.addEventListener('mouseenter', () => {
      btn.style.opacity = '1';
      line.style.opacity = '1';
    });
    el.addEventListener('mouseleave', () => {
      btn.style.opacity = '0';
      line.style.opacity = '0';
    });
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.15)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
    });

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cmp = spot.component;
      const parent = cmp.parent();
      if (!parent) return;
      const idx = parent.components().indexOf(cmp);
      const insertAt = isAbove ? idx : idx + 1;
      const added = parent.components().add(NEW_SECTION, { at: insertAt });
      const newCmp = Array.isArray(added) ? added[0] : added;
      if (newCmp) editor.select(newCmp);
    });
  });
}
