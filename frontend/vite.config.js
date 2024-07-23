import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from "vite-plugin-compression2"

export default defineConfig({
  plugins: [react(), viteCompression({ algorithm: "brotliCompress" })],
})
