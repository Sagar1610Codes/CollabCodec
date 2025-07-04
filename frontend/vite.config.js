import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { monaco } from '@bithero/monaco-editor-vite-plugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    // monaco({
    //   languages : ["javascript"]
    // }),
  ],
  server: {
    host: true, // or use your IP explicitly, like '192.168.0.100'
    port: 5173
  },
})
