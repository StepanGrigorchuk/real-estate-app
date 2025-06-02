import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],  resolve: {
    extensions: ['.js', '.jsx'], // Автоматически разрешаем .jsx
  },
  server: {
    host: true, // Разрешает доступ с внешних хостов
    port: 5173,
    allowedHosts: [
      '3f3b-45-85-105-94.ngrok-free.app',
      '.ngrok-free.app', // Разрешаем все ngrok домены
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      '/api': 'http://localhost:3000', 
    },
  },
});