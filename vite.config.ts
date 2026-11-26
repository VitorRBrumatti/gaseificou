import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const APP_ROUTE = /^\/(app|entrar|criar-conta|cliente)(\/|$|\?)/

function appSpaFallback(): Plugin {
  return {
    name: 'app-spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url ?? ''
        if (APP_ROUTE.test(url)) req.url = '/app.html'
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [appSpaFallback(), react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: {
        site: 'index.html',
        app: 'app.html',
      },
    },
  },
})
