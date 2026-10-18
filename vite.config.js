import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 確保 GitHub Pages 子路徑能正確加載靜態資源
  envPrefix: ['VITE_', 'GOOGLE_', 'PASS_', 'QUESTION_'],
})
