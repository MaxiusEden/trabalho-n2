import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Plugin do React para habilitar Fast Refresh no Vite
  plugins: [react()],
})
