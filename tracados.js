// =========================================================
// tracados.js — desenhos dos tracados das pistas (SVG proprio, sem fotos)
// Cada pista tem uma lista de pontos; uma curva suave (Catmull-Rom) passa por eles.
// Quanto maior a pista, mais curvas o desenho tem. Usado na pagina inicial e no agendamento.
// =========================================================

const TRACADOS_PONTOS = {
  // kids: curtas e simples
  pista4: [[50, 95], [45, 60], [75, 35], [125, 35], [170, 45], [195, 70], [180, 100], [130, 108], [85, 105]],
  pista1: [[45, 100], [40, 65], [70, 40], [105, 48], [125, 70], [150, 50], [185, 38], [208, 62], [195, 95], [160, 108], [120, 100], [90, 115], [60, 112]],
  // junior: com chicane
  pista5: [[35, 105], [32, 70], [55, 42], [95, 36], [110, 60], [135, 70], [150, 45], [190, 32], [212, 55], [205, 85], [175, 95], [160, 118], [120, 122], [90, 100], [65, 118]],
  pista2: [[30, 110], [28, 60], [50, 32], [85, 38], [100, 62], [125, 40], [160, 30], [200, 40], [215, 70], [195, 92], [165, 80], [140, 95], [160, 118], [120, 125], [85, 108], [60, 122]],
  // open: longas, com varias curvas
  pista6: [[28, 115], [25, 70], [40, 35], [78, 28], [95, 50], [80, 70], [110, 82], [130, 55], [150, 30], [190, 25], [218, 50], [212, 85], [182, 92], [170, 112], [195, 125], [150, 130], [120, 112], [95, 128], [60, 130]],
  pista3: [[25, 118], [22, 75], [35, 38], [70, 25], [100, 35], [88, 58], [118, 66], [140, 40], [165, 22], [205, 28], [225, 58], [208, 80], [222, 105], [190, 128], [160, 115], [148, 130], [115, 128], [100, 106], [78, 120], [50, 132]],
};

// curva fechada suave passando pelos pontos (Catmull-Rom convertida em Bezier)
function tracadoPista(codigo) {
  const pts = TRACADOS_PONTOS[codigo];
  if (!pts) return null;
  const n = pts.length;
  const f = (v) => Math.round(v * 10) / 10;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${p2[0]} ${p2[1]}`;
  }
  d += ' Z';
  // linha de largada: perpendicular ao sentido do primeiro trecho
  const a = pts[0], b = pts[1];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len;
  const largada = { x1: f(a[0] - nx * 9), y1: f(a[1] - ny * 9), x2: f(a[0] + nx * 9), y2: f(a[1] + ny * 9) };
  return { d, largada };
}

// componente React (sem JSX, para este arquivo carregar como script comum)
// a cor vem do texto do elemento pai (currentColor), entao combina com o tema claro/escuro
function TracadoPista({ codigo, className }) {
  const t = tracadoPista(codigo);
  if (!t) return null;
  const h = React.createElement;
  return h('svg', { viewBox: '0 0 240 150', className, role: 'img', 'aria-label': 'Desenho do traçado da pista', preserveAspectRatio: 'xMidYMid meet' },
    h('path', { d: t.d, fill: 'none', stroke: 'currentColor', strokeOpacity: 0.3, strokeWidth: 15, strokeLinejoin: 'round', strokeLinecap: 'round' }),
    h('path', { d: t.d, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeDasharray: '6 5', strokeLinejoin: 'round' }),
    h('line', { ...t.largada, stroke: '#ffffff', strokeWidth: 3, strokeLinecap: 'butt' }),
    h('line', { ...t.largada, stroke: '#111827', strokeWidth: 3, strokeDasharray: '3 3', strokeLinecap: 'butt' }));
}
