import './style.css';

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

document.querySelector('#app').innerHTML = `
  <div class="screen">
    <h1>Tie Hard работает</h1>
    <p class="greeting">${greeting}</p>
  </div>
`;
