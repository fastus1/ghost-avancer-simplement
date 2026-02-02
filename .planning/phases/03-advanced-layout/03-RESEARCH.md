# Phase 3: Advanced Layout - Research

**Researched:** 2026-02-02
**Domain:** Ghost theme layout with Circle.so-style header and sidebar
**Confidence:** HIGH

## Summary

This phase implements a Circle.so-style layout in Ghost with a fixed 64px header containing external navigation links and a 281px sidebar for article navigation. The research covers Ghost Handlebars templating for custom navigation, CSS patterns for sticky/fixed layouts, and responsive hamburger menu implementation.

The standard approach uses CSS Grid for the main layout with the sidebar using `position: sticky` for viewport-relative positioning. The header navigation should be a custom partial that hardcodes external Circle.so links plus an internal "Blog" link. Mobile breakpoints hide the sidebar and use a hamburger menu pattern with accessible markup.

**Primary recommendation:** Use CSS Grid for the three-column layout (sidebar, content, potential right margin), custom `partials/circle-header.hbs` for the hardcoded navigation, and the CSS checkbox hack with JavaScript enhancement for the hamburger menu.

## Standard Stack

### Core (Already Present)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Ghost Handlebars | 5.x | Templating | Built into Ghost |
| Inter Variable | current | Typography | Phase 2 complete |
| CSS Custom Properties | - | Theming | Phase 2 complete |

### Supporting (No New Dependencies)
| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| CSS Grid | Main layout structure | Header/sidebar/content organization |
| position: sticky | Sidebar persistence | Sidebar sticks during scroll |
| CSS checkbox hack | Mobile menu toggle | No-JS fallback for hamburger |
| @media queries | Responsive breakpoints | 768px mobile threshold |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS Grid | Flexbox | Grid provides named areas and easier alignment |
| position: sticky | position: fixed | Sticky respects document flow, fixed breaks out |
| Checkbox hack | JS-only menu | Checkbox provides CSS-only fallback |

**Installation:** No new packages needed.

## Architecture Patterns

### Recommended Template Structure
```
partials/
├── circle-header.hbs      # NEW: Header with Circle.so navigation
├── circle-sidebar.hbs     # NEW: Sidebar container
├── sidebar-posts.hbs      # NEW: Article list for sidebar
├── theme-toggle.hbs       # EXISTS: Dark/light toggle (move to sidebar)
├── hamburger-menu.hbs     # NEW: Mobile menu partial
└── navigation.hbs         # OPTIONAL: Override default Ghost nav
```

### Pattern 1: Custom Navigation Partial
**What:** Hardcode Circle.so links instead of using `{{navigation}}` helper
**When to use:** When navigation must be consistent with an external platform
**Example:**
```handlebars
{{!-- partials/circle-header.hbs --}}
<header class="circle-header">
    <div class="circle-header__inner">
        <a href="{{@site.url}}" class="circle-header__logo">
            <img src="https://res.cloudinary.com/dxhn08di4/image/upload/v1770034227/logo-plateforme_ibpiqf.png"
                 alt="{{@site.title}}" width="360" height="36">
        </a>

        <nav class="circle-header__nav" aria-label="Navigation principale">
            <ul class="circle-nav">
                <li class="circle-nav__item">
                    <a href="https://communaute.avancersimplement.com/feed" class="circle-nav__link">Accueil</a>
                </li>
                <li class="circle-nav__item">
                    <a href="https://communaute.avancersimplement.com/nos-applications" class="circle-nav__link">Nos Applications</a>
                </li>
                <li class="circle-nav__item">
                    <a href="https://communaute.avancersimplement.com/courses" class="circle-nav__link">Cours</a>
                </li>
                <li class="circle-nav__item circle-nav__item--active">
                    <a href="{{@site.url}}" class="circle-nav__link" aria-current="page">Blog</a>
                </li>
                <li class="circle-nav__item">
                    <a href="https://communaute.avancersimplement.com/events" class="circle-nav__link">Evenements</a>
                </li>
                <li class="circle-nav__item">
                    <a href="https://communaute.avancersimplement.com/members" class="circle-nav__link">Membres</a>
                </li>
                <li class="circle-nav__item">
                    <a href="https://communaute.avancersimplement.com/leaderboard" class="circle-nav__link">Leaderboard</a>
                </li>
            </ul>
        </nav>

        {{!-- Mobile hamburger trigger --}}
        <label for="mobile-menu-toggle" class="circle-header__burger" aria-label="Menu">
            <span class="burger-line"></span>
            <span class="burger-line"></span>
            <span class="burger-line"></span>
        </label>
    </div>
</header>
```

### Pattern 2: CSS Grid Layout with Sticky Sidebar
**What:** Three-column grid with sticky sidebar
**When to use:** App-like layouts with persistent navigation
**Example:**
```css
/* Source: CSS Grid patterns for fixed sidebar layouts */
.site-layout {
    display: grid;
    grid-template-columns: 281px 1fr;
    grid-template-rows: 64px 1fr;
    grid-template-areas:
        "header header"
        "sidebar main";
    min-height: 100vh;
}

.circle-header {
    grid-area: header;
    position: sticky;
    top: 0;
    z-index: 100;
    height: 64px;
}

.circle-sidebar {
    grid-area: sidebar;
    position: sticky;
    top: 64px; /* Below header */
    height: calc(100vh - 64px);
    overflow-y: auto;
    align-self: start; /* Critical for sticky to work */
}

.site-main {
    grid-area: main;
    min-height: calc(100vh - 64px);
}

@media (max-width: 768px) {
    .site-layout {
        grid-template-columns: 1fr;
        grid-template-areas:
            "header"
            "main";
    }

    .circle-sidebar {
        display: none;
    }
}
```

### Pattern 3: Accessible Hamburger Menu
**What:** CSS checkbox hack with JavaScript enhancement
**When to use:** Mobile navigation with graceful degradation
**Example:**
```handlebars
{{!-- Hidden checkbox for CSS-only fallback --}}
<input type="checkbox" id="mobile-menu-toggle" class="mobile-menu__checkbox" aria-hidden="true">

{{!-- Menu content --}}
<div class="mobile-menu" role="navigation" aria-label="Menu mobile">
    <nav class="mobile-menu__nav">
        {{!-- Same links as header --}}
    </nav>
</div>
```

```css
/* CSS checkbox hack */
.mobile-menu__checkbox {
    position: absolute;
    left: -9999px;
}

.mobile-menu {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-sidebar-bg);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    visibility: hidden;
}

.mobile-menu__checkbox:checked ~ .mobile-menu {
    transform: translateX(0);
    visibility: visible;
}

@media (min-width: 769px) {
    .mobile-menu,
    .mobile-menu__checkbox,
    .circle-header__burger {
        display: none;
    }
}
```

### Pattern 4: Fetching Posts for Sidebar
**What:** Use `{{#get}}` helper to display article list
**When to use:** Dynamic sidebar content like recent posts
**Example:**
```handlebars
{{!-- partials/sidebar-posts.hbs --}}
{{#get 'posts' limit='10' order='published_at desc'}}
    <nav class="sidebar-posts" aria-label="Articles recents">
        <h2 class="sidebar-posts__title">Articles</h2>
        <ul class="sidebar-posts__list">
            {{#foreach posts}}
                <li class="sidebar-posts__item{{#if @current}} sidebar-posts__item--active{{/if}}">
                    <a href="{{url}}" class="sidebar-posts__link">
                        {{title}}
                    </a>
                </li>
            {{/foreach}}
        </ul>
    </nav>
{{/get}}
```

### Anti-Patterns to Avoid
- **Using `{{navigation}}` for Circle.so links:** Ghost's navigation helper pulls from admin settings, but Circle.so links are external and fixed
- **position: fixed for sidebar:** Breaks document flow and causes content overlap issues
- **Forgetting `align-self: start` on sticky sidebar:** Without this, sidebar stretches to grid height and sticky has no effect
- **overflow: hidden on sidebar parent:** Breaks sticky positioning entirely

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mobile menu toggle | Custom JS state management | CSS checkbox hack + JS enhancement | Works without JS, progressive enhancement |
| Layout grid | Manual positioning/floats | CSS Grid with template areas | Semantic, maintainable, responsive |
| Dark mode styling | Duplicate CSS rules | CSS custom properties (Phase 2) | Already implemented, single source of truth |
| Post fetching | Custom API calls | `{{#get 'posts'}}` helper | Ghost handles caching, security, pagination |

**Key insight:** Ghost's Handlebars helpers handle data fetching server-side with proper caching. CSS Grid and position: sticky handle layout without JavaScript. The only custom JS needed is for hamburger menu accessibility enhancements.

## Common Pitfalls

### Pitfall 1: Sticky Sidebar Not Sticking
**What goes wrong:** Sidebar scrolls with content instead of staying fixed
**Why it happens:** Parent has `overflow: hidden/auto/scroll` or sidebar has same height as container
**How to avoid:** Use `align-self: start` on sidebar, ensure no overflow constraints on ancestors
**Warning signs:** Sidebar element has computed height equal to grid row height

### Pitfall 2: Mobile Menu Inaccessible
**What goes wrong:** Keyboard users cannot navigate to or through menu
**Why it happens:** Checkbox label is hidden from screen readers, menu links not focusable when closed
**How to avoid:** Use `visibility: hidden` (not `display: none`) for closed state, add `aria-expanded` via JS
**Warning signs:** Tab key skips hamburger button or enters closed menu

### Pitfall 3: Header Overlapping Content
**What goes wrong:** Fixed header covers top of page content
**Why it happens:** Content area doesn't account for header height
**How to avoid:** Use CSS Grid with explicit row heights, or add `padding-top: 64px` to body
**Warning signs:** First line of content cut off or hidden under header

### Pitfall 4: External Links Opening in Same Tab
**What goes wrong:** User loses their place on the blog when clicking Circle.so links
**Why it happens:** Default anchor behavior opens in same tab
**How to avoid:** Add `target="_blank" rel="noopener noreferrer"` to external links
**Warning signs:** Users complain about "losing" the blog when navigating

### Pitfall 5: Logo Image Not Loading
**What goes wrong:** Broken image or wrong dimensions
**Why it happens:** Cloudinary URL changes, image not cached properly
**How to avoid:** Include width/height attributes, provide alt text fallback
**Warning signs:** Layout shift when image loads, broken image icon

### Pitfall 6: Dark Mode Colors Not Applied to New Elements
**What goes wrong:** Header/sidebar use hardcoded colors instead of CSS variables
**Why it happens:** Using design spec colors directly instead of existing variables
**How to avoid:** Map all colors to existing `--color-*` variables from Phase 2
**Warning signs:** Header/sidebar don't change color with theme toggle

## Code Examples

### Complete Header Styles
```css
/* Source: Phase requirements + Circle.so design spec */
.circle-header {
    height: 64px;
    padding: 8px 36px;
    background: var(--color-header-bg);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
}

.circle-header__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: none;
}

.circle-header__logo img {
    height: 36px;
    width: auto;
}

.circle-nav {
    display: flex;
    gap: 8px;
    list-style: none;
    margin: 0;
    padding: 0;
}

.circle-nav__link {
    display: block;
    padding: 8px 16px;
    font-family: var(--font-primary);
    font-size: 14px;
    font-weight: 500;
    color: var(--color-header-text);
    text-decoration: none;
    border-radius: 9999px;
    transition: background-color 0.2s ease;
}

.circle-nav__link:hover,
.circle-nav__link:focus {
    background: var(--color-header-active-bg);
}

.circle-nav__item--active .circle-nav__link {
    background: var(--color-header-active-bg);
    border: 1px solid var(--color-border);
    color: var(--color-header-active-text);
}
```

### Complete Sidebar Styles
```css
/* Source: Phase requirements + Circle.so design spec */
.circle-sidebar {
    width: 281px;
    background: var(--color-sidebar-bg);
    border-right: 1px solid var(--color-border);
    padding: 16px 0;
}

.sidebar-section__title {
    padding: 6px 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-sidebar-text);
}

.sidebar-posts__item {
    list-style: none;
}

.sidebar-posts__link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 16px;
    min-height: 35px;
    font-size: 16px;
    font-weight: 400;
    color: var(--color-sidebar-text);
    text-decoration: none;
    border-radius: 12px;
    transition: background-color 0.2s ease;
}

.sidebar-posts__link:hover,
.sidebar-posts__link:focus {
    background: var(--color-sidebar-hover);
}

.sidebar-posts__item--active .sidebar-posts__link {
    background: var(--color-sidebar-active);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-sidebar-active-text);
}
```

### Hamburger Menu Animation
```css
/* Source: Accessible hamburger menu patterns */
.circle-header__burger {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 24px;
    height: 18px;
    cursor: pointer;
}

.burger-line {
    display: block;
    height: 2px;
    background: var(--color-header-text);
    border-radius: 1px;
    transition: transform 0.3s ease, opacity 0.3s ease;
}

/* Transform to X when checked */
.mobile-menu__checkbox:checked ~ .circle-header .burger-line:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
}

.mobile-menu__checkbox:checked ~ .circle-header .burger-line:nth-child(2) {
    opacity: 0;
}

.mobile-menu__checkbox:checked ~ .circle-header .burger-line:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
}

@media (max-width: 768px) {
    .circle-header__burger {
        display: flex;
    }

    .circle-header__nav {
        display: none;
    }
}
```

### JavaScript Enhancement for Accessibility
```javascript
// Source: Accessibility best practices
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        var checkbox = document.getElementById('mobile-menu-toggle');
        var burger = document.querySelector('.circle-header__burger');
        var menu = document.querySelector('.mobile-menu');

        if (!checkbox || !burger || !menu) return;

        // Add ARIA attributes
        burger.setAttribute('role', 'button');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-controls', 'mobile-menu');
        menu.setAttribute('id', 'mobile-menu');

        // Update ARIA on state change
        checkbox.addEventListener('change', function() {
            var isOpen = this.checked;
            burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

            // Trap focus when open
            if (isOpen) {
                menu.querySelector('a').focus();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && checkbox.checked) {
                checkbox.checked = false;
                burger.setAttribute('aria-expanded', 'false');
                burger.focus();
            }
        });
    });
})();
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JavaScript-only mobile menus | CSS checkbox hack + JS enhancement | 2020+ | Works without JS, better performance |
| Flexbox for app layouts | CSS Grid with template areas | 2019+ | Named areas, easier responsive |
| position: fixed sidebars | position: sticky | 2017+ (full support) | Stays in document flow |
| Separate dark/light stylesheets | CSS custom properties | 2018+ | Single stylesheet, instant switching |

**Deprecated/outdated:**
- Float-based layouts: Use CSS Grid or Flexbox
- jQuery for simple toggles: Use vanilla JS or CSS-only
- JavaScript-only responsive menus: Always provide CSS fallback

## Open Questions

1. **Sidebar content specifics**
   - What we know: Sidebar exists with 281px width, contains article navigation
   - What's unclear: Exact content structure (categories? tags? just posts?)
   - Recommendation: Implement basic post list first, can enhance later

2. **Theme toggle placement**
   - What we know: Toggle moves from header to sidebar (bottom, discret)
   - What's unclear: Exact position in sidebar, mobile behavior
   - Recommendation: Place at bottom of sidebar, move to mobile menu on small screens

3. **Active post highlighting**
   - What we know: Circle.so shows active item with background
   - What's unclear: How to detect "current post" in sidebar list
   - Recommendation: Use Ghost's context to check if URL matches, or use JS

## Sources

### Primary (HIGH confidence)
- [Ghost Developer Docs - Navigation Helper](https://docs.ghost.org/themes/helpers/data/navigation) - Custom navigation templates
- [Ghost Developer Docs - Theme Structure](https://docs.ghost.org/themes/structure/) - File organization
- [Ghost Developer Docs - foreach Helper](https://docs.ghost.org/themes/helpers/functional/foreach) - Iteration patterns

### Secondary (MEDIUM confidence)
- [CSS Grid Fixed Sidebar Pattern](https://www.paigeniedringhaus.com/blog/use-css-grid-to-make-a-fixed-sidebar-with-scrollable-main-body/) - Grid layout with scrollable content
- [Sticky Sidebar Two Lines CSS](https://www.clairecodes.com/blog/2018-04-02-making-a-sticky-sidebar-with-two-lines-of-css/) - Minimal sticky implementation
- [Smashing Magazine - Sticky Headers](https://www.smashingmagazine.com/2024/09/sticky-headers-full-height-elements-tricky-combination/) - Grid + sticky patterns
- [Bright Themes - Ghost Post Archive](https://brightthemes.com/blog/ghost-post-archive) - Get helper examples

### Tertiary (LOW confidence)
- [Hamburger Menu CSS Patterns](https://alvarotrigo.com/blog/hamburger-menu-css/) - Checkbox hack examples
- [Accessibility Matters - Mobile Nav](https://a11ymatters.com/pattern/mobile-nav/) - A11y best practices

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Uses existing Ghost features and CSS standards
- Architecture: HIGH - CSS Grid and sticky are well-documented
- Pitfalls: MEDIUM - Based on common patterns and known issues
- Code examples: HIGH - Derived from design spec and verified patterns

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (30 days - stable CSS/Ghost patterns)
