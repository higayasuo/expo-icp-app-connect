import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ExpoIcpAppConnect',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'expo-crypto-universal', 'expo-icp-app-connect-helpers', 'expo-icp-frontend-helpers', 'expo-linking', 'expo-router', 'expo-storage-universal', 'expo-web-browser'],
    },
  },
});