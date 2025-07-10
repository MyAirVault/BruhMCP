import React from 'react';
import { type DropdownPosition } from '../types/createMCPModal';

/**
 * Calculate dropdown position to handle viewport boundaries
 * Determines optimal positioning to prevent dropdown from going off-screen
 */
export const calculateDropdownPosition = (
  elementRef: React.RefObject<HTMLElement | null>, 
  itemCount: number = 6
): DropdownPosition => {
  if (!elementRef.current) {
    return { top: 0, left: 0, width: 0, maxHeight: 200, flipUp: false };
  }

  const elementRect = elementRef.current.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const dropdownHeight = Math.min(200, itemCount * 40); // Estimate dropdown height
  
  // Check if dropdown would go below viewport
  const spaceBelow = viewportHeight - elementRect.bottom;
  const spaceAbove = elementRect.top;
  const flipUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
  
  const maxHeight = flipUp ? Math.min(spaceAbove - 10, 200) : Math.min(spaceBelow - 10, 200);
  
  return {
    top: elementRect.bottom,
    left: elementRect.left,
    width: elementRect.width,
    maxHeight,
    flipUp
  };
};