import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx'], // Автоматически разрешаем .jsx
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});