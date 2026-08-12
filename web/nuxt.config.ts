import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const routesPath = fileURLToPath(new URL('./generated/routes.json', import.meta.url))
const prerenderRoutes = existsSync(routesPath)
  ? JSON.parse(readFileSync(routesPath, 'utf8')) as string[]
  : []

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: true,
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
    typeCheck: false,
  },
  nitro: {
    prerender: {
      routes: prerenderRoutes,
    },
  },
  vite: {
    optimizeDeps: {
      include: ['markdown-it'],
    },
  },
})
