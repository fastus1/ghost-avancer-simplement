/**
 * Theme Toggle - Dark/Light mode with localStorage persistence
 * Preference cascade: localStorage > system preference > light
 */
(function() {
    'use strict';

    var STORAGE_KEY = 'theme-preference';

    function getThemePreference() {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return stored;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function setTheme(theme) {
        var html = document.documentElement;
        html.classList.toggle('dark-mode', theme === 'dark');
        localStorage.setItem(STORAGE_KEY, theme);
        updateToggleButton(theme);
    }

    function updateToggleButton(theme) {
        var btn = document.querySelector('.theme-toggle');
        if (btn) {
            btn.setAttribute('aria-pressed', theme === 'dark');
            // Show sun icon in dark mode (to switch to light), moon in light mode
            var lightIcon = btn.querySelector('.toggle-icon--light');
            var darkIcon = btn.querySelector('.toggle-icon--dark');
            if (lightIcon && darkIcon) {
                lightIcon.style.display = theme === 'dark' ? 'block' : 'none';
                darkIcon.style.display = theme === 'dark' ? 'none' : 'block';
            }
        }
    }

    function toggleTheme() {
        var html = document.documentElement;
        var current = html.classList.contains('dark-mode') ? 'dark' : 'light';
        setTheme(current === 'dark' ? 'light' : 'dark');
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        // Update button state (theme already applied by inline script)
        updateToggleButton(getThemePreference());

        // Attach click handler
        var toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', toggleTheme);
        }

        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            // Only update if user hasn't set a preference
            if (!localStorage.getItem(STORAGE_KEY)) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    });
})();
