import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      // Ensure proper path resolution
    }
  },
  define: {
    // Support for global variables if needed
  }
})

