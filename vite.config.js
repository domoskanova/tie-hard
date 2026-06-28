import { defineConfig } from 'vite';

// Привязываем dev-сервер явно к IPv4 (127.0.0.1).
// На некоторых Windows-машинах "localhost" резолвится в IPv6 (::1),
// из-за чего сервер слушает ::1, а браузер стучится на 127.0.0.1 и не открывается.
export default defineConfig({
  server: {
    host: '127.0.0.1',
  },
});
