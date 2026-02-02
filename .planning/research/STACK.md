# Technology Stack

**Project:** Ghost Avancer Simplement (Self-Hosted Blog)
**Researched:** 2026-02-01
**Overall Confidence:** HIGH

## Recommended Stack

### Core Application

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Ghost | `6.16.x` (use `ghost:6` tag) | Blog CMS | Official platform, actively maintained, released 6.16.1 on Jan 30 2026. The `ghost:6` tag auto-updates to latest 6.x | HIGH |
| Node.js | Built into Ghost image | Runtime | Ghost image bundles appropriate Node version internally | HIGH |

**Version Strategy:** Use `ghost:6` tag rather than pinning to exact version. This gives you patch updates automatically while staying on Ghost 6.x major version. For maximum stability, pin to `ghost:6.16` (minor version) after initial deployment.

### Database

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| MySQL | `8.0` (use `mysql:8.0` tag) | Primary database | **Required for Ghost 6.x production.** Ghost officially supports only MySQL 8 in production. SQLite is dev-only and unsupported. Current Docker image: 8.0.45 | HIGH |

**Why MySQL over SQLite:**
- Ghost 6.x requires MySQL for production (official documentation)
- SQLite has single-writer limitation causing write-lock contention
- Ghost does not QA SQLite for production workloads
- New features (ActivityPub, Analytics) may require MySQL-specific functions
- Migration between databases is possible via JSON export but unnecessary complexity

**Why NOT MariaDB:**
- Ghost officially tests against MySQL 8, not MariaDB
- Some tutorials show MariaDB working, but it's outside Ghost's official support envelope
- For a simple blog with no edge cases, MySQL 8 keeps you on the blessed path

### Reverse Proxy / Web Server

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Caddy | `2.10.x` (use `caddy:2` tag) | Reverse proxy, TLS | **Recommended by Ghost's official Docker setup.** Automatic HTTPS via Let's Encrypt with zero configuration. Simpler than Nginx/Traefik | HIGH |

**Why Caddy over Nginx/Traefik:**

| Criterion | Caddy | Nginx | Traefik |
|-----------|-------|-------|---------|
| TLS automation | Automatic (built-in ACME) | Manual (Certbot) | Automatic but complex config |
| Configuration | Simple Caddyfile | Verbose config files | Label-based, steep learning curve |
| Ghost official support | Yes (Docker docs use Caddy) | Community supported | Community supported |
| Portainer compatibility | Excellent | Excellent | Good but more complex |
| Resource usage | Low | Low | Medium |

**If you must use something else:**
- Nginx Proxy Manager: Good UI, but requires MariaDB backend (extra container)
- Traefik: Overkill for single-app deployment, better for multi-service orchestration
- Existing reverse proxy: If you already have Nginx/Traefik managing other services, add Ghost as a new upstream

### Infrastructure / Deployment

| Technology | Purpose | Why | Confidence |
|------------|---------|-----|------------|
| Portainer | Container management | **Project constraint.** All Docker operations via Portainer Stacks UI, no CLI | HIGH |
| Docker Compose (via Portainer Stacks) | Service orchestration | Native Portainer integration. Paste compose YAML into Stacks UI | HIGH |
| Named Docker Volumes | Data persistence | Survives container recreation. Required for `/var/lib/ghost/content` and `/var/lib/mysql` | HIGH |

### Theme Development (for Casper customization)

| Technology | Version | Purpose | When to Use | Confidence |
|------------|---------|---------|-------------|------------|
| Node.js | 20.x LTS | Theme build toolchain | Only if modifying Casper source files | MEDIUM |
| Yarn | 1.x | Package manager | Casper uses Yarn for dependencies | MEDIUM |
| Gulp | 4.x | Build system | Compiles CSS/JS in Casper theme | MEDIUM |

**Simpler alternative:** Use Ghost's Code Injection (Settings > Code injection) for CSS customizations. No build toolchain needed for:
- Custom fonts (Inter)
- Color overrides (Circle.so branding)
- Dark/light toggle CSS

### WordPress Migration

| Tool | Purpose | Confidence |
|------|---------|------------|
| Ghost WordPress Plugin | Export WordPress content to Ghost-compatible JSON+images ZIP | HIGH |
| Ghost Admin Import | Import the ZIP via Settings > Advanced > Migration Tools | HIGH |

**Migration notes:**
- WordPress categories become Ghost tags (first category = primary tag)
- Custom fields and shortcodes will NOT migrate
- Images are included in export if plugin configured correctly
- 20-100 articles is well within Ghost's import limits

## Docker Compose Stack (Portainer-Ready)

```yaml
version: "3.8"

services:
  ghost:
    image: ghost:6
    container_name: ghost-avancer-simplement
    restart: unless-stopped
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      url: https://your-domain.com
      database__client: mysql
      database__connection__host: mysql
      database__connection__user: ghost
      database__connection__password: ${GHOST_DB_PASSWORD}
      database__connection__database: ghost
      NODE_ENV: production
    volumes:
      - ghost_content:/var/lib/ghost/content
    networks:
      - ghost-network
    labels:
      - "caddy=your-domain.com"
      - "caddy.reverse_proxy={{upstreams 2368}}"

  mysql:
    image: mysql:8.0
    container_name: ghost-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ghost
      MYSQL_USER: ghost
      MYSQL_PASSWORD: ${GHOST_DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - ghost-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  caddy:
    image: caddy:2
    container_name: ghost-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - ghost-network

volumes:
  ghost_content:
  mysql_data:
  caddy_data:
  caddy_config:

networks:
  ghost-network:
    driver: bridge
```

**Caddyfile (minimal):**
```
your-domain.com {
    reverse_proxy ghost:2368
}
```

## Environment Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `GHOST_DB_PASSWORD` | Generate with `openssl rand -hex 32` | Ghost MySQL user password |
| `MYSQL_ROOT_PASSWORD` | Generate with `openssl rand -hex 32` | MySQL root password |

**In Portainer:** Add these as Stack environment variables, not in the compose file directly.

## Backup Strategy

### What to Back Up

| Data | Location | Method | Frequency |
|------|----------|--------|-----------|
| MySQL database | `mysql_data` volume | `mysqldump` via `docker exec` | Daily |
| Ghost content | `ghost_content` volume | Volume copy or tar | Daily |
| Caddy certificates | `caddy_data` volume | Volume copy | Weekly |

### Backup Commands (run from host or via Portainer exec)

```bash
# MySQL dump
docker exec ghost-mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} ghost > ghost_backup_$(date +%Y%m%d).sql

# Content directory
docker run --rm -v ghost_content:/data -v $(pwd):/backup alpine tar czf /backup/ghost_content_$(date +%Y%m%d).tar.gz -C /data .
```

### Automated Backup Option

Consider [ghost-backup](https://github.com/bennetimo/ghost-backup) container - automated daily backups of database + content, keeps last 30 by default.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Recommended |
|----------|-------------|-------------|---------------------|
| Database | MySQL 8.0 | SQLite | Not officially supported for production; write-lock limitations |
| Database | MySQL 8.0 | MariaDB | Outside Ghost's official test matrix |
| Database | MySQL 8.0 | PostgreSQL | Not supported by Ghost |
| Reverse Proxy | Caddy | Nginx | More complex TLS setup; Ghost official docs use Caddy |
| Reverse Proxy | Caddy | Traefik | Overkill for single-app; steeper learning curve |
| Reverse Proxy | Caddy | Nginx Proxy Manager | Requires additional MariaDB container |
| Ghost Image | `ghost:6` | Bitnami Ghost | Official image has better documentation; Bitnami adds complexity |

## What NOT to Do

1. **Do NOT use SQLite in production** - Ghost does not support it, you lose official QA coverage
2. **Do NOT run `docker` commands directly** - Use Portainer Stacks (project constraint)
3. **Do NOT skip the health check on MySQL** - Ghost will crash if it starts before MySQL is ready
4. **Do NOT expose port 2368 directly** - Always use reverse proxy for HTTPS
5. **Do NOT store passwords in compose file** - Use Portainer environment variables

## Sources

### Official Documentation (HIGH confidence)
- [Ghost Docker Installation Guide](https://docs.ghost.org/install/docker) - Official Ghost 6.0+ Docker setup
- [Ghost Docker Hub Image](https://hub.docker.com/_/ghost) - Official image tags and usage
- [MySQL Docker Hub Image](https://hub.docker.com/_/mysql) - MySQL 8.0.45 current version
- [Caddy Docker Hub Image](https://hub.docker.com/_/caddy) - Caddy 2.10.2 current version
- [Ghost GitHub Releases](https://github.com/TryGhost/Ghost/releases) - v6.16.1 released Jan 30 2026

### Community Guides (MEDIUM confidence)
- [Self-Hosting Ghost 6 on Linux with Docker Compose (2025 edition)](https://zerotohomelab.cloudboxhub.com/how-to-self-host-a-ghost-blog-with-docker-compose-on-linux-2025-edition/)
- [Installing Ghost CMS with Portainer](https://unihost.com/help/installing-ghost-cms-with-portainer/)
- [Marius Hosting - Ghost with MySQL](https://mariushosting.com/synology-install-ghost-blogging-using-mysql-as-database/)

### Migration Resources (HIGH confidence)
- [Ghost WordPress Plugin](https://wordpress.org/plugins/ghost/) - Official WordPress to Ghost export
- [Migrating from WordPress - Ghost Docs](https://docs.ghost.org/migration/wordpress) - Official migration guide

### Theme Customization (MEDIUM confidence)
- [Change Casper Theme Fonts with Google Fonts](https://aspirethemes.com/blog/casper-google-fonts) - Code injection method
- [Casper GitHub](https://github.com/TryGhost/Casper) - Source for theme modifications
