// SVG-кадры стремени (clove hitch, rope-end) по стиль-гайду арт-директора.
// Все размеры/цвета — строго из Style guide SVG.txt. Камера зафиксирована,
// опора не двигается между кадрами, двигается только верёвка.
// Главный принцип геометрии: верёвка ОГИБАЕТ столб — часть витка уходит ЗА опору
// (рисуется ДО POST, столб её перекрывает), часть выходит вперёд (рисуется ПОСЛЕ POST).

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
const KONTUR_W = 3; // тёмная обводка с каждой стороны
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

// back — сегменты ЗА столбом (рисуются до POST, столб их перекрывает);
// front — всё перед столбом (рисуется после POST).
function frame(back, front) {
  return `<svg class="step-canvas" viewBox="0 0 400 640" xmlns="http://www.w3.org/2000/svg" role="img">${BG}${back}${POST}${front}</svg>`;
}

// --- Геометрия: ОДНА непрерывная нить, оба оборота в одну сторону ---
// Ход верёвки от коренного к кончику ходового (rope-end clove hitch):
//   KOR → TURN1 (нижний оборот, перёд) → BACK1 (за столбом) → BRIDGE (диагональ-
//   перемычка вверх, проходит ПОВЕРХ нижнего оборота = крест) → BACK2 (за столбом)
//   → TURN2 (верхний оборот, перёд, ТОТ ЖЕ наклон, что TURN1) → TAIL (кончик заправлен
//   ПОД перемычку и торчит наружу).
// Оба оборота (TURN1, TURN2) — параллельны (наклон -0.5). Крест даёт перемычка BRIDGE,
// пересекая нижний оборот. Front — после POST (перед столбом), back — до POST (за ним).
const TURN1 = 'M150,470 L250,430'; // нижний оборот, перёд (пологий наклон)
const TURN2 = 'M150,300 L250,260'; // верхний оборот, перёд (параллелен TURN1, заметно выше)
const BRIDGE = 'M150,520 L250,270'; // перемычка: КРУТАЯ → пересекает пологий нижний виток под явным углом (крест)
const BACK1 = 'M250,430 L150,520'; // за столбом: от конца TURN1 к началу BRIDGE
const BACK2 = 'M250,270 L150,300'; // за столбом: от конца BRIDGE к началу TURN2
const KOR = 'M150,470 C140,560 145,610 148,648'; // коренной: от нижнего оборота за нижний край
const TIP1 = 'M150,520 L132,455'; // шаг1: кончик после первого оборота торчит вверх
const TIP2 = 'M250,260 L286,242'; // шаг2: кончик после второго оборота
const TAIL = 'M238,285 L188,470'; // шаг3-4: заправка ПОД перемычку, кончик торчит наружу вниз

// === ШАГ 1 ===
// Новое (насыщенное): первый оборот (TURN1 спереди + BACK1 за столбом) и коренной.
// Видно: коренной снизу, нить огибает столб (культи BACK1 по краям), кончик торчит вверх.
// Гало — на месте первого оборота.
const step1 = frame(
  rope(BACK1, HODOVOY),
  halo(200, 450, 45) +
    rope(KOR, KORENNOY) +
    rope(TURN1, HODOVOY) +
    rope(TIP1, HODOVOY) +
    marker(132, 455),
);

// === ШАГ 2 ===
// Новое: перемычка BRIDGE (вверх, ПОВЕРХ нижнего оборота = крест) + второй оборот TURN2
// тем же наклоном выше. BRIDGE рисуется после TURN1 → прерывает его в точке креста.
// Первый оборот и коренной — приглушены, лежат там же и тем же наклоном, что на шаге 1.
const step2 = frame(
  rope(BACK1, HODOVOY_MUTED) + rope(BACK2, HODOVOY),
  halo(174, 460, 45) +
    rope(KOR, KORENNOY_MUTED) +
    rope(TURN1, HODOVOY_MUTED) +
    rope(BRIDGE, HODOVOY) +
    rope(TURN2, HODOVOY) +
    rope(TIP2, HODOVOY) +
    marker(286, 242),
);

// === ШАГ 3 ===
// Новое: кончик заправлен ПОД перемычку. TAIL рисуется ДО BRIDGE → контур перемычки
// прерывает заправку (кончик снизу). Остальное приглушено. Гало — на точке заправки.
const step3 = frame(
  rope(BACK1, HODOVOY_MUTED) + rope(BACK2, HODOVOY_MUTED),
  halo(226, 331, 45) +
    rope(KOR, KORENNOY_MUTED) +
    rope(TURN1, HODOVOY_MUTED) +
    rope(TURN2, HODOVOY_MUTED) +
    rope(TAIL, HODOVOY) +
    rope(BRIDGE, HODOVOY_MUTED) +
    marker(188, 470),
);

// === ШАГ 4 ===
// Готово: всё насыщенное, приглушений нет. Узел плотный, оба конца торчат наружу:
// коренной снизу-слева, кончик ходового снизу. Широкое гало Ø140 на весь узел.
const step4 = frame(
  rope(BACK1, HODOVOY) + rope(BACK2, HODOVOY),
  halo(200, 400, 75) +
    rope(KOR, KORENNOY) +
    rope(TURN1, HODOVOY) +
    rope(TAIL, HODOVOY) +
    rope(BRIDGE, HODOVOY) +
    rope(TURN2, HODOVOY) +
    marker(188, 470),
);

export const cloveHitchSvgSteps = [step1, step2, step3, step4];
