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
            'react/jsx-runtime',
            'react-redux',
            'react-router-dom',
            '@tanstack/react-query',
            '@tanstack/react-query-devtools',
            'lucide-react'
          ],
          force: true,
          esbuildOptions: {
            target: 'esnext'
          }
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
      jsxImportSource: 'react',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    fixFramerMotionPlugin(),
    ...(mode === 'production' ? [visualizer({ 
      open: true, 
      gzipSize: true, 
      brotliSize: true,
      filename: 'dist/stats.html'
    })] : [])
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'react': resolve(__dirname, 'node_modules/react'),
      'react-dom': resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': resolve(__dirname, 'node_modules/react/jsx-runtime'),
    },
    dedupe: [
      'react', 
      'react-dom', 
      'react/jsx-runtime',
      'framer-motion',
      '@tanstack/react-query',
      'react-redux',
      'react-router-dom',
      'lucide-react'
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
      '@tanstack/react-query',
      '@tanstack/react-query-devtools',
      
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
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2,
        dead_code: true,
        ecma: 2020,
        keep_infinity: true,
        module: true,
        toplevel: true
      },
      format: {
        comments: false,
        ecma: 2020,
        ascii_only: true,
        beautify: false
      },
      mangle: {
        safari10: true,
        toplevel: true
      }
    },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React bundle
          if (id.includes('react') || 
              id.includes('react-dom') || 
              id.includes('react/jsx-runtime') ||
              id.includes('framer-motion') ||
              id.includes('lucide-react')) {
            return 'react-core';
          }

          // State management
          if (id.includes('@tanstack/react-query') || 
              id.includes('react-redux')) {
            return 'state-management';
          }

          // Routing
          if (id.includes('react-router')) {
            return 'routing';
          }
          
          // Radix UI components
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
          
          // UI Components
          if (id.includes('recharts')) {
            return 'charts';
          }
          if (id.includes('@tanstack/react-table')) {
            return 'table';
          }
          
          // Form and Input Components
          if (id.includes('react-day-picker') || 
              id.includes('react-csv') ||
              id.includes('react-hook-form')) {
            return 'form-components';
          }
          
          // Utilities
          if (id.includes('date-fns')) {
            return 'date-utils';
          }
          if (id.includes('class-variance-authority') || 
              id.includes('tailwind-merge')) {
            return 'style-utils';
          }
          if (id.includes('sonner') || 
              id.includes('react-toastify')) {
            return 'notifications';
          }
          if (id.includes('@zxing/library')) {
            return 'barcode';
          }
          
          // Vendor bundle for remaining dependencies
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Optimize chunk loading
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Ensure proper code splitting
        maxSize: 500000,
        minSize: 20000,
        // Optimize for modern browsers
        generatedCode: {
          preset: 'es2015',
          arrowFunctions: true,
          constBindings: true,
          objectShorthand: true,
          reservedNamesAsProps: false
        }
      }
    }
  }
}));
