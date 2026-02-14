# Ghost — Avancer Simplement

Blog Ghost self-hosted with a custom theme designed to match the [Avancer Simplement](https://communaute.avancersimplement.com) Circle.so community look and feel (header, sidebar, dark mode).

## What This Project Is

A Ghost 6.x instance with a custom theme (`avancer-simplement`) forked from Casper. The theme has been heavily modified to replicate the Circle.so community UI: fixed header with navigation links, sidebar with article list, dark/light mode toggle, and responsive Priority Navigation.

**The goal:** the blog should feel like a seamless part of the community platform, not a separate site.

## Architecture

```
Ghost 6 (Alpine) + MySQL 8 — deployed via Docker Compose on Portainer
```

```
docker-compose.yml          # Ghost + MySQL stack
Dockerfile                  # Ghost image with theme baked in (for Railway)
.env.example                # Required env vars (DB passwords)
scripts/
  deploy.sh                 # Full deploy: git pull + build + sync + restart
  sync-theme.sh             # Sync theme files to Portainer volume path
content/themes/
  avancer-simplement/       # The custom Ghost theme (fork of Casper)
```

## Theme Structure

The theme lives in `content/themes/avancer-simplement/`. It's a Handlebars-based Ghost theme.

### Key Files

| File | Role |
|------|------|
| `default.hbs` | Main layout — header + sidebar + main + footer |
| `index.hbs` | Homepage — post feed with pagination |
| `post.hbs` | Single article page |
| `page.hbs` | Static page |
| `tag.hbs` | Tag archive |
| `author.hbs` | Author page |
| `partials/circle-header.hbs` | Header matching Circle.so design |
| `partials/circle-sidebar.hbs` | Sidebar with recent articles list |
| `partials/mobile-menu.hbs` | Mobile hamburger menu |
| `partials/custom-search.hbs` | Search modal overlay |
| `partials/theme-toggle.hbs` | Dark/light mode toggle |
| `assets/css/screen.css` | Main stylesheet (source) |
| `assets/built/screen.css` | Compiled CSS (committed, required) |
| `assets/js/` | JS modules (priority-nav, theme-toggle, mobile-menu, custom-search) |

### Layout (default.hbs)

```
┌─────────────────────────────────────────────┐
│  circle-header (fixed, full width)          │
├──────────┬──────────────────────────────────┤
│ circle-  │                                  │
│ sidebar  │  main content ({{{body}}})       │
│ (281px)  │                                  │
│          │                                  │
├──────────┴──────────────────────────────────┤
│  footer                                     │
└─────────────────────────────────────────────┘
```

## Design Reference

Two files document the target design specs from the Circle.so community:

- **`branding-avancer-simplement.md`** — Colors (light + dark), typography (Inter font), CSS variables
- **`design-ghost.md`** — Pixel-precise specs: header (64px height, nav items, logo), sidebar (281px width, items, active states), buttons

### Key Design Tokens

| Token | Light | Dark |
|-------|-------|------|
| Brand color | `#074491` | `#3085F5` |
| Background | `#FFFFFF` | `#191B1F` |
| Header/Sidebar bg | `#FFFFFF` | `#2B2E33` |
| Text | `#000000` | `#E4E7EB` |
| Active item bg | `#F0F3F5` | `#42464D` |
| Border | — | `#545861` |
| Font | Inter (sans-serif) | Inter (sans-serif) |

### Logo

```
URL: https://res.cloudinary.com/dxhn08di4/image/upload/v1770034227/logo-plateforme_ibpiqf.png
Size: 360px × 36px
```

### Header Navigation Links

The header links point to the Circle.so community sections:
- Accueil → `/feed`
- Nos Applications → `/nos-applications`
- Cours → `/courses`
- **Blog** (active, points to Ghost) → `{{@site.url}}`
- Evenements → `/events`
- Membres → `/members`
- Leaderboard → `/leaderboard`

## Deploying on Portainer

### 1. Prerequisites

- Docker + Docker Compose
- Portainer managing the stack

### 2. Environment Variables

Copy `.env.example` to `.env` and generate passwords:

```bash
cp .env.example .env
# Generate passwords:
openssl rand -hex 32  # → MYSQL_ROOT_PASSWORD
openssl rand -hex 32  # → GHOST_DB_PASSWORD
```

### 3. Deploy with Docker Compose

```bash
docker compose up -d
```

Ghost will be available on port `2368`.

### 4. Theme Activation

After first deploy, go to Ghost Admin (`http://your-domain:2368/ghost/`) and activate the `avancer-simplement` theme in Settings > Design.

### 5. Theme Updates

The theme is bind-mounted into the Ghost container:

```yaml
volumes:
  - ./content/themes:/var/lib/ghost/content/themes
```

After modifying theme files:
1. Build: `cd content/themes/avancer-simplement && npm run zip`
2. Restart Ghost: `docker restart <container-name>`

### Deployment Scripts

The scripts in `scripts/` have **hardcoded paths** for the original server. You will need to adapt:

- `sync-theme.sh` line 8-9: update `REPO_DIR` and `PORTAINER_THEMES_DIR` to match your environment
- `deploy.sh`: uses `sync-theme.sh` internally

If your Docker Compose bind-mounts the theme directory directly (as in `docker-compose.yml`), you may not need `sync-theme.sh` at all — just restart the container after changes.

## Developing the Theme

### Setup

```bash
cd content/themes/avancer-simplement
npm install
```

### Build

```bash
npm run zip     # Build + create zip archive
npm run dev     # Watch mode with LiveReload (needs Ghost running locally)
```

### Build System

Uses Gulp to compile:
- `assets/css/*.css` → `assets/built/screen.css` (PostCSS + autoprefixer + cssnano)
- `assets/js/lib/*.js` → `assets/built/casper.js` (concat + uglify)

**Important:** The `assets/built/` files must be committed. Ghost reads compiled assets directly.

### Validation

```bash
npx gscan .        # Check Ghost compatibility
npx gscan --v5 .   # Check for Ghost 5.x+
```

## Ghost Handlebars Quick Reference

| Helper | Description |
|--------|-------------|
| `{{#foreach posts}}` | Loop over posts |
| `{{#is "home"}}` | Context check (home, post, page, tag...) |
| `{{content}}` | Article content |
| `{{excerpt}}` | Article excerpt |
| `{{feature_image}}` | Featured image URL |
| `{{@site.title}}` | Site title |
| `{{@site.url}}` | Site URL |
| `{{navigation}}` | Primary navigation |
| `{{#get "posts"}}` | Data query (used in sidebar) |
| `{{img_url image size="s"}}` | Responsive image URL |
| `{{asset "file.js"}}` | Theme asset URL with cache busting |

## What Has Been Done

The theme is a fork of Ghost's default Casper theme with these modifications:

- Replaced Casper header with Circle.so-style fixed header (`circle-header.hbs`)
- Added Circle.so-style sidebar with recent articles (`circle-sidebar.hbs`)
- Restructured `default.hbs` layout: header + sidebar + main content
- Added Priority Navigation (responsive nav with "Plus" dropdown for overflow)
- Added custom search modal
- Added dark/light mode toggle with localStorage persistence
- Added mobile hamburger menu
- Removed Casper's hero/publication cover from homepage
- Fixed header is sticky, sidebar fills viewport height

## What May Still Need Work

- Fine-tuning CSS to perfectly match Circle.so pixel specs (see `design-ghost.md`)
- Mobile responsive refinements
- Post/page template styling to match community design
- Navigation links may need updating if community URLs change
- SEO and meta tags configuration in Ghost Admin
