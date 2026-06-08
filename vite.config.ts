import * as path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        shared: path.resolve(__dirname, 'src/shared'),
      },
    },
    optimizeDeps: {
      exclude: ['chunk-D3PEK6IK'],
      force: true,
    },
    server: {
      proxy: {
        '/s3-mock': {
          target: process.env.VITE_REACT_BACKEND_URL || 'http://localhost:8082',
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: process.env.VITE_REACT_BACKEND_URL || 'http://localhost:8082',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
