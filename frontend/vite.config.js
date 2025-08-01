import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import jsconfigPaths from "vite-jsconfig-paths"
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), jsconfigPaths(), tailwindcss()],
  server: {
    proxy:{
      "/api":{
        target: "http://localhost:5000"
      }
    }
  }
})
