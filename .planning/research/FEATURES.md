# Feature Landscape: Ghost Blog for "Avancer Simplement"

**Domain:** Self-hosted Ghost blog (simple personal blog without membership/newsletter)
**Researched:** 2026-02-01
**Overall confidence:** HIGH (verified via official Ghost documentation)

## Table Stakes

Features users expect from a modern blog. Missing any of these makes the blog feel incomplete or unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Custom branding (logo, colors)** | Brand identity is fundamental | Low | Ghost supports via Settings > Design and Code Injection |
| **Light/dark mode toggle** | Modern UX expectation, accessibility | Medium | Casper has auto mode; manual toggle requires theme modification |
| **Custom typography (Inter font)** | Professional appearance, brand consistency | Low | Google Fonts via Code Injection or self-hosted in theme |
| **Responsive design** | Mobile-first world | Low | Casper is fully responsive out of the box |
| **Clean URL structure** | SEO and shareability | Low | Ghost handles automatically (yoursite.com/post-slug) |
| **Image optimization** | Performance, Core Web Vitals | Low | Ghost auto-optimizes uploaded images |
| **RSS feed** | Syndication for readers | Low | Built-in at /rss/ |
| **Basic SEO** | Discoverability | Low | Built-in meta tags, structured data (JSON-LD), XML sitemap |
| **Social sharing meta** | Nice previews on social media | Low | Open Graph and Twitter cards built-in |
| **Post scheduling** | Content planning workflow | Low | Native feature in Ghost editor |
| **Tag organization** | Content discovery, navigation | Low | Native feature, WordPress categories convert to tags |
| **Author attribution** | Credibility, multi-author ready | Low | Built-in author profiles |
| **Search functionality** | Content discovery | Low | Built-in search (Sodo Search) |
| **Code syntax highlighting** | Technical blog content | Low | Built-in via code card |

## Differentiators

Features that set "Avancer Simplement" apart. Not strictly required, but add value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Custom accent colors (#074491/#3085F5)** | Strong brand identity, memorable | Low | CSS variables in Code Injection or theme modification |
| **Smooth dark/light transition** | Polish, modern feel | Medium | Requires CSS transitions and JS toggle |
| **Custom page templates** | About page, contact, etc. with unique layouts | Medium | Handlebars templates (page-about.hbs, etc.) |
| **Reading progress indicator** | Enhanced reading experience | Low | Can add via Code Injection JS |
| **Related posts** | Increased engagement, content discovery | Medium | Requires theme modification or card |
| **Table of contents** | Better navigation for long posts | Medium | Via toggle cards or custom JS |
| **Estimated reading time** | UX expectation for blogs | Low | Built-in in most themes including Casper |
| **Custom 404 page** | Brand consistency even in errors | Low | error.hbs template |
| **Bookmark cards for links** | Rich link previews | Low | Native editor card |
| **Image galleries** | Visual content presentation | Low | Native gallery card (up to 9 images) |

## Anti-Features

Features to explicitly NOT build for this simple blog. Common mistakes or over-engineering.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Membership system** | Project scope is simple blog; adds complexity | Disable in Settings > Membership > Access > "Nobody" |
| **Newsletter/email sending** | Requires Mailgun setup, maintenance, GDPR concerns | Leave unconfigured; use RSS for subscribers |
| **Paid subscriptions/Stripe** | Not needed for simple blog | Don't configure Stripe integration |
| **Portal (sign-in/subscribe popup)** | Clutters UI, confuses visitors on public blog | Disabled automatically when membership = "Nobody" |
| **Member-only content** | All content should be public | Keep all posts as "Public" visibility |
| **Comment system** | Maintenance burden, spam management | Use social media for discussions if needed |
| **ActivityPub/Fediverse** | Over-engineering for simple blog | Skip Ghost 6.0 social features |
| **Analytics dashboard** | Ghost's built-in analytics require membership | Use Plausible, Umami, or similar lightweight option |
| **Multiple authors** | Single-author blog | Configure single owner account |
| **Multi-language** | Project is French-only | Stick to single language |
| **Custom post types** | Ghost doesn't support them anyway | Use tags for content organization |
| **E-commerce/products** | Out of scope | Don't use product cards |

## WordPress Migration Specifics

Critical for migrating 20-100 existing articles.

### What Migrates Automatically

| Content Type | Migration Quality | Notes |
|--------------|-------------------|-------|
| Posts | HIGH | Full content, formatting preserved |
| Pages | HIGH | Static pages transfer cleanly |
| Images | HIGH | Embedded images migrate with posts |
| Categories | MEDIUM | Convert to Ghost tags; first category becomes primary tag |
| Authors | MEDIUM | Basic info transfers; passwords must be reset |
| Publish dates | HIGH | Original dates preserved |
| Post slugs/URLs | HIGH | Preserved for SEO continuity |

### What Requires Manual Work

| Item | Effort | Solution |
|------|--------|----------|
| WordPress shortcodes | Medium | Replace with HTML or Ghost cards; common ones like [caption], [audio], [code] auto-convert |
| Plugin-dependent content | Varies | Manually recreate in Ghost editor |
| Custom post types | High | Not supported; may need to convert to regular posts |
| PDF/audio file attachments | Low | Re-upload manually to Ghost |
| Featured images | Low | May need to re-assign |
| URL redirects | Medium | Set up redirects.json for old WordPress URLs |
| Comments | N/A | Don't migrate (anti-feature for this project) |

### Migration Process

1. Install Ghost WordPress plugin on WordPress site
2. Export via Tools > Export to Ghost (generates ZIP with JSON + images)
3. In Ghost Admin: Settings > Advanced > Import/Export
4. Upload exported ZIP file
5. Review import summary, confirm
6. Set up redirects for changed URLs
7. Verify content, fix any formatting issues

### Migration Limitations

- Max 100MB upload / 2,500 posts per import (plenty for 20-100 articles)
- Custom WordPress roles simplify to Ghost roles (Admin, Editor, Author, Contributor)
- Visual builder content (Elementor, Divi) may need manual recreation

## Theming Specifics

Custom Casper modifications for "Avancer Simplement" brand.

### Required Theme Changes

| Change | Method | Complexity |
|--------|--------|------------|
| Inter font family | Code Injection or theme's default.hbs + CSS | Low |
| Brand colors (#074491 light, #3085F5 dark) | CSS variables in Code Injection or global.css | Low |
| Light/dark toggle button | Theme modification (JS + HTML partial) | Medium |
| Remove membership UI elements | Theme edit to remove hardcoded buttons | Low |

### Casper Customization Points

```
/assets/css/
  global.css      <- Color variables, base styles
  screen.css      <- Main stylesheet

/partials/
  icons/          <- SVG icons (can add custom toggle icon)

default.hbs       <- Add font link, toggle button
post.hbs          <- Post template
page.hbs          <- Page template
```

### Dark Mode Implementation Options

1. **CSS-only (auto)**: Use `@media (prefers-color-scheme: dark)` - follows OS setting
2. **Toggle with localStorage**: Add JS button that saves preference
3. **Casper built-in**: Use custom setting `color_scheme` (Light/Dark/Auto)

**Recommendation:** Extend Casper's built-in system with a visible toggle button that writes to localStorage and applies `.dark-mode` class.

### Custom Colors CSS Example

```css
/* Code Injection - Site Header */
<style>
:root {
  --ghost-accent-color: #074491;
  --color-primary: #074491;
}

html.dark-mode {
  --ghost-accent-color: #3085F5;
  --color-primary: #3085F5;
}
</style>
```

## Feature Dependencies

```
WordPress Migration
    |
    v
Base Ghost Install
    |
    +---> Content Import (posts, pages, tags)
    |         |
    |         v
    |     URL Redirects
    |
    v
Theme Customization
    |
    +---> Inter Font (independent)
    |
    +---> Brand Colors (independent)
    |
    +---> Dark/Light Toggle
              |
              v
          Toggle Button (requires color system)
```

## MVP Recommendation

### Phase 1: Foundation (Must Have)
1. Ghost installation (self-hosted)
2. WordPress content migration
3. Basic Casper theme with Inter font
4. Brand colors via Code Injection
5. Disable membership system

### Phase 2: Polish (Should Have)
1. Light/dark toggle button
2. URL redirects for old WordPress URLs
3. Custom about page
4. SEO verification (meta tags, sitemap submission)

### Phase 3: Enhancement (Nice to Have)
1. Reading progress indicator
2. Related posts section
3. Custom 404 page
4. Performance optimization

### Defer Indefinitely
- Membership features
- Newsletter system
- Analytics beyond basic server logs
- Comment system

## Sources

### Official Documentation (HIGH confidence)
- [Ghost Migration from WordPress](https://docs.ghost.org/migration/wordpress)
- [Ghost Editor Cards](https://ghost.org/help/cards/)
- [Ghost Custom Settings](https://ghost.org/tutorials/custom-settings/)
- [Ghost SEO Guide](https://ghost.org/help/seo/)
- [Disable Memberships](https://ghost.org/help/can-i-disable-memberships/)

### Theme Resources (HIGH confidence)
- [Casper Theme GitHub](https://github.com/TryGhost/Casper)
- [Alto Theme (dark mode reference)](https://github.com/TryGhost/Alto)

### Community Guides (MEDIUM confidence)
- [Casper Google Fonts Guide](https://aspirethemes.com/blog/casper-google-fonts)
- [Self-Host Google Fonts in Ghost](https://brightthemes.com/blog/ghost-google-fonts-self-host)
- [Dark Mode Toggle for Casper](https://ghostfam.com/en/dark-mode-toggle-for-casper/)
- [Adding Dark Mode Button](https://www.spectralwebservices.com/blog/adding-a-dark-mode-button-to-your-ghost-blog/)
