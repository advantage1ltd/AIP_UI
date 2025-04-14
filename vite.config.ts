import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
// Import our custom Radix UI resolver plugin
import radixResolver from "./src/vite-plugins/radix-resolver.ts"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    // Add our custom plugin before the React plugin
    radixResolver(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    // Exclude problematic packages
    exclude: [
      '@radix-ui/react-accordion', 
      '@radix-ui/react-dropdown-menu', 
      '@radix-ui/react-scroll-area', 
      '@radix-ui/react-card', 
      '@tanstack/react-table'
    ],
    include: [
      // React core
      'react', 
      'react-dom',
      'react-redux',
      'react-router-dom',
      
      // Safe Radix UI components
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-popover',
      '@radix-ui/react-dialog',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-toast',
      '@radix-ui/react-label',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-avatar',
      '@radix-ui/react-select',
      '@radix-ui/react-progress',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-radio-group',
      
      // Other UI libraries
      'lucide-react',
      'framer-motion',
      'recharts',
      'sonner',
      'react-toastify',
      'react-day-picker',
      'react-csv',
      
      // Utilities
      'date-fns',
      'class-variance-authority',
      'uuid',
      'tailwind-merge',
      '@zxing/library'
    ]
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
      extensions: ['.js', '.cjs', '.mjs'],
    },
    rollupOptions: {
      // Explicitly treat these modules as external
      external: [
        '@radix-ui/react-accordion',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-card',
        '@tanstack/react-table'
      ],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom', 'react-redux'],
          'utils-vendor': [
            'date-fns',
            'class-variance-authority',
            'uuid',
            'framer-motion',
            'recharts',
            'sonner',
            'react-toastify',
            'react-day-picker',
            'tailwind-merge',
            '@zxing/library'
          ]
        }
      }
    }
  }
}));
