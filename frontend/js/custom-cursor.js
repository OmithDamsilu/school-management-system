/**
 * Custom Cursor Implementation
 * Creates and animates a custom cursor that follows the mouse pointer
 */

(function() {
    'use strict';
    
    // Create cursor element
    function createCustomCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);
        return cursor;
    }
    
    // Initialize cursor on page load
    function initCustomCursor() {
        // Check if we're on a touch device
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            // Don't use custom cursor on touch devices
            document.body.style.cursor = 'auto';
            document.querySelectorAll('*').forEach(el => {
                el.style.cursor = 'auto';
            });
            return;
        }
        
        const cursor = createCustomCursor();
        
        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        
        // Add hover effects for clickable elements
        const clickableElements = document.querySelectorAll('a, button, input[type="submit"], input[type="button"], .btn, [onclick]');
        
        clickableElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursor.style.opacity = '0.8';
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.opacity = '1';
            });
        });
        
        // Hide cursor when leaving the window
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });
        
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
        });
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCustomCursor);
    } else {
        initCustomCursor();
    }
})();
