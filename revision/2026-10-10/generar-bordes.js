// Generates torn-paper mask SVGs for the CARVAN hero, oficio and mobile hero.
// node edges.js <assets-dir>
const fs = require('fs'), path = require('path');
const out = process.argv[2];

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// Catmull-Rom through control points, sampled every `step` units, jittered along the normal.
function tear(pts, { step = 4, amp = 1.6, spike = 0.1, spikeAmp = 4.5, s = 1 } = {}) {
  seed = s;
  const res = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const n = Math.max(2, Math.round(len / step));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      const x = f(p0[0], p1[0], p2[0], p3[0]), y = f(p0[1], p1[1], p2[1], p3[1]);
      const dx = p2[0] - p1[0], dy = p2[1] - p1[1], l = Math.hypot(dx, dy) || 1;
      const nx = -dy / l, ny = dx / l;
      let j = (rnd() - 0.5) * 2 * amp;
      if (rnd() < spike) j += (rnd() - 0.5) * 2 * spikeAmp;
      const first = i === 0 && k === 0;
      res.push(first ? [x, y] : [x + nx * j, y + ny * j]);
    }
  }
  res.push(pts[pts.length - 1]);
  return res;
}
const shift = (pts, dx, dy = 0) => pts.map(([x, y]) => [x + dx, y + dy]);
const d = pts => pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join('');
const L = pts => pts.map(([x, y]) => 'L' + x.toFixed(1) + ' ' + y.toFixed(1)).join('');
const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${body}</svg>\n`;
const shape = (dd) => `<path fill="#fff" d="${dd}Z"/>`;
const write = (name, s) => { fs.writeFileSync(path.join(out, name), s); console.log(name, s.length); };

// ---- Desktop hero (debajo del header). viewBox 1440 x 702.
// El header es todo papel: la foto y el marmolado arrancan con un borde superior rasgado (T).
const P = tear([[565, 0], [600, 60], [640, 130], [675, 250], [695, 360], [690, 440], [650, 520], [590, 600], [530, 660], [490, 702]], { s: 11 });
const Q = tear([[742, 0], [752, 120], [756, 250], [748, 360], [725, 450], [682, 540], [630, 620], [576, 702]], { s: 23, amp: 2.2, spike: .16, spikeAmp: 6 });
const T = tear([[0, 12], [220, 5], [430, 16], [640, 6], [850, 18], [1060, 7], [1260, 17], [1440, 9]], { s: 97, amp: 2.2, step: 5, spike: .14, spikeAmp: 4.5 });
// Sin borde rasgado arriba: el corte superior lo da el header (header-borde.svg). T queda sólo para referencia.
const clipped = body => body;
// Borde interno foto → marmolado: degradado (la foto se funde sobre el marmolado, que corre por debajo hasta la derecha).
// El contorno de la foto se extiende fuera del viewBox para que el blur sólo actúe sobre el borde izquierdo.
const Qx = [[Q[0][0], -160], ...Q, [Q[Q.length - 1][0] - 60, 880], [1700, 880], [1700, -160]];
const soft = `<defs><filter id="f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="26"/></filter></defs>`;
write("hero-photo-body.svg", svg(1440, 702, soft + clipped(`<path fill="#fff" filter="url(#f)" d="${d(Qx)}Z"/>`).replace("<defs>", "<defs>")));
// Marmolado sólo en la banda (P → Q+24); debajo de la foto va bordó liso (hero-fondo) para que el degradado no levante el marfil del marmolado.
write("hero-marble-body.svg", svg(1440, 702, clipped(shape(d(P) + L(shift(Q, 24).reverse())))));
write("hero-fondo-body.svg", svg(1440, 702, clipped(shape(d(P) + "L1440 702L1440 0"))));

// ---- Oficio side band. viewBox 200 x 480; marble on the right of the torn edge
const O = tear([[118, 0], [96, 50], [70, 120], [78, 200], [62, 280], [40, 360], [18, 430], [0, 480]], { s: 31, amp: 1.8 });
write('oficio-marble.svg', svg(200, 480, shape(d(O) + 'L200 480L200 0')));

// ---- Mobile hero top edge. viewBox 390 x 400: paper on top, marble band, photo below
const Pm = tear([[0, 12], [70, 5], [150, 17], [240, 3], [320, 12], [390, 2]], { s: 41, amp: 1.2, step: 3 });
const Qm = tear([[0, 36], [80, 28], [170, 41], [250, 26], [330, 35], [390, 24]], { s: 43, amp: 1.6, step: 3, spikeAmp: 3 });
write('hero-m-photo.svg', svg(390, 400, shape(d(Qm) + 'L390 400L0 400')));
write('hero-m-marble.svg', svg(390, 400, shape(d(Pm) + L(shift(Qm, 0, 6).reverse()))));

// ---- Cierre: borde superior rasgado (vino) + fleco de papel que asoma por encima.
// Desktop viewBox 1440 x 40, mobile 390 x 24. El fleco va 2–6 unidades más arriba que el borde.
function closingEdge(w, h, ctrl, opts, name) {
  const W = tear(ctrl, opts);
  seed = opts.s + 100;
  const D = W.map(([x, y]) => [x, Math.max(0, y - (2 + rnd() * 4))]);
  write(name + '.svg', svg(w, h, shape(d(W) + `L${w} ${h}L0 ${h}`)));
  write(name + '-fleco.svg', svg(w, h, shape(d(D) + `L${w} ${h}L0 ${h}`)));
}
closingEdge(1440, 40,
  [[0, 22], [120, 14], [260, 26], [390, 12], [540, 24], [700, 9], [860, 21], [1010, 13], [1160, 27], [1300, 15], [1440, 22]],
  { s: 61, amp: 2.4, step: 5, spike: .14, spikeAmp: 5 }, 'cierre-borde');
closingEdge(390, 24,
  [[0, 13], [60, 8], [130, 16], [200, 7], [270, 15], [330, 9], [390, 14]],
  { s: 67, amp: 1.3, step: 3, spike: .12, spikeAmp: 2.5 }, 'cierre-borde-m');

// ---- Oficio: borde superior rasgado (la foto y el marmolado entran rotos desde el papel).
closingEdge(1440, 40,
  [[0, 16], [150, 25], [300, 11], [450, 23], [610, 13], [760, 27], [920, 12], [1080, 22], [1230, 10], [1350, 24], [1440, 17]],
  { s: 83, amp: 2.4, step: 5, spike: .14, spikeAmp: 5 }, 'oficio-borde');
closingEdge(390, 24,
  [[0, 9], [70, 15], [140, 6], [210, 14], [280, 8], [340, 16], [390, 10]],
  { s: 89, amp: 1.3, step: 3, spike: .12, spikeAmp: 2.5 }, 'oficio-borde-m');

// ---- Footer: borde superior rasgado (carbón sobre el cierre). Sin fleco.
closingEdge(1440, 40,
  [[0, 20], [170, 9], [330, 22], [500, 12], [680, 25], [840, 10], [1010, 21], [1180, 8], [1320, 23], [1440, 13]],
  { s: 131, amp: 2.2, step: 5, spike: .14, spikeAmp: 5 }, 'pie-borde');
closingEdge(390, 24,
  [[0, 12], [65, 6], [135, 15], [205, 8], [275, 16], [335, 7], [390, 12]],
  { s: 137, amp: 1.3, step: 3, spike: .12, spikeAmp: 2.5 }, 'pie-borde-m');

// ---- Nuestras carnes (carbón): borde rasgado arriba y abajo. "-arriba": blanco debajo de la línea; "-abajo": blanco encima.
function band(w, h, ctrl, opts, name) {
  const W = tear(ctrl, opts);
  write(name + '.svg', svg(w, h, shape(d(W) + `L${w} 0L0 0`)));
}
closingEdge(1440, 40,
  [[0, 14], [160, 24], [320, 10], [480, 21], [650, 8], [820, 23], [990, 12], [1150, 26], [1300, 11], [1440, 19]],
  { s: 151, amp: 2.3, step: 5, spike: .14, spikeAmp: 5 }, 'carnes-arriba');
band(1440, 40,
  [[0, 24], [140, 13], [300, 27], [470, 15], [630, 29], [800, 14], [960, 26], [1130, 12], [1290, 25], [1440, 16]],
  { s: 157, amp: 2.3, step: 5, spike: .14, spikeAmp: 5 }, 'carnes-abajo');
closingEdge(390, 24,
  [[0, 10], [70, 16], [140, 7], [210, 15], [280, 6], [340, 14], [390, 9]],
  { s: 163, amp: 1.3, step: 3, spike: .12, spikeAmp: 2.5 }, 'carnes-arriba-m');
band(390, 24,
  [[0, 15], [60, 8], [130, 17], [200, 9], [270, 18], [330, 10], [390, 15]],
  { s: 167, amp: 1.3, step: 3, spike: .12, spikeAmp: 2.5 }, 'carnes-abajo-m');

// ---- Visitanos (papel sobre el bordó del cierre): borde superior.
closingEdge(1440, 40,
  [[0, 18], [150, 8], [310, 21], [460, 11], [640, 24], [800, 9], [970, 20], [1130, 10], [1290, 22], [1440, 12]],
  { s: 173, amp: 2.3, step: 5, spike: .14, spikeAmp: 5 }, 'visita-borde');
closingEdge(390, 24,
  [[0, 11], [70, 5], [140, 14], [210, 7], [280, 15], [340, 6], [390, 11]],
  { s: 179, amp: 1.3, step: 3, spike: .12, spikeAmp: 2.5 }, 'visita-borde-m');

// ---- Sombra del hero: la silueta foto+marmolado (borde de arriba y borde izquierdo rasgados), desenfocada.
// viewBox arranca en y=-30 para que la sombra pueda asomar por encima del borde superior.
{
  const shapeD = "M565 -40" + L(P) + "L480 760L1440 760L1440 -40";
  const body = `<defs><clipPath id="t"><path d="${d(T)}L1440 760L0 760Z"/></clipPath>` +
    `<filter id="b" filterUnits="userSpaceOnUse" x="-100" y="-80" width="1640" height="900"><feGaussianBlur stdDeviation="7"/></filter></defs>` +
    `<g filter="url(#b)"><path fill="#fff" d="${shapeD}Z"/></g>`;
  write("hero-sombra.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -30 1440 732" preserveAspectRatio="none">${body}</svg>\n`);
}

// ---- Header: borde inferior rasgado (blanco arriba de la línea), la hoja del header apoyada sobre el papel.
band(1440, 24,
  [[0, 12], [130, 6], [280, 15], [430, 8], [590, 17], [750, 7], [900, 14], [1060, 6], [1210, 16], [1340, 9], [1440, 13]],
  { s: 191, amp: 1.6, step: 5, spike: .14, spikeAmp: 3.5 }, 'header-borde');
band(390, 16,
  [[0, 8], [60, 4], [130, 10], [200, 5], [270, 11], [330, 5], [390, 9]],
  { s: 197, amp: 1, step: 3, spike: .12, spikeAmp: 2 }, 'header-borde-m');
