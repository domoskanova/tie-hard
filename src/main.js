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

const app = document.querySelector('#app');

// Каркас: два экрана на одной странице, переключаются видимостью (класс hidden).
// Без роутера. Список узлов рендерится перебором массива из knots.js.
const listItems = knots
  .map((knot, i) => `<li class="knot" data-index="${i}">${knot.name}</li>`)
  .join('');

app.innerHTML = `
  <section id="list-screen" class="screen">
    <h1>Tie Hard</h1>
    <p class="greeting">${greeting}</p>
    <ul class="knots">${listItems}</ul>
  </section>
  <section id="knot-screen" class="screen knot-screen hidden"></section>
`;

const listScreen = document.querySelector('#list-screen');
const knotScreen = document.querySelector('#knot-screen');

// Состояние экрана узла.
let currentKnot = null;
let currentStep = 0;

function showList() {
  knotScreen.classList.add('hidden');
  listScreen.classList.remove('hidden');
}

function openKnot(index) {
  currentKnot = knots[index];
  currentStep = 0;
  renderKnot();
  listScreen.classList.add('hidden');
  knotScreen.classList.remove('hidden');
  window.scrollTo(0, 0);
}

function renderKnot() {
  const k = currentKnot;
  const total = k.steps.length; // число шагов берём из длины массива

  // aka — строкой под названием; если пусто, блок прячем (просто не выводим).
  const akaHtml = k.aka ? `<p class="aka">${k.aka}</p>` : '';

  // usage — списком; если пусто, показываем placeholder.
  const usageHtml = k.usage.length
    ? `<ul class="usage">${k.usage.map((u) => `<li>${u}</li>`).join('')}</ul>`
    : `<p class="placeholder">Применение появится позже</p>`;

  // common_mistake — отдельным блоком; если пусто, placeholder «—».
  const mistakeHtml = k.common_mistake
    ? `<p class="mistake">${k.common_mistake}</p>`
    : `<p class="placeholder">—</p>`;

  // Листание шагов: по одному шагу на экране.
  let stepsBlock;
  if (total === 0) {
    stepsBlock = `<p class="placeholder">Шаги появятся позже</p>`;
  } else {
    stepsBlock = `
      <!-- Заглушка SVG-схемы: пропорции холста из стиль-гайда 400×640 (5:8). -->
      <svg class="step-canvas" viewBox="0 0 400 640" role="img" aria-label="Схема шага ${currentStep + 1}">
        <rect x="0" y="0" width="400" height="640" rx="16" fill="#3a3a3a" />
        <text x="200" y="320" class="step-canvas-num">${currentStep + 1}</text>
      </svg>
      <p class="step-counter">Шаг ${currentStep + 1} из ${total}</p>
      <p class="step-text">${k.steps[currentStep]}</p>
      <div class="step-nav">
        <button id="prev-step" ${currentStep === 0 ? 'disabled' : ''}>← Назад</button>
        <button id="next-step" ${currentStep === total - 1 ? 'disabled' : ''}>Вперёд →</button>
      </div>
    `;
  }

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
  `;

  // Навешиваем обработчики на свежую разметку.
  knotScreen.querySelector('#back-to-list').addEventListener('click', showList);

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
}

// Клик по узлу в списке (делегирование) — открываем его экран.
listScreen.querySelector('.knots').addEventListener('click', (event) => {
  const li = event.target.closest('.knot');
  if (li) {
    openKnot(Number(li.dataset.index));
  }
});
