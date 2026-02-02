/**
 * Mobile Menu Accessibility Enhancements
 * Provides ARIA support and keyboard navigation for the CSS checkbox hack menu
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        var checkbox = document.getElementById('mobile-menu-toggle');
        var burger = document.querySelector('.circle-header__burger');
        var menu = document.querySelector('.mobile-menu');

        if (!checkbox || !burger || !menu) {
            return;
        }

        // Set up ARIA attributes on burger
        burger.setAttribute('role', 'button');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-controls', 'mobile-menu');

        // Set menu ID for aria-controls reference
        menu.id = 'mobile-menu';

        // Update ARIA on checkbox change
        checkbox.addEventListener('change', function() {
            var isOpen = checkbox.checked;
            burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

            // Focus first link when menu opens
            if (isOpen) {
                var firstLink = menu.querySelector('.mobile-menu__link');
                if (firstLink) {
                    // Delay to allow CSS transition
                    setTimeout(function() {
                        firstLink.focus();
                    }, 100);
                }
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && checkbox.checked) {
                checkbox.checked = false;
                burger.setAttribute('aria-expanded', 'false');
                // Return focus to burger
                burger.focus();
            }
        });
    });
})();
