// SVG-кадры стремени (clove hitch) по стиль-гайду арт-директора.
// Все размеры/цвета — строго из Style guide SVG.txt. Камера зафиксирована,
// опора не двигается между кадрами, двигается только верёвка.
// Результат — массив из 4 строк SVG (по одному кадру на шаг), он же кладётся
// в данные узла как svgSteps.

// --- Палитра (точные hex из гайда) ---
const OUTLINE = '#2A2A2A'; // тёмная обводка верёвки и опоры
const HODOVOY = '#E8472B'; // ходовой конец (насыщенный)
const HODOVOY_MUTED = '#E8A99B'; // ходовой приглушённый (прошлый сегмент)
const KORENNOY = '#2B6CE8'; // коренной конец (насыщенный)
const KORENNOY_MUTED = '#B9C4D6'; // коренной приглушённый
const FOKUS = '#FFC400'; // гало фокуса
const FON = '#F4F1EA'; // фон кадра
const OPORA = '#8A8A8A'; // опора
const OPORA_EDGE = '#6E6E6E'; // грань опоры для объёма

// --- Линии (px при viewBox 400×640) ---
const ROPE_W = 24; // толщина шнура
const KONTUR_W = 3; // тёмная обводка с каждой стороны → суммарно ROPE_W + 2*KONTUR_W
const OUTLINE_W = ROPE_W + 2 * KONTUR_W; // 30
const FOKUS_W = 6; // толщина кольца-гало

// Сегмент верёвки: сначала тёмный контур (шире), затем цветная сердцевина.
// Порядок вызовов = z-порядок: верхний сегмент рисуется позже и его контур
// прерывает нижний (правило над/под).
function rope(d, color) {
  return (
    `<path d="${d}" fill="none" stroke="${OUTLINE}" stroke-width="${OUTLINE_W}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${ROPE_W}" stroke-linecap="round" stroke-linejoin="round"/>`
  );
}

// Маркер Ø16 на кончике ходового конца.
function marker(x, y) {
  return `<circle cx="${x}" cy="${y}" r="8" fill="${HODOVOY}" stroke="${OUTLINE}" stroke-width="${KONTUR_W}"/>`;
}

// Незамкнутое кольцо-гало фокуса, полупрозрачное, позади верёвки.
function halo(cx, cy, r) {
  const c = 2 * Math.PI * r;
  const gap = c * 0.16;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${FOKUS}" stroke-width="${FOKUS_W}" opacity="0.5" stroke-linecap="round" stroke-dasharray="${(c - gap).toFixed(1)} ${gap.toFixed(1)}"/>`;
}

// Фон + опора (вертикальный серый столб по центру, ширина 70, грань справа).
const BG = `<rect x="0" y="0" width="400" height="640" fill="${FON}"/>`;
const POST =
  `<rect x="165" y="0" width="70" height="640" fill="${OPORA}"/>` +
  `<rect x="225" y="0" width="10" height="640" fill="${OPORA_EDGE}"/>` +
  `<line x1="166.5" y1="0" x2="166.5" y2="640" stroke="${OUTLINE}" stroke-width="${KONTUR_W}"/>` +
  `<line x1="233.5" y1="0" x2="233.5" y2="640" stroke="${OUTLINE}" stroke-width="${KONTUR_W}"/>`;

function frame(inner) {
  return `<svg class="step-canvas" viewBox="0 0 400 640" xmlns="http://www.w3.org/2000/svg" role="img">${BG}${POST}${inner}</svg>`;
}

// --- Геометрия (одинаковая во всех кадрах, камера зафиксирована) ---
const D1 = 'M150,378 L250,292'; // первый виток: фронтальная диагональ через опору
const D2 = 'M150,292 L250,378'; // второй виток: диагональ, пересекает D1 (крест)
const BLUE = 'M150,378 C150,470 172,560 172,648'; // коренной уходит за нижний край
const D1_TIP1 = 'M150,378 L250,292 L296,258'; // шаг1: первый виток + кончик вправо-вверх
const D2_TIP2 = 'M150,292 L250,378 L298,404'; // шаг2: второй виток + торчащий кончик
const TUCK = 'M196,300 L232,432'; // шаг3-4: кончик продет под верхний виток, уходит вниз

// === ШАГ 1 ===
// Новое: первый виток ходового (красный) + коренной внизу (синий). Гало по центру опоры.
const step1 = frame(
  halo(200, 330, 45) +
    rope(BLUE, KORENNOY) +
    rope(D1_TIP1, HODOVOY) +
    marker(296, 258),
);

// === ШАГ 2 ===
// Новое: второй виток + перекрёст (насыщенный). Первый виток и коренной приглушены.
// D2 рисуется последним → его контур прерывает D1 в точке креста (ходовой поверх).
const step2 = frame(
  halo(200, 335, 45) +
    rope(BLUE, KORENNOY_MUTED) +
    rope(D1, HODOVOY_MUTED) +
    rope(D2_TIP2, HODOVOY) +
    marker(298, 404),
);

// === ШАГ 3 ===
// Новое: заправка кончика ПОД верхний виток (TUCK, насыщенный). Остальное приглушено.
// TUCK рисуется до D2 → контур D2 прерывает TUCK (кончик проходит под витком).
const step3 = frame(
  halo(206, 366, 45) +
    rope(BLUE, KORENNOY_MUTED) +
    rope(D1, HODOVOY_MUTED) +
    rope(TUCK, HODOVOY) +
    rope(D2, HODOVOY_MUTED) +
    marker(232, 432),
);

// === ШАГ 4 ===
// Готово: все сегменты насыщенные, приглушений нет. Широкое гало Ø140 на весь узел.
const step4 = frame(
  halo(200, 340, 70) +
    rope(BLUE, KORENNOY) +
    rope(D1, HODOVOY) +
    rope(TUCK, HODOVOY) +
    rope(D2, HODOVOY) +
    marker(232, 432),
);

export const cloveHitchSvgSteps = [step1, step2, step3, step4];
