import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    // Keep main process conditions
    conditions: ['node'],
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
});
