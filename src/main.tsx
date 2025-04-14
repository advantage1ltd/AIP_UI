import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import App from './App'
import './index.css'

// Load components asynchronously after render
const loadComponents = async () => {
  try {
    // Dynamic import to avoid build-time errors
    const { preloadRadixComponents } = await import('./utils/preloadRadixComponents');
    await preloadRadixComponents();
  } catch (error) {
    console.error('Failed to load component utilities:', error);
  }
};

// Render first, then load components
ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
)

// Attempt to load components after render
loadComponents();
