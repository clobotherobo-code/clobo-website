import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
    },
  },
  optimizeDeps: {
    // INI KUNCINYA: Memaksa Vite memproses library blockchain tanpa error external
    disabled: false,
    include: ['@privy-io/react-auth', '@solana/web3.js', 'buffer'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});