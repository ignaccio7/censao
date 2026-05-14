// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    exclude: [
      'tests/e2e/**',
      'tests/funcionales/**',
      'tests/init.spec.ts',
      'node_modules',
      'playwright-report/**',
      'test-results/**'
    ]
  },
  resolve: {
    alias: {
      // Alias para @/ que apunte a la carpeta src
      '@': path.resolve(__dirname, './src')
    }
  }
})
