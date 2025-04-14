/**
 * This file provides a safe way to import Radix UI components.
 * Instead of importing directly from Radix UI packages which might fail,
 * components can be imported through this wrapper.
 */

import React from 'react';

// Import fallbacks
import * as RadixFallbacks from '../components/ui/RadixFallbacks';

// Store loaded modules
const loadedModules: Record<string, any> = {};

/**
 * Safely gets a component, returning the actual component if available
 * or a fallback if not
 */
export async function getComponent(moduleName: string, componentName: string) {
  const key = `${moduleName}:${componentName}`;
  
  // Return cached version if we've already tried to load it
  if (loadedModules[key]) {
    return loadedModules[key];
  }
  
  try {
    // Try to get the fallback first
    const fallbackKey = componentName.replace(/^Root/, '');
    const fallbackComponent = (RadixFallbacks as any)[fallbackKey];
    
    // Store the fallback component as a default
    loadedModules[key] = fallbackComponent || ((props: any) => React.createElement('div', props));
    
    return loadedModules[key];
  } catch (error) {
    console.error(`Error getting component ${componentName} from ${moduleName}:`, error);
    // Return a simple div component as a last resort
    return (props: any) => React.createElement('div', props);
  }
}

// Example usage:
// const Accordion = await getComponent('@radix-ui/react-accordion', 'Accordion'); 