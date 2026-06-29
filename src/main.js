import './style.css';
import { knots } from './knots.js';

// Telegram Web App SDK подключён скриптом в index.html.
// window.Telegram.WebApp есть только когда страницу открыли внутри Telegram.
const tg = window.Telegram?.WebApp;

let greeting;

if (tg) {
  // Сообщаем Telegram, что приложение готово, и разворачиваем на весь экран.
  tg.ready();
  tg.expand();

  const user = tg.initDataUnsafe?.user;
  if (user?.first_name) {
    greeting = `Привет, ${user.first_name}`;
  } else {
    // Внутри Telegram, но данных пользователя нет (например, превью без запуска).
    greeting = 'Открой через бота в Telegram';
  }
} else {
  // Страницу открыли в обычном браузере — Telegram SDK недоступен.
  greeting = 'Открой через бота в Telegram';
}

// === СТАТУСЫ УЗЛОВ (только в памяти сессии; CloudStorage — отдельный этап) ===
// Три значения: 'new' (не начат) / 'studied' (изучен) / 'passed' (пройден).
const STATUS = { new: 'new', studied: 'studied', passed: 'passed' };
const STATUS_LABEL = {
  new: 'не начат',
  studied: 'изучен',
  passed: 'пройден',
};
// Статус хранится по id узла.
const statuses = {};
knots.forEach((k) => {
  statuses[k.id] = STATUS.new;
});

function markStudied(id) {
  // «Изучен» ставим только если был «не начат» — «пройден» не понижаем.
  if (statuses[id] === STATUS.new) {
    statuses[id] = STATUS.studied;
  }
}

function markPassed(id) {
  statuses[id] = STATUS.passed;
}

const app = document.querySelector('#app');

// Каркас: четыре экрана на одной странице, переключаются видимостью (класс hidden).
// Без роутера.
app.innerHTML = `
  <section id="list-screen" class="screen">
    <h1>Tie Hard</h1>
    <p class="greeting">${greeting}</p>
    <ul class="knots" id="knots-list"></ul>
  </section>
  <section id="knot-screen" class="screen knot-screen hidden"></section>
  <section id="quiz-screen" class="screen knot-screen hidden"></section>
  <section id="result-screen" class="screen knot-screen hidden"></section>
`;

const SCREENS = ['list-screen', 'knot-screen', 'quiz-screen', 'result-screen'];
function showScreen(id) {
  SCREENS.forEach((s) => {
    document.getElementById(s).classList.toggle('hidden', s !== id);
  });
  window.scrollTo(0, 0);
}

const knotsList = document.querySelector('#knots-list');

// === ЭКРАН СПИСКА ===
// Список рендерится перебором массива; статус — из состояния. Перерисовываем при возврате.
function renderList() {
  knotsList.innerHTML = knots
    .map((knot, i) => {
      const status = statuses[knot.id];
      return `
        <li class="knot" data-index="${i}">
          <span class="knot-name">${knot.name}</span>
          <span class="status status-${status}">${STATUS_LABEL[status]}</span>
        </li>`;
    })
    .join('');
}

knotsList.addEventListener('click', (event) => {
  const li = event.target.closest('.knot');
  if (li) {
    openKnot(Number(li.dataset.index));
  }
});

// === ЭКРАН УЗЛА (изучение) ===
const knotScreen = document.querySelector('#knot-screen');
let currentKnot = null;
let currentStep = 0;

function openKnot(index) {
  currentKnot = knots[index];
  currentStep = 0;
  markStudied(currentKnot.id); // открытие узла = «изучен»
  renderKnot();
  showScreen('knot-screen');
}

function renderKnot() {
  const k = currentKnot;
  const total = k.steps.length; // число шагов из длины массива

  const akaHtml = k.aka ? `<p class="aka">${k.aka}</p>` : '';

  const usageHtml = k.usage.length
    ? `<ul class="usage">${k.usage.map((u) => `<li>${u}</li>`).join('')}</ul>`
    : `<p class="placeholder">Применение появится позже</p>`;

  const mistakeHtml = k.common_mistake
    ? `<p class="mistake">${k.common_mistake}</p>`
    : `<p class="placeholder">—</p>`;

  let stepsBlock;
  if (total === 0) {
    stepsBlock = `<p class="placeholder">Шаги появятся позже</p>`;
  } else {
    // Если у узла есть нарисованная схема текущего шага — показываем её.
    // Иначе (узлы без svgSteps) остаётся серая заглушка с номером шага.
    const schema =
      k.svgSteps && k.svgSteps[currentStep]
        ? k.svgSteps[currentStep]
        : `<svg class="step-canvas" viewBox="0 0 400 640" role="img" aria-label="Схема шага ${currentStep + 1}">
        <rect x="0" y="0" width="400" height="640" rx="16" fill="#3a3a3a" />
        <text x="200" y="320" class="step-canvas-num">${currentStep + 1}</text>
      </svg>`;
    stepsBlock = `
      ${schema}
      <p class="step-counter">Шаг ${currentStep + 1} из ${total}</p>
      <p class="step-text">${k.steps[currentStep]}</p>
      <div class="step-nav">
        <button id="prev-step" ${currentStep === 0 ? 'disabled' : ''}>← Назад</button>
        <button id="next-step" ${currentStep === total - 1 ? 'disabled' : ''}>Вперёд →</button>
      </div>
    `;
  }

  // Кнопка входа в квиз; неактивна, если вопросов нет.
  const hasQuiz = k.quiz.length > 0;
  const quizBtn = `<button id="start-quiz" class="primary" ${hasQuiz ? '' : 'disabled'}>
      ${hasQuiz ? 'Пройти квиз' : 'Квиз появится позже'}
    </button>`;

  knotScreen.innerHTML = `
    <button id="back-to-list" class="back">← К списку</button>
    <h1 class="knot-title">${k.name}</h1>
    ${akaHtml}
    <h2 class="section-title">Зачем нужен</h2>
    ${usageHtml}
    <h2 class="section-title">Типичная ошибка</h2>
    ${mistakeHtml}
    <h2 class="section-title">Как вязать</h2>
    ${stepsBlock}
    ${quizBtn}
  `;

  knotScreen.querySelector('#back-to-list').addEventListener('click', goToList);

  const prev = knotScreen.querySelector('#prev-step');
  const next = knotScreen.querySelector('#next-step');
  if (prev) {
    prev.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep -= 1;
        renderKnot();
      }
    });
  }
  if (next) {
    next.addEventListener('click', () => {
      if (currentStep < total - 1) {
        currentStep += 1;
        renderKnot();
      }
    });
  }

  const quizStart = knotScreen.querySelector('#start-quiz');
  if (hasQuiz) {
    quizStart.addEventListener('click', startQuiz);
  }
}

// Возврат к списку с перерисовкой (чтобы смена статуса была видна).
function goToList() {
  renderList();
  showScreen('list-screen');
}

// === ЭКРАН КВИЗА ===
const quizScreen = document.querySelector('#quiz-screen');
let quizIndex = 0;
let quizCorrect = 0;

function startQuiz() {
  quizIndex = 0;
  quizCorrect = 0;
  renderQuiz();
  showScreen('quiz-screen');
}

function renderQuiz() {
  const quiz = currentKnot.quiz;
  const total = quiz.length;
  const item = quiz[quizIndex];

  const optionsHtml = item.options
    .map(
      (opt, i) => `<button class="quiz-option" data-option="${i}">${opt}</button>`,
    )
    .join('');

  quizScreen.innerHTML = `
    <h1 class="knot-title">${currentKnot.name}</h1>
    <p class="step-counter">Вопрос ${quizIndex + 1} из ${total}</p>
    <p class="quiz-question">${item.q}</p>
    <div class="quiz-options">${optionsHtml}</div>
  `;

  quizScreen.querySelector('.quiz-options').addEventListener('click', (event) => {
    const btn = event.target.closest('.quiz-option');
    if (!btn) return;
    // Сверяем индекс выбранного варианта с correct (индекс с нуля).
    if (Number(btn.dataset.option) === item.correct) {
      quizCorrect += 1;
    }
    quizIndex += 1;
    if (quizIndex < total) {
      renderQuiz();
    } else {
      finishQuiz();
    }
  });
}

// === ЭКРАН РЕЗУЛЬТАТА ===
const resultScreen = document.querySelector('#result-screen');
const PASS_THRESHOLD = 0.8; // порог сдачи — 80%

function finishQuiz() {
  const total = currentKnot.quiz.length;
  const ratio = quizCorrect / total;
  const passed = ratio >= PASS_THRESHOLD;

  if (passed) {
    markPassed(currentKnot.id); // статус «пройден»; при провале статус не трогаем
  }

  const verdictClass = passed ? 'verdict-pass' : 'verdict-fail';
  const verdictText = passed ? 'Сдано' : 'Не сдано';
  const retryBtn = passed
    ? ''
    : `<button id="retry-quiz" class="primary">Пройти заново</button>`;

  resultScreen.innerHTML = `
    <h1 class="knot-title">${currentKnot.name}</h1>
    <p class="verdict ${verdictClass}">${verdictText}</p>
    <p class="score">Верных ${quizCorrect} из ${total}</p>
    ${retryBtn}
    <button id="result-to-list" class="back">К списку</button>
  `;

  resultScreen.querySelector('#result-to-list').addEventListener('click', goToList);
  const retry = resultScreen.querySelector('#retry-quiz');
  if (retry) {
    retry.addEventListener('click', startQuiz);
  }

  showScreen('result-screen'); // переключаемся на экран результата
}

// Первый рендер списка.
renderList();
