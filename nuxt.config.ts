import { config } from 'dotenv'
config()

export default defineNuxtConfig({
  devtools: { enabled: false },

  compatibilityDate: "2024-07-04",
  extends: ['@nuxt/ui-pro'],
  modules: ["@nuxt/ui"]
})