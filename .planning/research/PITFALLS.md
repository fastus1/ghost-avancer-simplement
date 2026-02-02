# Domain Pitfalls: Ghost Self-Hosted Blog

**Domain:** Self-hosted Ghost CMS with Docker/Portainer
**Researched:** 2026-02-01
**Overall Confidence:** MEDIUM-HIGH (verified with official docs and community sources)

---

## Critical Pitfalls

Mistakes that cause data loss, rewrites, or major outages.

---

### Pitfall 1: Volume Mount Data Loss on Container Recreation

**What goes wrong:** All content (posts, images, themes) disappears when recreating or updating the Ghost container.

**Why it happens:**
- Mounting to wrong path (`/var/lib/ghost` instead of `/var/lib/ghost/content`)
- In older Ghost versions, images saved to `/var/lib/ghost/current/content/images` instead of mounted volume
- SQLite database stored outside mounted volume in development mode
- Portainer stack recreation without proper volume persistence

**Consequences:**
- Complete loss of all posts and pages
- All uploaded images gone
- Custom themes deleted
- Must restore from backup or start over

**Prevention:**
1. Always mount to `/var/lib/ghost/content` (not `/var/lib/ghost`)
2. For production: Use MySQL (not SQLite) with separate persistent volume
3. Use named volumes in docker-compose, not just bind mounts
4. In development mode, explicitly set: `database__connection__filename='/var/lib/ghost/content/data/ghost.db'`
5. Test volume persistence: create content, stop container, restart, verify content exists

**Detection:**
- After container restart, Ghost shows setup wizard instead of your site
- Images return 404 errors after update
- Post count shows 0 in admin

**Phase mapping:** Infrastructure Setup - verify volumes before any content creation

**Confidence:** HIGH - [Official Docker docs](https://hub.docker.com/_/ghost), [GitHub Issue #9429](https://github.com/TryGhost/Ghost/issues/9429)

---

### Pitfall 2: Database Credentials Changed Post-Initialization

**What goes wrong:** Ghost fails to start with connection errors after modifying database environment variables.

**Why it happens:** The `DATABASE_xxx` variables configure Ghost's connection, but don't modify the actual MySQL database credentials. Changing them after initialization creates a mismatch.

**Consequences:**
- Ghost container crashes on startup
- "Access denied" or "Connection refused" errors
- Site completely down

**Prevention:**
1. Generate strong passwords BEFORE first deployment: `openssl rand -hex 32`
2. Store credentials securely and never change them
3. If change is required: backup database, recreate MySQL container with new creds, restore data
4. Document all credentials in a secure password manager

**Detection:**
- Ghost container restarts repeatedly (check Portainer logs)
- MySQL connection errors in Ghost logs
- Container status shows "Restarting" in Portainer

**Phase mapping:** Infrastructure Setup - generate and lock credentials before first start

**Confidence:** HIGH - [Official Ghost Docker docs](https://docs.ghost.org/install/docker)

---

### Pitfall 3: URL Configuration Mismatch Causes Redirect Loops

**What goes wrong:** Site enters infinite redirect loop, or all links redirect to `localhost:2368`.

**Why it happens:**
- Ghost `url` environment variable doesn't match actual domain
- HTTPS configured in Ghost but reverse proxy not sending `X-Forwarded-Proto` header
- Mismatch between configured URL and how users access the site

**Consequences:**
- Site completely inaccessible (redirect loop)
- Admin panel unreachable
- Email invitation links broken (point to localhost)
- SEO damaged if wrong URLs indexed

**Prevention:**
1. Set `url` to exact production URL including protocol: `url=https://avancersimplement.com`
2. Configure reverse proxy with required headers:
   ```nginx
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header X-Forwarded-Proto $scheme;
   proxy_set_header X-Forwarded-Host $host;
   proxy_set_header Host $host;
   ```
3. Test BEFORE going live: check that admin links use correct domain
4. Never use `localhost` in production URL

**Detection:**
- Browser shows "too many redirects" error
- Clicking site title goes to `localhost:2368`
- Email links point to wrong domain

**Phase mapping:** Infrastructure Setup - configure URL and proxy headers together

**Confidence:** HIGH - [Ghost GitHub Issue #8966](https://github.com/TryGhost/Ghost/issues/8966), [Community guide](https://mrvautin.com/how-to-setup-https-on-your-ghost-blog-without-redirect-loop/)

---

### Pitfall 4: WordPress Migration Content Loss

**What goes wrong:** Posts import but images missing, formatting broken, or import fails entirely.

**Why it happens:**
- WordPress export ZIP file corrupted or malformed
- PHP timeout during export (default 30 seconds too short)
- Untitled drafts cause import failure
- Custom post types, shortcodes, and plugins don't migrate

**Consequences:**
- Hours spent manually fixing content
- Missing images require re-upload
- Broken formatting throughout site
- Categories lost (converted to tags only)

**Prevention:**
1. Before export: delete/title all untitled drafts
2. Increase PHP timeout to 120+ seconds before running Ghost export plugin
3. Convert important categories to tags before export
4. Export only published content first, then drafts separately
5. Verify export ZIP is valid: `unzip -t export.zip`
6. For 20-100 articles: plan 2-4 hours for post-migration cleanup

**What does NOT migrate (plan accordingly):**
- Custom post types
- Uncommon shortcodes
- Plugin-specific formatting (galleries, footnotes)
- Comments (require separate migration)
- Category hierarchy (flattened to tags)
- Meta fields and custom fields

**Detection:**
- Import shows "failed to read zip file" error
- Post count after import lower than expected
- Images show as broken links

**Phase mapping:** Content Migration - allocate cleanup time in schedule

**Confidence:** HIGH - [Official Migration Docs](https://docs.ghost.org/migration/wordpress)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or degraded functionality.

---

### Pitfall 5: Theme Cache Not Cleared After Updates

**What goes wrong:** Theme changes don't appear on site despite uploading new version.

**Why it happens:** In production mode, Ghost caches template files. Changes to `.hbs` files only visible after Ghost restart. New files not detected without restart.

**Prevention:**
1. After theme upload: restart Ghost container via Portainer
2. For development: run Ghost in development mode (`NODE_ENV=development`)
3. When adding new `.hbs` files: always restart
4. Use `gscan` to validate theme before upload

**Detection:**
- Theme upload succeeds but changes not visible
- New pages/templates return 404
- CSS changes appear but template changes don't

**Phase mapping:** Theme Development - document restart requirement in workflow

**Confidence:** HIGH - [Ghost Theme Docs](https://docs.ghost.org/themes)

---

### Pitfall 6: Theme Upload Zip File Issues

**What goes wrong:** Theme upload fails with "Failed to read zip file" or validation errors.

**Why it happens:**
- Zip file created incorrectly (zipping folder instead of contents)
- `package.json` missing required fields (name, version, author.email)
- Node version mismatch during build (Gulp issues)
- File permissions inside zip incorrect

**Prevention:**
1. Zip contents, not folder: select all files inside theme directory, then compress
2. Validate with `gscan` before upload: `npx gscan ./theme-folder`
3. Ensure `package.json` has: `name`, `version`, `author` with email
4. Use Node 18+ for theme development
5. Build on same OS as target (avoid Windows/Linux zip incompatibilities)

**Detection:**
- "Failed to read zip file" error on upload
- Package.json validation warnings
- gscan reports errors

**Phase mapping:** Theme Development - validate locally before every upload

**Confidence:** MEDIUM - [Ghost Forum discussions](https://forum.ghost.org/t/uploading-theme-fails-to-read-zip-file/14597)

---

### Pitfall 7: Dark Mode Toggle Implementation Breaks on Theme Update

**What goes wrong:** Custom dark mode toggle stops working after Casper theme update.

**Why it happens:**
- Custom code injection overridden by theme update
- Modified `default.hbs` replaced by new version
- CSS class names changed in new Casper version
- JavaScript modifications lost

**Prevention:**
1. **Best approach:** Use Ghost's built-in custom settings for color scheme (Casper 4.x+)
2. Keep customizations in code injection (Settings > Code Injection) rather than theme files
3. If modifying theme: maintain a fork, document all changes, merge updates carefully
4. Use CSS custom properties (variables) that survive theme updates
5. Before updating: export current theme as backup

**Detection:**
- Toggle button disappears or stops working after update
- Site stuck in one color mode
- JavaScript console errors related to theme toggle

**Phase mapping:** Theme Development - decide customization strategy upfront

**Confidence:** MEDIUM - [Ghost Forum](https://forum.ghost.org/t/add-dark-mode-toggle-automatic-dark-mode-based-on-prefs-set-cookie-for-casper-v4/21368), [ghostfam.com guide](https://ghostfam.com/en/dark-mode-toggle-for-casper/)

---

### Pitfall 8: MySQL Version Upgrade Breaks Database

**What goes wrong:** Ghost fails to start after MySQL container update with database errors.

**Why it happens:**
- Upgrading MySQL major version (5.7 to 8.0) without proper migration
- Ghost not updated to latest minor version before major upgrade
- Incompatible database schema

**Prevention:**
1. Always update Ghost to latest minor version BEFORE major version upgrades
2. Pin MySQL version in docker-compose: `mysql:8.0` not `mysql:latest`
3. Backup database before any MySQL or Ghost version change
4. Test upgrades on staging environment first

**Detection:**
- Ghost container crash after update
- Database migration errors in logs
- "Unknown column" or schema errors

**Phase mapping:** Infrastructure Setup - pin versions, document upgrade procedure

**Confidence:** HIGH - [Docker Hub Ghost docs](https://hub.docker.com/_/ghost)

---

### Pitfall 9: Portainer Stack Recreation Loses Settings

**What goes wrong:** Recreating stack in Portainer resets Ghost to initial state or causes configuration issues.

**Why it happens:**
- Environment variables not saved in stack definition
- Volumes not properly defined as external
- Stack deleted and recreated instead of updated

**Prevention:**
1. Save complete docker-compose.yml with ALL environment variables in Portainer
2. Mark volumes as `external: true` after initial creation
3. Use "Update stack" not "Delete + Create"
4. Never store secrets only in Portainer UI - keep backup of compose file
5. Export Portainer stack configuration periodically

**Detection:**
- After stack update, Ghost shows setup wizard
- Environment variables missing from container inspect
- Volumes show as newly created

**Phase mapping:** Infrastructure Setup - document complete stack configuration

**Confidence:** MEDIUM - [Portainer GitHub Issue #2345](https://github.com/portainer/portainer/issues/2345)

---

### Pitfall 10: No Backup Strategy Until Data Loss

**What goes wrong:** Content lost with no way to recover.

**Why it happens:**
- Assumed Docker volumes are "safe"
- JSON export doesn't include images or member data
- Never tested restore procedure
- Backup exists but is corrupted or incomplete

**Prevention:**
1. Implement backup on day one, before adding content
2. Back up BOTH:
   - MySQL database: `mysqldump` from container
   - Content volume: `/var/lib/ghost/content` (images, themes)
3. Automate backups (daily minimum)
4. Store backups off-server (different location than Ghost host)
5. **Test restore monthly**: spin up test instance, restore backup, verify content

**Backup commands for Docker:**
```bash
# Database backup (via Portainer console or scheduled task)
docker exec ghost-mysql mysqldump -u root -p ghost > ghost_backup.sql

# Content volume backup
docker run --rm -v ghost_content:/data -v /backups:/backup alpine tar czf /backup/ghost_content.tar.gz -C /data .
```

**Detection:**
- No recent backup files exist
- Never tested restore procedure
- Backup files are 0 bytes or corrupted

**Phase mapping:** Infrastructure Setup - implement before content creation

**Confidence:** HIGH - [Official backup docs](https://ghost.org/docs/faq/manual-backup/)

---

## Minor Pitfalls

Annoyances that are easily fixable but waste time.

---

### Pitfall 11: Ghost-CLI Commands Fail in Docker

**What goes wrong:** Running `ghost` commands inside Docker container fails or causes issues.

**Why it happens:** Ghost-CLI is designed for traditional server installations, not Docker. Many commands don't work correctly in containerized environments.

**Prevention:**
1. Don't use Ghost-CLI inside Docker containers
2. For configuration: use environment variables only
3. For updates: update Docker image, not ghost CLI
4. For diagnostics: use Docker logs, not ghost doctor

**Detection:**
- Commands fail with permission errors
- ghost doctor reports false issues
- Configuration changes don't persist

**Phase mapping:** All phases - train team to use Docker patterns

**Confidence:** HIGH - [docker-library/ghost#156](https://github.com/docker-library/ghost/issues/156)

---

### Pitfall 12: Forgetting to Set NODE_ENV=production

**What goes wrong:** Site runs in development mode with SQLite, unsuitable for production.

**Why it happens:** Default is development mode. Easy to forget environment variable.

**Consequences:**
- SQLite database (single-file, limited concurrency)
- Different caching behavior
- Debug information exposed
- Performance issues under load

**Prevention:**
1. Always explicitly set `NODE_ENV=production` in docker-compose
2. Verify with: container logs should not show "Development" mode warnings
3. Production requires MySQL - if Ghost starts without MySQL config, it's in dev mode

**Detection:**
- Ghost logs show "Running in development mode"
- Database file is `.db` not MySQL
- Performance issues with multiple users

**Phase mapping:** Infrastructure Setup - include in configuration checklist

**Confidence:** HIGH - [Official Docker docs](https://hub.docker.com/_/ghost)

---

### Pitfall 13: Reverse Proxy 502 Bad Gateway

**What goes wrong:** Site returns 502 error intermittently or consistently.

**Why it happens:**
- Ghost container not running or crashed
- Proxy pointing to wrong port or container name
- Network isolation between proxy and Ghost containers
- Ghost startup slower than proxy health check

**Prevention:**
1. Ensure Ghost and proxy on same Docker network
2. Use container name (not localhost) in proxy upstream config
3. Add health check and startup delay to Ghost container
4. Check Portainer for container status before debugging proxy

**Detection:**
- 502 errors in browser
- Nginx error log shows "upstream connection refused"
- Ghost container restarting in Portainer

**Phase mapping:** Infrastructure Setup - test proxy config before going live

**Confidence:** HIGH - [Community troubleshooting](https://forum.ghost.org/t/trouble-with-ghost-in-docker-nginx-reverse-proxy/32647)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Infrastructure Setup | Volume data loss (#1) | Test persistence before adding content |
| Infrastructure Setup | URL redirect loops (#3) | Configure proxy headers with Ghost URL together |
| Infrastructure Setup | Missing backups (#10) | Implement backup before any content |
| Database Setup | Credentials mismatch (#2) | Generate and lock credentials before first start |
| Database Setup | MySQL version issues (#8) | Pin specific MySQL version |
| WordPress Migration | Content loss (#4) | Prepare export carefully, allocate cleanup time |
| Theme Development | Cache not cleared (#5) | Document restart requirement |
| Theme Development | Zip file issues (#6) | Validate with gscan before upload |
| Theme Customization | Dark mode breaks on update (#7) | Use code injection or maintain fork |
| Ongoing Operations | No backup test (#10) | Monthly restore test |

---

## Portainer-Specific Considerations

Since Portainer manages Docker (no direct docker commands):

1. **Stack Definition is Source of Truth**: Keep docker-compose.yml backed up outside Portainer
2. **Volume Management**: Create volumes via Portainer UI, mark as external in compose
3. **Container Logs**: Access via Portainer container detail page for debugging
4. **Environment Variables**: Store in stack editor, not container environment
5. **Updates**: Use "Pull and redeploy" in Portainer, not manual container recreation
6. **Backups**: Schedule via Portainer jobs or external cron, not docker exec

---

## Quick Reference Checklist

Before going live:

- [ ] Volume persistence tested (create content, restart, verify)
- [ ] Database credentials generated and documented securely
- [ ] URL matches production domain exactly
- [ ] Reverse proxy headers configured (X-Forwarded-Proto, etc.)
- [ ] NODE_ENV=production set
- [ ] MySQL 8 configured (not SQLite)
- [ ] Backup strategy implemented and tested
- [ ] Theme validated with gscan
- [ ] WordPress migration cleanup completed

---

## Sources

### Official Documentation (HIGH confidence)
- [Ghost Docker Installation](https://docs.ghost.org/install/docker)
- [Ghost WordPress Migration](https://docs.ghost.org/migration/wordpress)
- [Ghost Manual Backup](https://ghost.org/docs/faq/manual-backup/)
- [Docker Hub Ghost Image](https://hub.docker.com/_/ghost)
- [Ghost Theme Documentation](https://docs.ghost.org/themes)

### GitHub Issues (HIGH confidence)
- [Ghost data not persisting - Issue #9429](https://github.com/TryGhost/Ghost/issues/9429)
- [Docker redirect to localhost - Issue #8966](https://github.com/TryGhost/Ghost/issues/8966)
- [Ghost-CLI in Docker - docker-library/ghost#156](https://github.com/docker-library/ghost/issues/156)
- [Incorrect mount point - docker-library/ghost#116](https://github.com/docker-library/ghost/issues/116)

### Community Resources (MEDIUM confidence)
- [Ghost Forum - Self-hosting discussions](https://forum.ghost.org/c/self-hosting)
- [Linux Handbook - Ghost Docker Guide](https://linuxhandbook.com/deploy-ghost-docker/)
- [Ghost Fam - Dark Mode Toggle](https://ghostfam.com/en/dark-mode-toggle-for-casper/)
