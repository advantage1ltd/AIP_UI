import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      // React core
      'react', 
      'react-dom',
      'react-redux',
      'react-router-dom',
      
      // Radix UI components
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
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-accordion',
      
      // Other UI libraries
      'lucide-react',
      'framer-motion',
      'recharts',
      'sonner',
      'react-toastify',
      'react-day-picker',
      'react-csv',
      '@tanstack/react-table',
      
      // Utilities
      'date-fns',
      'class-variance-authority',
      'uuid',
      'tailwind-merge',
      '@zxing/library'
    ],
    exclude: ['@radix-ui/react-card']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create a chunk for Radix UI components
          if (id.includes('@radix-ui')) {
            return 'radix-ui-vendor';
          }
          
          // React and related libraries
          if (id.includes('react') || id.includes('redux')) {
            return 'react-vendor';
          }
          
          // Utilities and other libraries
          if (id.includes('date-fns') || 
              id.includes('class-variance-authority') || 
              id.includes('uuid') || 
              id.includes('framer-motion') || 
              id.includes('recharts') || 
              id.includes('sonner') || 
              id.includes('react-toastify') || 
              id.includes('react-day-picker') || 
              id.includes('tailwind-merge') || 
              id.includes('@zxing/library')) {
            return 'utils-vendor';
          }
        }
      }
    }
  }
}));
