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

// --- Геометрия (одинаковая во всех кадрах, камера зафиксирована) ---
// Две фронтальные диагонали образуют крест перед столбом; их концы уходят за
// столб через горизонтальные «обороты» WT (сверху) и WB (снизу): середина оборота
// скрыта столбом, по краям торчат «культи» — видно, что верёвка обходит опору.
const DA = 'M150,300 L250,430'; // первый виток: фронтальная диагональ (верх-лево → низ-право)
const DB = 'M150,430 L250,300'; // второй виток: фронтальная диагональ (низ-лево → верх-право), крест с DA
// Обороты за столбом: тянутся ЗА края опоры (138 и 262), середина (165..235) скрыта
// столбом → по краям торчат горизонтальные «культи», видно что верёвка уходит за опору.
const WT = 'M138,300 L262,300'; // оборот сверху, за столбом
const WB = 'M138,430 L262,430'; // оборот снизу, за столбом
const KOR = 'M250,430 C252,520 244,592 236,648'; // коренной: от нижнего витка за нижний край
const TIP1 = 'M250,300 L300,262'; // шаг1: кончик ходового выходит справа вверх-вправо
const TIP2 = 'M250,300 L298,264'; // шаг2: кончик после второго витка
const TUCK = 'M222,322 L172,452'; // шаг3-4: кончик продет ПОД верхний виток и торчит наружу вниз-влево

// === ШАГ 1 ===
// Новое: первый виток (DA спереди + WT за столбом) и коренной — оба насыщенные.
// Видно: красный пересекает столб спереди, уходит за него сверху (культи по краям),
// выходит справа и идёт вверх-вправо к маркеру. Гало по центру столба на высоте витка.
const step1 = frame(
  rope(WT, HODOVOY),
  halo(200, 360, 45) +
    rope(KOR, KORENNOY) +
    rope(DA, HODOVOY) +
    rope(TIP1, HODOVOY) +
    marker(300, 262),
);

// === ШАГ 2 ===
// Новое: второй виток (DB спереди + WB за столбом) ложится КРЕСТОМ поверх первого.
// DB рисуется после DA → его контур прерывает DA в точке креста (ходовой поверх).
// Первый виток и коренной приглушены.
const step2 = frame(
  rope(WT, HODOVOY_MUTED) + rope(WB, HODOVOY),
  halo(200, 365, 45) +
    rope(KOR, KORENNOY_MUTED) +
    rope(DA, HODOVOY_MUTED) +
    rope(DB, HODOVOY) +
    rope(TIP2, HODOVOY) +
    marker(298, 264),
);

// === ШАГ 3 ===
// Новое: кончик продет ПОД верхнюю диагональ (DB). TUCK рисуется ДО DB → контур DB
// прерывает заправку (кончик снизу). Остальное приглушено. Гало РОВНО на точке заправки.
const step3 = frame(
  rope(WT, HODOVOY_MUTED) + rope(WB, HODOVOY_MUTED),
  halo(211, 351, 45) +
    rope(KOR, KORENNOY_MUTED) +
    rope(DA, HODOVOY_MUTED) +
    rope(TUCK, HODOVOY) +
    rope(DB, HODOVOY_MUTED) +
    marker(172, 452),
);

// === ШАГ 4 ===
// Готово: все сегменты насыщенные, приглушений нет. Два витка крест-накрест на столбе,
// коренной торчит снизу-справа, кончик ходового — снизу-слева (виден наружу).
// Широкое гало Ø140 на весь узел.
const step4 = frame(
  rope(WT, HODOVOY) + rope(WB, HODOVOY),
  halo(200, 365, 70) +
    rope(KOR, KORENNOY) +
    rope(DA, HODOVOY) +
    rope(TUCK, HODOVOY) +
    rope(DB, HODOVOY) +
    marker(172, 452),
);

export const cloveHitchSvgSteps = [step1, step2, step3, step4];
