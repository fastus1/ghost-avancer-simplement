# Project Research Summary

**Project:** Ghost Avancer Simplement (Self-Hosted Blog)
**Domain:** Self-hosted Ghost CMS blog with Docker/Portainer deployment
**Researched:** 2026-02-02
**Confidence:** HIGH

## Executive Summary

Ghost Avancer Simplement is a simple personal blog migrating from WordPress (20-100 articles) to self-hosted Ghost 6.x. The project has a clear technical constraint: all Docker operations must happen through Portainer (no CLI access), and the design requires custom branding (Inter font, Circle.so colors #074491/#3085F5) with a light/dark mode toggle. Based on research, the recommended approach is a three-container Docker stack (Ghost + MySQL 8 + Caddy reverse proxy) deployed via Portainer Stacks with theme customizations applied through either Code Injection or a forked Casper theme.

The critical path is infrastructure-first: establish persistent volumes and database credentials before any content work, because volume misconfiguration is the number one cause of catastrophic data loss in Ghost Docker deployments. Once infrastructure is solid, WordPress migration can proceed using Ghost's official export plugin, followed by theme customization. The architecture is deliberately simple - Ghost officially supports only MySQL 8 for production (not SQLite or MariaDB), and Caddy is recommended for automatic HTTPS via Let's Encrypt with minimal configuration.

Key risks center on data persistence and configuration: wrong volume mount paths cause content loss on container recreation, URL mismatches create infinite redirect loops, and theme customizations can break on updates if not properly isolated. All these risks are mitigated through careful infrastructure setup in Phase 1, testing volume persistence before content creation, and choosing the right theme customization strategy (Code Injection for simple changes, forked theme for structural modifications).

## Key Findings

### Recommended Stack

The stack is anchored by Ghost 6.16.x (use `ghost:6` Docker tag for automatic patch updates) running on Node.js (bundled in official image) with MySQL 8.0 as the required production database. Ghost officially supports only MySQL 8 in production - SQLite is development-only and suffers from write-lock contention, while MariaDB sits outside Ghost's official test matrix. MySQL 8 is non-negotiable for production deployments.

**Core technologies:**
- **Ghost 6.16.x** (`ghost:6` tag): Official CMS platform, actively maintained (v6.16.1 released Jan 30 2026), provides automatic patch updates while staying on major version 6
- **MySQL 8.0** (`mysql:8.0` tag): Required for Ghost 6.x production - SQLite unsupported, MariaDB outside official support
- **Caddy 2.x** (`caddy:2` tag): Reverse proxy recommended by Ghost's official Docker setup, automatic HTTPS via Let's Encrypt with zero configuration, simpler than Nginx/Traefik
- **Portainer Stacks**: Container management via Portainer UI (project constraint), all deployment through Git-to-Portainer workflow
- **Named Docker Volumes**: Data persistence for `/var/lib/ghost/content` and `/var/lib/mysql`, survives container recreation

**Version strategy:** Use floating tags (`ghost:6`, `mysql:8.0`, `caddy:2`) for automatic minor/patch updates, or pin to specific minor versions (`ghost:6.16`, `mysql:8.0.45`) for maximum stability after initial deployment. Never use `latest` tags in production.

**Theme development (optional):** Only needed if modifying Casper source files beyond CSS. Requires Node.js 20.x LTS, Yarn 1.x, and Gulp 4.x build toolchain. Simpler alternative: use Ghost's Code Injection feature for CSS customizations (fonts, colors, dark/light toggle CSS) without any build toolchain.

### Expected Features

Ghost handles most table stakes features out of the box. The focus is on migration quality and brand customization, explicitly avoiding membership/newsletter complexity.

**Must have (table stakes):**
- **Custom branding** (logo, colors #074491/#3085F5) - fundamental brand identity
- **Inter font** - professional appearance, brand consistency
- **Responsive design** - Casper handles this out of the box
- **Light/dark mode toggle** - modern UX expectation (Casper has auto mode, manual toggle requires theme modification)
- **WordPress migration** - 20-100 articles with images, categories convert to tags
- **Clean URL structure** - Ghost handles automatically (SEO)
- **Image optimization** - Ghost auto-optimizes uploads (Core Web Vitals)
- **Basic SEO** - built-in meta tags, structured data (JSON-LD), XML sitemap
- **RSS feed** - built-in at /rss/
- **Search functionality** - built-in Sodo Search
- **Code syntax highlighting** - built-in via code card (technical blog content)

**Should have (competitive differentiators):**
- **Custom accent colors** (#074491 light mode, #3085F5 dark mode) - strong brand identity
- **Smooth dark/light transition** - polish, modern feel
- **Reading progress indicator** - enhanced reading experience
- **Related posts** - increased engagement
- **Table of contents** - better navigation for long posts
- **Custom 404 page** - brand consistency even in errors

**Defer (anti-features to explicitly avoid):**
- **Membership system** - adds complexity, disable via Settings > Access > "Nobody"
- **Newsletter/email** - requires Mailgun setup, GDPR concerns, maintenance burden
- **Paid subscriptions/Stripe** - not needed for simple blog
- **Comment system** - spam management overhead
- **ActivityPub/Fediverse** - over-engineering for simple blog
- **Multiple authors** - single-author blog
- **Analytics beyond basic logs** - Ghost analytics require membership

### Architecture Approach

The architecture follows Ghost's official three-tier Docker pattern: reverse proxy (Caddy) for SSL termination and routing, Ghost application container (port 2368 internal-only), and MySQL 8 database for persistence. All containers communicate via a dedicated Docker bridge network, with named volumes ensuring data survives container recreation. The Portainer constraint means all deployment happens through Git-to-Stack workflow - no direct docker commands.

**Major components:**
1. **Reverse Proxy (Caddy)** - SSL termination via Let's Encrypt, request routing, X-Forwarded-* header injection, exposes ports 80/443 externally
2. **Ghost (Node.js)** - CMS engine on port 2368 (internal), admin panel at /ghost/, content rendering, Content API, connects to MySQL and reads from theme/content volumes
3. **MySQL 8 Database** - Data persistence (posts, pages, settings, users, tags, metadata), health check ensures startup before Ghost
4. **Persistent Volumes** - `ghost_content` (themes, images, data), `mysql_data` (database files), `caddy_data` (certificates), `caddy_config` (Caddy config)

**Data flow patterns:**
- Content creation: Author → /ghost/ admin → Ghost Admin API → MySQL posts table → saved
- Content delivery: Visitor → Reverse proxy (HTTPS) → Ghost (2368) → MySQL (fetch) → Theme templates (render) → Response
- Theme rendering: Ghost reads from `/var/lib/ghost/content/themes/[theme-name]/`, applies Handlebars templates + data from DB → rendered HTML, serves CSS/JS from `/assets/built/`

**Portainer integration:** Repository structure includes `docker-compose.yml` (stack definition), `.env.example` (template), and optional custom theme in `content/themes/`. Portainer Stack created from Git repository with environment variables (domain, database passwords) configured in Portainer UI. GitOps auto-update via polling or webhook enables push-to-deploy workflow.

### Critical Pitfalls

The research identified 13 pitfalls across critical, moderate, and minor severity. The top five require special attention during infrastructure setup and migration.

1. **Volume mount data loss on container recreation** - Mounting to wrong path (`/var/lib/ghost` instead of `/var/lib/ghost/content`) causes complete loss of all posts, images, and themes when recreating containers. Prevention: mount to `/var/lib/ghost/content`, use named volumes, use MySQL (not SQLite) with separate volume, test persistence before adding content. This is the number one cause of catastrophic failure.

2. **Database credentials changed post-initialization** - Changing `DATABASE_xxx` environment variables after first deployment creates mismatch between Ghost config and actual MySQL credentials, causing Ghost to crash on startup. Prevention: generate strong passwords BEFORE first deployment (`openssl rand -hex 32`), store securely, never change them. If change required: backup database, recreate MySQL container with new credentials, restore data.

3. **URL configuration mismatch causes redirect loops** - Ghost `url` environment variable not matching actual domain, or reverse proxy not sending `X-Forwarded-Proto` header, creates infinite redirect loops making site completely inaccessible. Prevention: set `url` to exact production URL including protocol (`https://avancersimplement.com`), configure proxy headers (`X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host`, `Host`), test before going live.

4. **WordPress migration content loss** - Import fails or posts migrate without images due to corrupted export, PHP timeout (default 30 seconds too short), untitled drafts, or incompatible shortcodes. Prevention: delete/title all untitled drafts before export, increase PHP timeout to 120+ seconds, verify export ZIP is valid (`unzip -t export.zip`), plan 2-4 hours for post-migration cleanup. Note: custom post types, shortcodes, plugin-specific formatting, comments, and category hierarchy do NOT migrate automatically.

5. **No backup strategy until data loss** - Assumed Docker volumes are "safe" without implementing backup or testing restore procedure. Prevention: implement backup on day one BEFORE adding content, back up BOTH MySQL database (mysqldump) AND content volume (images, themes), automate daily backups, store off-server, test restore monthly. Backup commands documented in PITFALLS.md.

**Other notable pitfalls:** Theme cache not cleared after updates (requires container restart), theme upload ZIP file issues (must zip contents not folder, validate with gscan), dark mode toggle breaks on theme update (use Code Injection or maintain fork), MySQL version upgrade without migration, Portainer stack recreation losing settings, forgetting to set `NODE_ENV=production`, reverse proxy 502 errors (network isolation, wrong upstream).

## Implications for Roadmap

Based on research, the project naturally breaks into 5 phases following the critical dependency path: infrastructure → migration → theme → Portainer integration → production. This ordering prevents the catastrophic pitfalls identified in research and aligns with Ghost's recommended deployment workflow.

### Phase 1: Infrastructure Foundation
**Rationale:** Must establish persistent volumes, database configuration, and basic Ghost installation before any content work. Volume misconfiguration is the #1 cause of data loss - must test persistence before proceeding. This phase addresses Pitfalls 1, 2, 3, 10, 12 (volume loss, credentials, URL config, backup, NODE_ENV).

**Delivers:**
- Working Ghost installation accessible locally
- MySQL 8 database with health check
- Named volumes for content and database persistence
- Environment variables template (.env.example)
- Backup strategy documented and implemented

**Addresses (from FEATURES.md):**
- Core Ghost installation (table stakes)
- Database persistence (MySQL 8 required)
- Clean URL structure (configured)

**Avoids (from PITFALLS.md):**
- Pitfall 1: Volume mount data loss - test persistence before adding content
- Pitfall 2: Database credentials mismatch - generate and lock credentials first
- Pitfall 3: URL configuration redirect loops - set correct URL and test
- Pitfall 10: No backup strategy - implement backup on day one
- Pitfall 12: Wrong NODE_ENV - explicitly set production mode

**Technology stack (from STACK.md):**
- Ghost 6.16.x (`ghost:6` Docker image)
- MySQL 8.0 (`mysql:8.0` Docker image)
- Named Docker volumes (ghost_content, mysql_data)
- docker-compose.yml skeleton

**Research flag:** Standard patterns - Ghost Docker deployment is well-documented in official docs. No phase-specific research needed.

### Phase 2: WordPress Content Migration
**Rationale:** Once infrastructure is proven stable (volumes tested, backups working), migrate existing content. Must happen before theme customization because theme may need adjustments based on migrated content structure. This phase addresses Pitfall 4 (migration content loss).

**Delivers:**
- 20-100 WordPress articles migrated to Ghost
- Images transferred and working
- Categories converted to Ghost tags
- URL redirects configured for SEO continuity
- Post-migration cleanup completed

**Addresses (from FEATURES.md):**
- WordPress migration (must have)
- Tag organization (table stakes, WordPress categories → Ghost tags)
- Clean URL structure (redirects for old WordPress URLs)

**Avoids (from PITFALLS.md):**
- Pitfall 4: WordPress migration content loss - careful export preparation, PHP timeout increase, ZIP validation, cleanup budget

**Migration specifics (from FEATURES.md):**
- What migrates: posts, pages, images, categories→tags, authors, publish dates, slugs
- What requires manual work: shortcodes, plugin content, custom post types, attachments, featured images, redirects.json
- Process: Install Ghost WP plugin → Export ZIP → Import via Ghost Admin → Set up redirects → Verify and fix formatting

**Research flag:** Standard patterns - Ghost WordPress migration is well-documented with official plugin. Potential issue: custom shortcodes or plugins may need manual recreation. Budget 2-4 hours for cleanup.

### Phase 3: Reverse Proxy & SSL
**Rationale:** Can run in parallel with or after Phase 1 (Ghost must be running to proxy to). Must be completed before production deployment. Caddy recommended over Nginx/Traefik for automatic HTTPS with minimal configuration. This phase addresses Pitfall 3 (redirect loops), Pitfall 13 (502 errors).

**Delivers:**
- Caddy reverse proxy service
- Automatic HTTPS via Let's Encrypt
- Domain routing configured
- X-Forwarded headers properly set
- HTTPS access tested and working

**Addresses (from FEATURES.md):**
- HTTPS/SSL (table stakes for modern web)
- Security headers (implicit in reverse proxy)

**Avoids (from PITFALLS.md):**
- Pitfall 3: URL redirect loops - configure X-Forwarded-Proto and headers correctly
- Pitfall 13: 502 Bad Gateway - ensure Ghost and proxy on same network, use container names, add health checks

**Technology stack (from STACK.md):**
- Caddy 2.x (`caddy:2` Docker image)
- Caddyfile configuration (minimal: `domain { reverse_proxy ghost:2368 }`)
- Caddy volumes for certificates and config

**Pattern to follow (from ARCHITECTURE.md):**
- Pattern 3: Reverse Proxy with Proper Headers - configure X-Forwarded-Proto, X-Forwarded-Host, X-Real-IP for Ghost behind proxy to prevent redirect loops

**Research flag:** Standard patterns - Caddy configuration for Ghost is documented in official Ghost Docker guide. No phase-specific research needed.

### Phase 4: Theme Customization
**Rationale:** Depends on Phase 1 (Ghost running) and ideally Phase 2 (content migrated to test theme with real content). Theme work is isolated from infrastructure, so can be developed independently. Critical decision: Code Injection (simple) vs forked Casper theme (complex but maintainable).

**Delivers:**
- Inter font applied
- Custom brand colors (#074491 light mode, #3085F5 dark mode)
- Light/dark mode toggle implemented
- Theme activated and tested with migrated content
- Theme customization strategy documented

**Addresses (from FEATURES.md):**
- Custom branding (table stakes)
- Inter font (table stakes)
- Light/dark mode toggle (table stakes)
- Custom accent colors (differentiator)
- Smooth dark/light transition (differentiator)

**Avoids (from PITFALLS.md):**
- Pitfall 5: Theme cache not cleared - document restart requirement after theme changes
- Pitfall 6: Theme upload ZIP issues - validate with gscan before upload, zip contents not folder
- Pitfall 7: Dark mode breaks on update - choose strategy upfront (Code Injection recommended for simple changes)

**Pattern to follow (from ARCHITECTURE.md):**
- Pattern 1: Theme as Volume Mount - mount custom theme as read-only bind mount from git repository for theme updates via git push
- Pattern 4: Casper Theme Fork Strategy - if forking, rename package, maintain upstream connection for updates

**Theme customization options (from FEATURES.md):**
1. **Code Injection** (simpler): Use Settings > Code injection for CSS customizations (fonts, colors, dark mode CSS). No build toolchain needed. Survives theme updates.
2. **Forked Casper** (more control): Fork Casper, rename to casper-avancer, modify templates and CSS. Requires Node 20.x + Yarn + Gulp build toolchain. Better for structural changes (toggle button HTML).

**Research flag:** Moderate complexity - dark mode toggle implementation has community guides but requires testing. Consider `/gsd:research-phase` if going beyond simple CSS (e.g., toggle button with localStorage).

### Phase 5: Portainer Integration & Production
**Rationale:** Depends on Phases 1-4 complete (infrastructure, migration, proxy, theme). Final step connects Git repository to Portainer Stacks for push-to-deploy workflow and production configuration. This phase addresses Pitfall 9 (Portainer stack recreation).

**Delivers:**
- Git repository with complete docker-compose.yml
- Portainer Stack created from Git repository
- Environment variables configured in Portainer UI
- GitOps auto-update (webhook or polling)
- Production domain configured and DNS set up
- Push-to-deploy workflow tested

**Addresses (from FEATURES.md):**
- Deployment via Portainer (project constraint)
- Production domain configuration

**Avoids (from PITFALLS.md):**
- Pitfall 9: Portainer stack recreation loses settings - save complete docker-compose.yml with all env vars, mark volumes as external, use "Update stack" not "Delete + Create"

**Pattern to follow (from ARCHITECTURE.md):**
- Pattern 2: Environment-Based Configuration - all Ghost config via environment variables (not config files), secrets stay in Portainer UI

**Portainer workflow (from ARCHITECTURE.md):**
1. Git repository with docker-compose.yml
2. Portainer "Stack from Git Repository" (repo URL, branch, compose path)
3. Environment variables in Portainer UI (DOMAIN, DATABASE_PASSWORD, url)
4. GitOps auto-update (polling or webhook)
5. Stack deployed, Ghost running

**Research flag:** Standard patterns - Portainer Stacks from Git is well-documented in Portainer docs. Webhook setup may need verification.

### Phase Ordering Rationale

The phase order follows the critical dependency path identified in ARCHITECTURE.md: `docker-compose.yml → MySQL → Ghost → Theme Mount → Reverse Proxy → Portainer Stack → Production`.

- **Why Infrastructure first:** Volume misconfiguration (Pitfall 1) is catastrophic - must establish and test persistence before any content work. Database credentials (Pitfall 2) cannot be changed after initialization without data migration. URL configuration (Pitfall 3) requires coordination between Ghost env var and reverse proxy headers.

- **Why Migration before Theme:** Theme may need adjustments based on migrated content structure (e.g., tag display, post formatting). Testing theme with real content (not sample posts) reveals issues early.

- **Why Proxy can run parallel:** Reverse proxy (Phase 3) only depends on Ghost running (Phase 1.3), so can develop in parallel with migration (Phase 2) or theme (Phase 4). However, must complete before production (Phase 5).

- **Why Portainer integration last:** Portainer Stack workflow (Phase 5) requires complete, tested docker-compose.yml with all services (infrastructure, proxy, theme). Git repository becomes source of truth only when all components are verified working.

**Parallelization opportunities:**
- Phase 2 (Migration) can start immediately after Phase 1 infrastructure is tested
- Phase 3 (Proxy) can develop in parallel with Phase 2 or Phase 4
- Phase 4 (Theme) can start after Phase 1.3 (Ghost running), doesn't depend on Phase 2 completion but ideally waits for real content

**Critical path:** Phase 1 → Phase 2 → Phase 5 (infrastructure → content → production). Phases 3 and 4 can run in parallel or in any order after Phase 1.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 4 (Theme Customization)** - Dark mode toggle implementation has multiple approaches (CSS-only, toggle with localStorage, Casper built-in system extension). Community guides exist but may need verification. Consider `/gsd:research-phase` if implementing manual toggle button beyond simple Code Injection CSS.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Infrastructure)** - Ghost Docker deployment extensively documented in official Ghost installation guide. docker-compose.yml patterns are canonical.
- **Phase 2 (Migration)** - WordPress migration process documented in official Ghost migration guide with official WordPress plugin. Process is well-established.
- **Phase 3 (Proxy)** - Caddy configuration for Ghost documented in Ghost's official Docker guide. X-Forwarded headers pattern is standard.
- **Phase 5 (Portainer)** - Portainer Stacks from Git repository documented in official Portainer docs. GitOps workflow is standard feature.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official Ghost Docker docs, Docker Hub images (ghost:6, mysql:8.0, caddy:2), recent release notes (v6.16.1 Jan 30 2026). All recommendations from official sources. |
| Features | HIGH | Official Ghost documentation for built-in features, WordPress migration guide with official plugin. Theme customization verified via Casper GitHub and Ghost theme docs. Anti-features clearly documented (disable membership). |
| Architecture | HIGH | Official Ghost Docker installation guide provides canonical three-tier pattern. Portainer Stacks well-documented. Volume mount paths verified via Docker Hub official image docs and GitHub issues. |
| Pitfalls | MEDIUM-HIGH | Critical pitfalls (volume loss, credentials, redirect loops, migration issues) verified via official docs and GitHub issues. Community pitfalls (theme cache, dark mode) from Ghost Forum and multiple community guides. Testing recommendations based on common failure patterns. |

**Overall confidence:** HIGH

The research is anchored in official sources (Ghost documentation, Docker Hub official images, GitHub repositories) with community guides used only for confirmation or edge cases. All critical recommendations (MySQL 8 required, volume mount paths, reverse proxy headers) are directly from official Ghost Docker installation guide. The stack versions are current (Ghost 6.16.1 released Jan 30 2026, MySQL 8.0.45, Caddy 2.10.2).

### Gaps to Address

**Theme customization strategy** - Research identified three approaches (Code Injection, forked Casper, Casper built-in settings) but the optimal choice depends on specific dark mode toggle requirements. If user wants a visible toggle button (not just CSS media query), forked theme or JavaScript in Code Injection is required. This needs user decision during Phase 4 planning.

**Portainer webhook configuration** - Research confirmed GitOps auto-update via webhook or polling is supported, but specific webhook setup steps for GitHub → Portainer integration may need verification during Phase 5. Polling is simpler but less immediate; webhook requires Portainer endpoint configuration and GitHub Action.

**WordPress export edge cases** - Research documented the standard migration process, but specific WordPress plugins or shortcodes used in the existing 20-100 articles may have migration issues not covered in general documentation. Plan 2-4 hours cleanup budget, but actual time depends on content complexity.

**Backup automation via Portainer** - Research documented manual backup commands (mysqldump, volume tar), but automating these backups within Portainer constraints (no CLI access) may require Portainer scheduled tasks or external cron. Consider third-party container like ghost-backup for automated backups.

## Sources

### Primary (HIGH confidence)

**Official Ghost Documentation:**
- [Ghost Docker Installation Guide](https://docs.ghost.org/install/docker) - Official Ghost 6.0+ Docker setup, architecture patterns, environment variables
- [Ghost WordPress Migration](https://docs.ghost.org/migration/wordpress) - Official migration guide with WordPress plugin
- [Ghost Manual Backup](https://ghost.org/docs/faq/manual-backup/) - Backup strategies and restore procedures
- [Ghost Theme Documentation](https://docs.ghost.org/themes) - Theme structure, Handlebars templates, caching behavior
- [Ghost Editor Cards](https://ghost.org/help/cards/) - Built-in content features
- [Ghost SEO Guide](https://ghost.org/help/seo/) - Built-in SEO features
- [Disable Memberships](https://ghost.org/help/can-i-disable-memberships/) - Anti-feature configuration

**Official Docker Images:**
- [Docker Hub Ghost Image](https://hub.docker.com/_/ghost) - Official image tags, configuration, mount paths (v6.16.1 current)
- [Docker Hub MySQL Image](https://hub.docker.com/_/mysql) - MySQL 8.0.45 current version
- [Docker Hub Caddy Image](https://hub.docker.com/_/caddy) - Caddy 2.10.2 current version

**Official Repositories:**
- [Ghost GitHub Releases](https://github.com/TryGhost/Ghost/releases) - Version history, v6.16.1 released Jan 30 2026
- [Casper Theme GitHub](https://github.com/TryGhost/Casper) - Official theme source, customization points
- [Alto Theme GitHub](https://github.com/TryGhost/Alto) - Official dark mode reference theme

**Portainer Documentation:**
- [Portainer Stacks Documentation](https://docs.portainer.io/user/docker/stacks/add) - Git-based deployment
- [Portainer Webhooks](https://docs.portainer.io/user/docker/services/webhooks) - Auto-update configuration

**GitHub Issues (verified pitfalls):**
- [Ghost Issue #9429](https://github.com/TryGhost/Ghost/issues/9429) - Volume persistence data loss
- [Ghost Issue #8966](https://github.com/TryGhost/Ghost/issues/8966) - URL redirect to localhost
- [docker-library/ghost Issue #156](https://github.com/docker-library/ghost/issues/156) - Ghost-CLI in Docker
- [docker-library/ghost Issue #116](https://github.com/docker-library/ghost/issues/116) - Incorrect mount point

### Secondary (MEDIUM confidence)

**Community Guides (verified against official docs):**
- [Self-Hosting Ghost 6 on Linux with Docker Compose (2025 edition)](https://zerotohomelab.cloudboxhub.com/how-to-self-host-a-ghost-blog-with-docker-compose-on-linux-2025-edition/) - Community Docker setup
- [Installing Ghost CMS with Portainer](https://unihost.com/help/installing-ghost-cms-with-portainer/) - Portainer-specific workflow
- [Marius Hosting - Ghost with MySQL](https://mariushosting.com/synology-install-ghost-blogging-using-mysql-as-database/) - Docker Compose patterns
- [Portainer GitOps Guide](https://tobiasfenster.io/use-portainer-to-deploy-and-update-docker-container-stacks-from-a-git-repo) - Git webhook workflow
- [Linux Handbook - Ghost Docker Guide](https://linuxhandbook.com/deploy-ghost-docker/) - Deployment patterns

**Theme Customization Resources:**
- [Change Casper Theme Fonts with Google Fonts](https://aspirethemes.com/blog/casper-google-fonts) - Code Injection method
- [Self-Host Google Fonts in Ghost](https://brightthemes.com/blog/ghost-google-fonts-self-host) - Font optimization
- [Dark Mode Toggle for Casper](https://ghostfam.com/en/dark-mode-toggle-for-casper/) - Toggle implementation
- [Adding Dark Mode Button](https://www.spectralwebservices.com/blog/adding-a-dark-mode-button-to-your-ghost-blog/) - JavaScript approach
- [Ghost Forum - Dark Mode Toggle](https://forum.ghost.org/t/add-dark-mode-toggle-automatic-dark-mode-based-on-prefs-set-cookie-for-casper-v4/21368) - Community discussion

**Ghost Forum (troubleshooting patterns):**
- [Ghost Forum - Self-hosting discussions](https://forum.ghost.org/c/self-hosting) - Community pitfalls
- [Ghost Proxy Configuration](https://ghost.org/docs/faq/proxying-https-infinite-loops/) - X-Forwarded header setup
- [Ghost Forum - Upload theme fails](https://forum.ghost.org/t/uploading-theme-fails-to-read-zip-file/14597) - ZIP file issues

---
*Research completed: 2026-02-02*
*Ready for roadmap: yes*
