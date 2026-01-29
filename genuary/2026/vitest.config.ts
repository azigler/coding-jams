import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    // Don't watch by default for CI
    watch: false,
    // Reporter for better output
    reporters: ['verbose'],
    // Clear mocks between tests
    clearMocks: true,
    // Timeout for individual tests
    testTimeout: 10000,
  },
});
