# Phase 2: Theme & Branding - Research

**Researched:** 2026-02-02
**Domain:** Ghost theme customization (Casper fork, CSS variables, dark/light mode)
**Confidence:** HIGH

## Summary

This phase involves forking Ghost's default Casper theme, customizing it with the Avancer Simplement branding (Inter font, custom colors), and implementing a manual dark/light mode toggle with localStorage persistence.

Ghost themes use Handlebars templating and modern CSS with PostCSS compilation. The Casper theme (v5.9.0) already includes built-in dark mode support through the `color_scheme` custom setting, which applies classes to the `<html>` element. The standard approach is to:
1. Fork Casper and rename in package.json
2. Override CSS variables for brand colors and typography
3. Integrate Inter font (self-hosted recommended for performance)
4. Add a toggle button in the header that persists user preference via localStorage

**Primary recommendation:** Fork Casper 5.9.0, override CSS custom properties in screen.css for both light and dark modes, self-host Inter font, and implement a toggle button that adds/removes the `dark-mode` class on `<html>` with localStorage persistence.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Ghost Casper | 5.9.0 | Base theme to fork | Official default, well-maintained, MIT license |
| Inter Font | Variable | Typography | Matches Circle.so branding, excellent web performance |
| PostCSS | via Gulp | CSS compilation | Built into Casper, enables CSS variables and autoprefixer |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Gulp | 5.0.1 | Build automation | Compiling CSS, creating zip for upload |
| GScan | Latest | Theme validation | Before uploading theme to Ghost |
| Autoprefixer | via PostCSS | Browser compatibility | Automatic via build pipeline |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Self-hosted Inter | Google Fonts CDN | Google Fonts easier setup but slower, potential GDPR issues, risk of unexpected updates |
| Fork Casper | Ghost Starter theme | Starter is minimal; Casper has dark mode already built-in |
| localStorage | Cookies | localStorage simpler, no "Accept Cookies" notice needed |

**Installation:**
```bash
# Clone Casper theme
git clone https://github.com/TryGhost/Casper.git avancer-simplement-theme
cd avancer-simplement-theme

# Install dependencies
npm install

# Development mode with live reload
npm run dev

# Create distributable zip
npm run zip

# Validate theme
npx gscan .
```

## Architecture Patterns

### Recommended Theme Structure
```
avancer-simplement-theme/
├── assets/
│   ├── css/
│   │   ├── screen.css          # Main stylesheet (imports global.css)
│   │   └── global.css          # CSS variables & resets
│   ├── fonts/
│   │   └── inter/              # Self-hosted Inter font files (.woff2)
│   ├── images/
│   │   ├── favicon.ico
│   │   └── logo.svg
│   └── js/
│       └── theme-toggle.js     # Dark/light mode toggle logic
├── partials/
│   ├── icons/                  # SVG icons as .hbs partials
│   ├── theme-toggle.hbs        # Toggle button partial
│   └── ...
├── default.hbs                 # Base layout with dark-mode class logic
├── index.hbs                   # Homepage
├── post.hbs                    # Article template
├── page.hbs                    # Static page template
├── package.json                # Theme metadata & custom settings
└── gulpfile.js                 # Build configuration
```

### Pattern 1: CSS Custom Properties for Theming
**What:** Define all brand colors and typography as CSS variables in `:root`, override in dark mode
**When to use:** Always - enables easy theme switching and maintainability
**Example:**
```css
/* Source: Casper screen.css pattern + branding requirements */
:root {
    /* Typography - Inter font */
    --font-primary: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --font-serif: Georgia, Times, serif;
    --font-mono: Menlo, Courier, monospace;

    /* Light mode colors (default) */
    --color-brand: #074491;
    --color-brand-text: #FFFFFF;
    --color-link: #2563EB;
    --color-bg: #FFFFFF;
    --color-text: #000000;
    --color-text-secondary: #545861;
    --color-border: #e1e1e1;
    --color-header-bg: #FFFFFF;
    --color-header-active-bg: #F0F3F5;
}

/* Dark mode overrides */
html.dark-mode {
    --color-brand: #3085F5;
    --color-brand-text: #202226;
    --color-link: #539DFF;
    --color-bg: #2B2E33;
    --color-text: #E4E7EB;
    --color-text-secondary: #E4E7EB;
    --color-header-bg: #2B2E33;
    --color-header-active-bg: #42464D;
}
```

### Pattern 2: Dark Mode Toggle with localStorage
**What:** JavaScript that toggles dark-mode class and persists preference
**When to use:** For manual user control (required by BRAND-03)
**Example:**
```javascript
// Source: https://whitep4nth3r.com/blog/best-light-dark-mode-theme-toggle-javascript/
(function() {
    const STORAGE_KEY = 'theme-preference';
    const html = document.documentElement;

    // Preference cascade: localStorage > system preference > light
    function getThemePreference() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function setTheme(theme) {
        html.classList.toggle('dark-mode', theme === 'dark');
        localStorage.setItem(STORAGE_KEY, theme);
        updateToggleButton(theme);
    }

    function updateToggleButton(theme) {
        const btn = document.querySelector('.theme-toggle');
        if (btn) {
            btn.setAttribute('aria-pressed', theme === 'dark');
            btn.querySelector('.toggle-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Apply immediately to avoid flash
    setTheme(getThemePreference());

    // Toggle handler
    document.addEventListener('DOMContentLoaded', () => {
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const current = html.classList.contains('dark-mode') ? 'dark' : 'light';
                setTheme(current === 'dark' ? 'light' : 'dark');
            });
        }
    });
})();
```

### Pattern 3: Self-Hosted Inter Font
**What:** Include Inter font files directly in theme assets
**When to use:** Production - better performance, GDPR compliant
**Example:**
```css
/* In assets/css/fonts.css or at top of screen.css */
@font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url('../fonts/inter/Inter-Variable.woff2') format('woff2-variations');
}
```

### Anti-Patterns to Avoid
- **Editing default.hbs `color_scheme` match block directly:** Casper uses `@custom.color_scheme` setting; for manual toggle, you need custom JS instead
- **Using cookies for theme preference:** localStorage is simpler and avoids cookie consent requirements
- **Forgetting font-display: swap:** Causes invisible text during font loading
- **Not applying theme before DOM ready:** Causes flash of wrong theme (FOIT/FOUC)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme toggle animation | Custom CSS transitions | CSS `transition` on background-color | Simple, performant, already works |
| Font loading optimization | Complex font loading scripts | font-display: swap + preload | Browser handles it better |
| CSS vendor prefixes | Manual prefixes | Autoprefixer (built into Casper) | Maintains automatically |
| Theme validation | Manual testing | GScan CLI | Catches Ghost-specific issues |
| SVG icons | Inline SVG strings | Handlebars partials in `/partials/icons/` | Casper pattern, reusable |

**Key insight:** Casper's build system (Gulp + PostCSS) handles CSS compilation, autoprefixing, and minification. Don't bypass it with custom build tools.

## Common Pitfalls

### Pitfall 1: Flash of Wrong Theme (FOWT)
**What goes wrong:** Page loads in light mode then flashes to dark mode
**Why it happens:** Theme JS runs after initial render
**How to avoid:** Apply theme class synchronously in `<head>` before body renders
**Warning signs:** Visible color flash on page load

**Solution:**
```html
<!-- In default.hbs, add inline script in <head> BEFORE stylesheets -->
<script>
    (function() {
        var theme = localStorage.getItem('theme-preference');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark-mode');
        }
    })();
</script>
```

### Pitfall 2: Package.json Name Collision
**What goes wrong:** Ghost rejects theme upload with "theme already exists" error
**Why it happens:** Forked theme still has `"name": "casper"` in package.json
**How to avoid:** Change name, description, version immediately after forking
**Warning signs:** Upload fails in Ghost admin

### Pitfall 3: Missing Required Helpers
**What goes wrong:** GScan validation fails with errors
**Why it happens:** Removed/forgot `{{ghost_head}}`, `{{ghost_foot}}`, `{{asset}}`, `{{body_class}}`, `{{post_class}}`
**How to avoid:** Never remove these from templates; run GScan before upload
**Warning signs:** GScan errors, broken functionality

### Pitfall 4: CSS Variable Scope Issues
**What goes wrong:** Dark mode colors don't apply everywhere
**Why it happens:** Some selectors use hardcoded colors instead of variables
**How to avoid:** Search entire CSS for hex colors, replace with variables
**Warning signs:** Some elements stay light in dark mode

### Pitfall 5: Font Loading Performance
**What goes wrong:** Layout shift when Inter font loads
**Why it happens:** Large font files, no fallback strategy
**How to avoid:** Use font-display: swap, preload woff2, subset if needed
**Warning signs:** CLS (Cumulative Layout Shift) issues in Lighthouse

## Code Examples

Verified patterns from official sources:

### package.json Configuration
```json
{
    "name": "avancer-simplement",
    "description": "Theme Avancer Simplement - fork de Casper",
    "version": "1.0.0",
    "license": "MIT",
    "author": {
        "name": "Avancer Simplement"
    },
    "engines": {
        "ghost": ">=5.0.0"
    },
    "config": {
        "posts_per_page": 10,
        "custom": {
            "color_scheme": {
                "type": "select",
                "options": ["Light", "Dark", "Auto"],
                "default": "Light",
                "description": "Default color scheme (can be toggled by user)"
            }
        }
    },
    "scripts": {
        "dev": "gulp",
        "zip": "gulp zip",
        "test": "gscan .",
        "pretest": "gulp build"
    }
}
```

### Toggle Button Partial (partials/theme-toggle.hbs)
```handlebars
<button class="theme-toggle" aria-label="Toggle dark mode" aria-pressed="false">
    <span class="toggle-icon">🌙</span>
</button>
```

### Toggle Button CSS
```css
/* Source: Based on Casper patterns + accessibility best practices */
.theme-toggle {
    background: transparent;
    border: none;
    padding: 8px;
    cursor: pointer;
    border-radius: 4px;
    font-size: 1.25rem;
    line-height: 1;
    transition: background-color 0.2s ease;
}

.theme-toggle:hover {
    background-color: var(--color-header-active-bg);
}

.theme-toggle:focus-visible {
    outline: 2px solid var(--color-brand);
    outline-offset: 2px;
}
```

### Header Integration (in default.hbs)
```handlebars
<header class="gh-head">
    <nav class="gh-head-menu">
        {{navigation}}
    </nav>
    <div class="gh-head-actions">
        {{> "theme-toggle"}}
    </div>
</header>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@media (prefers-color-scheme)` only | Manual toggle + localStorage | Ghost 4.x+ | User control, better UX |
| Google Fonts CDN | Self-hosted WOFF2 | 2023-2024 | Performance, GDPR, consistency |
| Casper `color_scheme` setting | Custom JS toggle | N/A | Setting is for default; JS enables runtime toggle |
| engines.ghost-api | engines.ghost | Ghost 5.x | ghost-api deprecated (GScan warning) |

**Deprecated/outdated:**
- `engines.ghost-api` in package.json: Use `engines.ghost` instead
- Cookie-based theme persistence: Use localStorage

## Open Questions

Things that couldn't be fully resolved:

1. **Inter font subset**
   - What we know: Variable font is ~300KB, can be subset to reduce size
   - What's unclear: Which character ranges are needed for French content
   - Recommendation: Start with full variable font, optimize later if performance issue

2. **Logo/favicon exact specs**
   - What we know: BRAND-04 requires logo and favicon
   - What's unclear: Exact dimensions, file formats needed
   - Recommendation: Use standard favicon.ico (16x16, 32x32, 48x48) + logo.svg

3. **Casper version updates**
   - What we know: Fork will be 5.9.0, Ghost updates Casper periodically
   - What's unclear: How often to sync upstream changes
   - Recommendation: Document fork date, merge upstream for security updates only

## Sources

### Primary (HIGH confidence)
- [TryGhost/Casper GitHub](https://github.com/TryGhost/Casper) - Theme structure, package.json, default.hbs dark mode implementation
- [Ghost Developer Docs - Themes](https://docs.ghost.org/themes) - Required files, helpers, structure
- [Ghost Custom Settings Tutorial](https://ghost.org/tutorials/custom-settings/) - Custom setting types and implementation

### Secondary (MEDIUM confidence)
- [Ghost Forum - Dark Mode in Casper 3.0](https://forum.ghost.org/t/how-to-enable-dark-mode-in-casper-3-0/9822) - Community patterns verified against official theme
- [whitep4nth3r - Best Theme Toggle](https://whitep4nth3r.com/blog/best-light-dark-mode-theme-toggle-javascript/) - Preference cascade pattern, localStorage approach
- [Pimp my Type - Inter Font Hosting](https://pimpmytype.com/google-fonts-hosting/) - Self-hosting advantages, performance data

### Tertiary (LOW confidence)
- [bepublish.com - Dark Mode Toggle for Casper](https://bepublish.com/dark-mode-toggle-for-casper/) - Code Injection approach (alternative to theme modification)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Based on official Casper theme and Ghost documentation
- Architecture: HIGH - Patterns derived from official theme source code
- Pitfalls: MEDIUM - Community sources verified against official patterns

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (30 days - stable domain)
