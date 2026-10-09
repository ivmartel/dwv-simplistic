import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    // browser like environment (document, HTMLElement...)
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      // text: console summary, html: browsable report, lcov: CI tools
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage'
    }
  }
});
