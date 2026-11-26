/* საერთო SVG გენერატორი — window.FesviSVG (კანვასი 0 0 200 240) */
(function () {
  function leaf(cx, cy, ang, len, wid, fill) {
    const d = `M0,0 C ${-wid},${-len * 0.45} ${-wid * 0.5},${-len * 0.92} 0,${-len} `
            + `C ${wid * 0.5},${-len * 0.92} ${wid},${-len * 0.45} 0,0 Z`;
    return `<path d="${d}" fill="${fill}" transform="translate(${cx},${cy}) rotate(${ang})"/>`;
  }
  function ring(cx, cy, count, offset, len, wid, fill, tip) {
    let s = '';
    for (let i = 0; i < count; i++) {
      const a = offset + i * (360 / count);
      s += leaf(cx, cy, a, len, wid, fill);
      if (tip) s += `<ellipse cx="0" cy="${-len * 0.9}" rx="${wid * 0.34}" ry="${len * 0.12}" `
                  + `fill="${tip}" opacity="0.8" transform="translate(${cx},${cy}) rotate(${a})"/>`;
    }
    return s;
  }

  const PLANT_SVG = {
    echeveria() {
      const cx = 100, cy = 108;
      return ring(cx, cy, 9, 0, 52, 16, '#7BAE72', '#D79CB4')
           + ring(cx, cy, 8, 22, 38, 14, '#62A05E', null)
           + ring(cx, cy, 7, 10, 25, 11, '#56945A', null)
           + ring(cx, cy, 5, 0, 14, 8, '#4B8453', null)
           + `<circle cx="${cx}" cy="${cy}" r="4" fill="#447A4D"/>`;
    },
    cactus() {
      let s = `<path d="M83,120 Q80,52 100,38 Q120,52 117,120 Q100,130 83,120 Z" fill="#519A57"/>`;
      for (const x of [90, 100, 110]) {
        s += `<path d="M${x},118 Q${x - 2},70 ${x === 100 ? 100 : (x < 100 ? 96 : 104)},44" stroke="#3F8149" stroke-width="2.2" fill="none" opacity="0.55" stroke-linecap="round"/>`;
      }
      for (let y = 58; y < 116; y += 11) {
        for (const x of [88, 100, 112]) {
          s += `<line x1="${x - 3}" y1="${y}" x2="${x + 3}" y2="${y}" stroke="#EAE3C7" stroke-width="1" opacity="0.7"/>`;
        }
      }
      s += ring(100, 38, 6, 0, 12, 7, '#E58AA6', '#F0B7C8');
      s += `<circle cx="100" cy="38" r="4" fill="#F4D35E"/>`;
      return s;
    },
    aloe() {
      const data = [[-40, 78], [-20, 94], [0, 104], [20, 94], [40, 78]];
      let s = '';
      for (const [a, len] of data) {
        const d = `M-8,0 Q-4,${-len * 0.55} 0,${-len} Q4,${-len * 0.55} 8,0 Q0,7 -8,0 Z`;
        s += `<path d="${d}" fill="#6FAE69" transform="translate(100,120) rotate(${a})"/>`;
        s += `<path d="M0,-6 L0,${-len * 0.92}" stroke="#88C081" stroke-width="2" opacity="0.5" transform="translate(100,120) rotate(${a})" stroke-linecap="round"/>`;
        s += `<path d="M-3,${-len * 0.86} Q0,${-len} 3,${-len * 0.86} Z" fill="#C9714F" transform="translate(100,120) rotate(${a})"/>`;
      }
      return s;
    },
    zebra() {
      const data = [[-42, 46], [-21, 56], [0, 62], [21, 56], [42, 46]];
      let s = '';
      for (const [a, len] of data) {
        s += `<path d="M-6,0 L0,${-len} L6,0 Z" fill="#2F6B43" transform="translate(100,120) rotate(${a})"/>`;
        for (let t = 0.25; t < 0.9; t += 0.2) {
          const yy = -len * t, hw = 6 * (1 - t) + 1;
          s += `<line x1="${-hw}" y1="${yy}" x2="${hw}" y2="${yy}" stroke="#EAF1E4" stroke-width="1.6" transform="translate(100,120) rotate(${a})"/>`;
        }
      }
      return s;
    },
    pearls() {
      let s = '';
      const strands = [
        [78, 118, 55, 210], [92, 118, 72, 214], [108, 118, 128, 214], [122, 118, 145, 210],
        [85, 118, 40, 196], [115, 118, 160, 196]
      ];
      for (const [x0, y0, x1, y1] of strands) {
        const cxp = (x0 + x1) / 2 + (x1 < 100 ? -14 : 14), cyp = (y0 + y1) / 2 + 22;
        for (let t = 0; t <= 1; t += 0.11) {
          const mx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cxp + t * t * x1;
          const my = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cyp + t * t * y1;
          s += `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="5" fill="#7FB87A"/>`;
          s += `<circle cx="${(mx - 1.4).toFixed(1)}" cy="${(my - 1.4).toFixed(1)}" r="1.6" fill="#A6D29F"/>`;
        }
      }
      for (let i = 0; i < 7; i++) {
        const ax = 100 + (i - 3) * 9, ay = 112 - Math.abs(i - 3) * 2;
        s += `<circle cx="${ax}" cy="${ay}" r="5.5" fill="#85BC7F"/>`;
      }
      return s;
    }
  };

  function hexToRgb(h) {
    h = (h || '#888888').replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function shade(hex, f) {
    const [r, g, b] = hexToRgb(hex);
    const c = v => Math.max(0, Math.min(255, Math.round(v * f)));
    return `#${[c(r), c(g), c(b)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
  }

  function potSVG(pot) {
    const color = (pot && pot.color) || '#C77B53';
    const dark = shade(color, 0.78), inner = shade(color, 0.66), soil = '#4F3D2E';
    const body = `M40,121 L53,206 Q100,221 147,206 L160,121 Z`;
    let s = `<ellipse cx="100" cy="120" rx="60" ry="13" fill="${dark}"/>`;
    s += `<path d="${body}" fill="${color}"/>`;
    s += `<path d="M100,121 L160,121 L147,206 Q124,214 100,215 Z" fill="#000" opacity="0.06"/>`;
    s += `<path d="M100,121 L40,121 L53,206 Q76,214 100,215 Z" fill="#fff" opacity="0.07"/>`;
    s += `<ellipse cx="100" cy="120" rx="60" ry="13" fill="${color}"/>`;
    s += `<ellipse cx="100" cy="120" rx="50" ry="10" fill="${inner}"/>`;
    s += `<ellipse cx="100" cy="119" rx="46" ry="8" fill="${soil}"/>`;
    return s;
  }

  function pkgBack(shape) {
    if (shape === 'premium') {
      return `<path d="M48,150 L152,150 L160,224 L40,224 Z" fill="#CBA877"/>`
           + `<path d="M48,150 L152,150 L150,162 L50,162 Z" fill="#B8945F"/>`;
    }
    return '';
  }
  function pkgFront(shape) {
    if (shape === 'kraft') {
      let s = `<path d="M52,160 Q100,170 148,160 L150,182 Q100,192 50,182 Z" fill="#C9A87C"/>`;
      s += `<path d="M52,160 Q100,170 148,160 L150,182 Q100,192 50,182 Z" fill="#000" opacity="0.05"/>`;
      s += `<path d="M88,171 Q78,164 82,178 Q92,176 96,171 Z" fill="#9C8B63"/>`;
      s += `<path d="M112,171 Q122,164 118,178 Q108,176 104,171 Z" fill="#9C8B63"/>`;
      s += `<circle cx="100" cy="172" r="3.4" fill="#7E6E48"/>`;
      s += `<path d="M99,175 L94,190 M101,175 L106,190" stroke="#9C8B63" stroke-width="2" stroke-linecap="round"/>`;
      return s;
    }
    if (shape === 'premium') {
      let s = `<rect x="93" y="150" width="14" height="74" fill="#2E6B4F"/>`;
      s += `<rect x="40" y="178" width="120" height="13" fill="#2E6B4F"/>`;
      s += `<rect x="93" y="150" width="14" height="74" fill="#fff" opacity="0.08"/>`;
      s += `<path d="M100,128 Q82,116 86,134 Q98,132 100,128 Z" fill="#2E6B4F"/>`;
      s += `<path d="M100,128 Q118,116 114,134 Q102,132 100,128 Z" fill="#2E6B4F"/>`;
      s += `<circle cx="100" cy="130" r="4.4" fill="#235640"/>`;
      return s;
    }
    return '';
  }

  function plantBody(p) {
    const fn = PLANT_SVG[(p && p.shape) || 'echeveria'] || PLANT_SVG.echeveria;
    return fn();
  }

  function compose(plant, pot, pkg) {
    const pkgShape = pkg ? pkg.shape : 'plain';
    return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">`
         + pkgBack(pkgShape) + potSVG(pot) + plantBody(plant) + pkgFront(pkgShape)
         + `</svg>`;
  }
  function plantThumb(p) {
    return `<svg viewBox="20 28 160 110" xmlns="http://www.w3.org/2000/svg">${plantBody(p)}</svg>`;
  }
  function potThumb(p) {
    return `<svg viewBox="28 104 144 124" xmlns="http://www.w3.org/2000/svg">${potSVG(p)}</svg>`;
  }
  function pkgThumb(p) {
    const shape = p ? p.shape : 'plain';
    const pot = { color: '#C77B53' };
    return `<svg viewBox="28 104 144 130" xmlns="http://www.w3.org/2000/svg">${pkgBack(shape) + potSVG(pot) + pkgFront(shape)}</svg>`;
  }

  window.FesviSVG = {
    compose, plantThumb, potThumb, pkgThumb,
    PLANT_SHAPES: Object.keys(PLANT_SVG),
    PKG_SHAPES: ['plain', 'kraft', 'premium']
  };
})();
