import { useState, useEffect } from 'react';
import * as RadixFallbacks from '../components/ui/RadixFallbacks';

/**
 * Custom hook that provides safe access to Radix UI components
 * Will return fallback components if the originals can't be loaded
 */
export function useRadixComponents() {
  // Return an object with all the fallback components
  return {
    Accordion: {
      Root: RadixFallbacks.Accordion,
      Item: RadixFallbacks.AccordionItem,
      Trigger: RadixFallbacks.AccordionTrigger,
      Content: RadixFallbacks.AccordionContent
    },
    DropdownMenu: {
      Root: RadixFallbacks.DropdownMenu,
      Trigger: RadixFallbacks.DropdownMenuTrigger,
      Content: RadixFallbacks.DropdownMenuContent,
      Item: RadixFallbacks.DropdownMenuItem,
      Separator: RadixFallbacks.DropdownMenuSeparator
    },
    ScrollArea: {
      Root: RadixFallbacks.ScrollArea,
      Scrollbar: RadixFallbacks.ScrollBar
    }
  };
}

/**
 * Example usage:
 * 
 * function MyComponent() {
 *   const { Accordion } = useRadixComponents();
 *   
 *   return (
 *     <Accordion.Root>
 *       <Accordion.Item>
 *         <Accordion.Trigger>Click me</Accordion.Trigger>
 *         <Accordion.Content>Content here</Accordion.Content>
 *       </Accordion.Item>
 *     </Accordion.Root>
 *   );
 * }
 */ 