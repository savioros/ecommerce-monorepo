import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // usePolling ativado via VITE_WATCH_POLL=1 para ambientes Docker sem suporte a inotify
    watch: {
      usePolling: !!process.env.VITE_WATCH_POLL,
    },
  },
})
