import { defineConfig, UserConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// Fix for Framer Motion and React in production
const fixFramerMotionPlugin = () => {
  return {
    name: 'fix-framer-motion',
    // Force prebundling of problematic dependencies
    config(config: UserConfig) {
      return {
        optimizeDeps: {
          ...config.optimizeDeps,
          include: [
            ...(config.optimizeDeps?.include || []),
            'framer-motion',
            'framer-motion/dom',
            'react/jsx-runtime'
          ],
          // Force Vite to process these deps even if they're not found in the source code
          force: true
        }
      }
    },
    // Add a resolver to handle JSX runtime imports
    resolveId(id: string) {
      // Redirect JSX runtime to React
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
    fixFramerMotionPlugin()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      'react', 
      'react-dom', 
      'react/jsx-runtime',
      '@radix-ui/react-use-callback-ref', 
      '@radix-ui/primitive', 
      '@radix-ui/react-filter-props', 
      '@radix-ui/react-use-escape-keydown', 
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
      '@radix-ui/react-filter-props',
      
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
    sourcemap: true,
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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create a chunk for each Radix UI component
          if (id.includes('@radix-ui/react-')) {
            return 'radix';
          }
          
          // React and related libraries
          if (id.includes('react') || id.includes('redux')) {
            return 'react-vendor';
          }
          
          // Framer Motion - separate chunk
          if (id.includes('framer-motion')) {
            return 'framer-motion';
          }
          
          // Utility libraries
          if (id.includes('date-fns') || 
              id.includes('class-variance-authority') || 
              id.includes('uuid') || 
              id.includes('recharts') || 
              id.includes('sonner') || 
              id.includes('react-toastify') || 
              id.includes('react-day-picker') || 
              id.includes('tailwind-merge') || 
              id.includes('@zxing/library') || 
              id.includes('@tanstack/react-table')) {
            return 'utils-vendor';
          }
        }
      }
    }
  }
}));
