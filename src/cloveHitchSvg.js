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

// --- Геометрия: ОДНА непрерывная нить, силуэт-крест (X) как у стремени ---
// Ход верёвки (rope-end clove hitch): KOR → DB (виток 1, перёд '/') → WTOP (за столбом,
// верхний обход) → DA (виток 2, перёд '\', ложится ПОВЕРХ DB = крест) → TUCK (кончик
// заправлен ПОД нижний виток у основания и торчит наружу).
// Два витка перекрещиваются (X) — это и есть узнаваемый силуэт. Front — после POST,
// back — до POST (за столбом, культи по краям видно, что нить обходит опору).
const DB = 'M150,450 L250,300'; // виток 1, перёд (диагональ '/')
const DA = 'M150,300 L245,440'; // виток 2, перёд (диагональ '\'), перекрест с DB
const WTOP = 'M250,300 L150,300'; // верхний обход за столбом (соединяет верхушки витков)
const KOR = 'M150,450 C140,545 145,605 148,648'; // коренной: от витка 1 за нижний край
const TIP1 = 'M150,300 L130,272'; // шаг1: кончик после первого витка торчит вверх-влево
const TIP2 = 'M245,440 L280,458'; // шаг2: кончик после второго витка торчит вниз-вправо

// Заправка (шаг 3): кончик уходит ЗА столб (TUCK3_BACK — слой back, столб перекрывает,
// контур обрывается о край опоры), затем выныривает и торчит наружу (TUCK3_FRONT + маркер).
const TUCK3_BACK = 'M243,438 L158,424';
const TUCK3_FRONT = 'M158,424 L144,419';

// Финал (шаг 4): ЗАТЯНУТО — компактный крест (витки круче/короче), концы РАЗВЕДЕНЫ.
const DB4 = 'M170,430 L230,320'; // виток 1, плотнее
const DA4 = 'M170,320 L205,435'; // виток 2, плотнее; перекрест компактнее
const WTOP4 = 'M230,320 L170,320'; // верхний обход за столбом (плотнее)
const KOR4 = 'M170,430 C155,520 150,590 150,648'; // коренной — снизу-СЛЕВА
const TUCK4_BACK = 'M205,435 L240,418'; // кончик уходит ЗА столб (слой back)
const TUCK4_FRONT = 'M240,418 L258,424'; // выныривает справа — с ДРУГОЙ стороны от коренного

// === ШАГ 1 ===
// Новое (насыщенное): первый виток (DB спереди + WTOP за столбом) и коренной.
// Видно: коренной снизу, нить огибает столб (культи WTOP по краям), кончик торчит вверх.
// Гало — на месте первого витка.
const step1 = frame(
  rope(WTOP, HODOVOY),
  halo(200, 375, 45) +
    rope(KOR, KORENNOY) +
    rope(DB, HODOVOY) +
    rope(TIP1, HODOVOY) +
    marker(130, 272),
);

// === ШАГ 2 ===
// Новое: второй виток DA ложится КРЕСТОМ поверх первого. DA рисуется после DB →
// его контур прерывает DB в точке перекреста (ходовой поверх). Первый виток и коренной
// приглушены — лежат там же, где на шаге 1. Гало — на точке перекреста.
const step2 = frame(
  rope(WTOP, HODOVOY_MUTED),
  halo(200, 375, 45) +
    rope(KOR, KORENNOY_MUTED) +
    rope(DB, HODOVOY_MUTED) +
    rope(DA, HODOVOY) +
    rope(TIP2, HODOVOY) +
    marker(280, 458),
);

// === ШАГ 3 ===
// Новое: кончик заправлен ПОД нижний виток у основания. TUCK рисуется ДО DB → контур
// витка прерывает заправку (кончик снизу). Остальное приглушено. Гало — на точке заправки.
const step3 = frame(
  rope(WTOP, HODOVOY_MUTED) + rope(TUCK3_BACK, HODOVOY),
  halo(212, 433, 45) +
    rope(KOR, KORENNOY_MUTED) +
    rope(TUCK3_FRONT, HODOVOY) +
    rope(DB, HODOVOY_MUTED) +
    rope(DA, HODOVOY_MUTED) +
    marker(144, 419),
);

// === ШАГ 4 ===
// Готово: всё насыщенное, приглушений нет. Крест плотный, оба конца торчат наружу:
// коренной снизу-слева, кончик ходового снизу-слева из-под витка. Широкое гало на узел.
const step4 = frame(
  rope(WTOP4, HODOVOY) + rope(TUCK4_BACK, HODOVOY),
  halo(200, 375, 72) +
    rope(KOR4, KORENNOY) +
    rope(DB4, HODOVOY) +
    rope(DA4, HODOVOY) +
    rope(TUCK4_FRONT, HODOVOY) +
    marker(258, 424),
);

export const cloveHitchSvgSteps = [step1, step2, step3, step4];
