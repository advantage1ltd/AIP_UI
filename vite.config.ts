import { defineConfig, UserConfig } from "vite"
import react from "@vitejs/plugin-react"
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Fix for Framer Motion and React in production
const fixFramerMotionPlugin = () => {
  return {
    name: 'fix-framer-motion',
    config(config: UserConfig) {
      return {
        optimizeDeps: {
          ...config.optimizeDeps,
          include: [
            ...(config.optimizeDeps?.include || []),
            'framer-motion',
            'framer-motion/dom',
            'react',
            'react-dom',
            'react/jsx-runtime'
          ],
          force: true
        }
      }
    },
    resolveId(id: string) {
      if (id === 'react/jsx-runtime') {
        return {
          id: 'react/jsx-runtime',
          external: false
        };
      }
      return null;
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    }),
    fixFramerMotionPlugin(),
    ...(mode === 'production' ? [visualizer({ open: true, gzipSize: true, brotliSize: true })] : [])
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    dedupe: [
      'react', 
      'react-dom', 
      'react/jsx-runtime',
      'framer-motion'
    ]
  },
  optimizeDeps: {
    exclude: [],
    include: [
      // React core
      'react', 
      'react-dom',
      'react-redux',
      'react-router-dom',
      
      // Radix UI primitive packages
      '@radix-ui/react-primitive',
      '@radix-ui/react-context',
      '@radix-ui/react-use-controllable-state',
      '@radix-ui/react-use-callback-ref',
      '@radix-ui/react-use-layout-effect',
      '@radix-ui/react-compose-refs',
      '@radix-ui/react-direction',
      '@radix-ui/react-slot',
      '@radix-ui/react-id',
      '@radix-ui/react-collection',
      '@radix-ui/react-use-previous',
      '@radix-ui/react-visually-hidden',
      '@radix-ui/react-presence',
      '@radix-ui/react-portal',
      '@radix-ui/react-primitive',
      '@radix-ui/react-use-escape-keydown',
      
      // Radix UI components
      '@radix-ui/react-accordion',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-separator',
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
      '@tanstack/react-table',
      
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
    sourcemap: false,
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
      extensions: ['.js', '.cjs', '.mjs'],
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Keep React and Framer Motion together to prevent context issues
          if (id.includes('react') || id.includes('framer-motion')) {
            return 'react-core';
          }
          
          // Split Radix UI components into smaller chunks
          if (id.includes('@radix-ui/react-')) {
            if (id.includes('dialog') || id.includes('alert-dialog')) {
              return 'radix-dialog';
            }
            if (id.includes('dropdown') || id.includes('select')) {
              return 'radix-dropdown';
            }
            if (id.includes('accordion') || id.includes('tabs')) {
              return 'radix-navigation';
            }
            return 'radix-core';
          }
          
          // Split React Router and Redux
          if (id.includes('react-router')) {
            return 'react-router';
          }
          if (id.includes('react-redux')) {
            return 'react-redux';
          }
          
          // Split UI libraries
          if (id.includes('recharts')) {
            return 'recharts';
          }
          if (id.includes('lucide-react')) {
            return 'lucide-icons';
          }
          
          // Split utility libraries
          if (id.includes('date-fns')) {
            return 'date-utils';
          }
          if (id.includes('@tanstack/react-table')) {
            return 'table-utils';
          }
          if (id.includes('class-variance-authority') || 
              id.includes('tailwind-merge')) {
            return 'style-utils';
          }
          if (id.includes('sonner') || 
              id.includes('react-toastify')) {
            return 'notification-utils';
          }
          if (id.includes('react-day-picker') || 
              id.includes('react-csv')) {
            return 'form-utils';
          }
          if (id.includes('@zxing/library')) {
            return 'barcode-utils';
          }
          
          // Group remaining utilities
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
}));
