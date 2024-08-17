import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Polyfill Buffer with the `buffer` package
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Define globalThis for Buffer polyfill 
      define: {
        global: 'globalThis',
      },
      // Include polyfills for Buffer
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  }
})
