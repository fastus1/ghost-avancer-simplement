# Phase 1: Infrastructure Foundation - Research

**Researched:** 2026-02-02
**Domain:** Docker containerization, Ghost 6.x CMS, MySQL 8, Portainer deployment
**Confidence:** HIGH

## Summary

Phase 1 focuses on deploying Ghost 6.x with MySQL 8 in a Docker Compose stack that can be managed via Portainer. The research confirms that Ghost officially supports Docker Compose deployments as of Ghost 6.0, with MySQL 8 as the only production-supported database. SQLite is strictly for development only.

The official Ghost Docker repository (TryGhost/ghost-docker) provides the canonical reference architecture: Ghost, MySQL 8, and Caddy. However, since Caddy is deferred to Phase 4, this phase will establish Ghost + MySQL only, with Ghost exposed on localhost:2368 for local testing.

**Primary recommendation:** Use the official `ghost:6-alpine` image with `mysql:8.0` image, named Docker volumes for persistence, and a proper MySQL healthcheck to ensure Ghost waits for database readiness.

## Standard Stack

The established tools for this phase:

### Core

| Component | Version/Tag | Purpose | Why Standard |
|-----------|-------------|---------|--------------|
| Ghost | `ghost:6-alpine` | Blog CMS | Official Ghost Docker image, Alpine variant smaller |
| MySQL | `mysql:8.0` (or `mysql:8.0.44`) | Database | Only officially supported production database for Ghost 6.x |
| Docker Compose | 3.8+ | Orchestration | Native Portainer integration |

### Supporting

| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| openssl | system | Password generation | Generate DB credentials before first deployment |
| mysqldump | via MySQL container | Database backup | Backup verification in success criteria |
| Portainer | 2.x | Stack management | Production deployment (local testing via docker compose) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MySQL 8 | MariaDB | NOT RECOMMENDED - Ghost 6 ActivityPub requires MySQL-specific features |
| MySQL 8 | SQLite | ONLY FOR DEV - Not supported in production, loses data easily |
| ghost:6-alpine | ghost:6 | Alpine is smaller (300MB vs 900MB), same functionality |
| Named volumes | Bind mounts | Named volumes are more portable, bind mounts easier for theme dev |

**Installation (local dev):**
```bash
# No npm install needed - Docker handles everything
# Generate passwords before first deployment:
openssl rand -hex 32  # For MYSQL_ROOT_PASSWORD
openssl rand -hex 32  # For GHOST_DB_PASSWORD
```

## Architecture Patterns

### Recommended Project Structure

```
ghost-avancer-simplement/
├── docker-compose.yml          # Stack definition (Portainer-compatible)
├── docker-compose.local.yml    # Local dev overrides (optional)
├── .env.example                 # Template showing required variables
├── .env                         # Actual secrets (gitignored)
├── .gitignore                   # Exclude .env, volumes data
└── content/                     # Theme files (Phase 2)
    └── themes/
        └── casper-avancer/
```

### Pattern 1: MySQL Healthcheck with Actual Query

**What:** Use a real MySQL query instead of `mysqladmin ping` for the healthcheck.
**When to use:** Always in production. The `mysqladmin ping` returns success even when MySQL rejects connections with "Access denied".
**Why:** Prevents Ghost from starting before MySQL can actually accept authenticated connections.

```yaml
# Source: https://dev.to/samuelko123/health-check-for-mysql-in-a-docker-container-3m5a
# Verified against: https://www.strangebuzz.com/en/snippets/a-better-docker-mysql-heathcheck
mysql:
  image: mysql:8.0
  healthcheck:
    test: ["CMD", "mysql", "-u", "ghost", "-p${GHOST_DB_PASSWORD}", "-e", "SELECT 1"]
    interval: 10s
    timeout: 5s
    retries: 10
    start_period: 30s
```

### Pattern 2: Service Dependency with Health Condition

**What:** Ghost waits for MySQL to be healthy before starting.
**When to use:** Always - prevents startup race condition.

```yaml
# Source: https://docs.docker.com/compose/compose-file/05-services/#depends_on
ghost:
  depends_on:
    mysql:
      condition: service_healthy
```

### Pattern 3: Environment Variable Configuration

**What:** All Ghost configuration via environment variables, secrets via Portainer.
**When to use:** Docker/Portainer deployments (not config files).
**Why:** Compose file stays in git, actual values stay in Portainer UI.

```yaml
# Source: https://hub.docker.com/_/ghost (official docs)
environment:
  url: http://localhost:2368          # Local testing URL
  database__client: mysql
  database__connection__host: mysql   # Docker service name
  database__connection__user: ghost
  database__connection__password: ${GHOST_DB_PASSWORD}
  database__connection__database: ghost
  NODE_ENV: production                # CRITICAL - always set explicitly
```

### Pattern 4: Named Volume Persistence

**What:** Use named Docker volumes for Ghost content and MySQL data.
**When to use:** Always for production data.
**Why:** Survives container recreation, portable, managed by Docker.

```yaml
# Source: https://hub.docker.com/_/ghost (official docs)
volumes:
  ghost_content:    # For /var/lib/ghost/content
  mysql_data:       # For /var/lib/mysql
```

### Anti-Patterns to Avoid

- **Using SQLite in "production" mode:** Ghost won't start with `NODE_ENV=production` and SQLite - it requires MySQL.
- **Mounting to `/var/lib/ghost` instead of `/var/lib/ghost/content`:** Wrong path causes data loss.
- **Changing database credentials after initialization:** Breaks Ghost's connection; MySQL doesn't auto-update credentials.
- **Running Ghost before MySQL is healthy:** Causes crash loops.
- **Storing passwords in docker-compose.yml:** Use `${VARIABLE}` syntax with Portainer environment variables.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Database healthcheck | Custom wait script | MySQL container healthcheck | Built-in, reliable, standard |
| Password generation | Manual passwords | `openssl rand -hex 32` | Cryptographically secure |
| Service orchestration | Manual container management | Docker Compose with depends_on | Handles startup order automatically |
| SSL termination | Ghost config | Reverse proxy (Phase 4) | Ghost expects proxy for HTTPS |
| Database backup | Custom export scripts | `mysqldump` via docker exec | Standard, well-tested |

**Key insight:** Ghost's Docker ecosystem is mature. The official TryGhost/ghost-docker repo provides reference implementations. Deviating from these patterns creates maintenance burden.

## Common Pitfalls

### Pitfall 1: Volume Mount Data Loss

**What goes wrong:** All content disappears when recreating Ghost container.
**Why it happens:** Mounting to `/var/lib/ghost` instead of `/var/lib/ghost/content`.
**How to avoid:** Always use `/var/lib/ghost/content` as the mount target.
**Warning signs:** After restart, Ghost shows setup wizard instead of your site.

### Pitfall 2: Database Credential Mismatch

**What goes wrong:** Ghost fails with "Access denied" after modifying environment variables.
**Why it happens:** `DATABASE_xxx` variables configure Ghost's connection, not MySQL's actual credentials. Changing them post-init creates mismatch.
**How to avoid:** Generate credentials ONCE before first deployment, never change them.
**Warning signs:** Container restart loop with MySQL connection errors.

### Pitfall 3: Missing NODE_ENV=production

**What goes wrong:** Ghost runs in development mode with SQLite, unsuitable for persistence testing.
**Why it happens:** Default is development mode; easy to forget this variable.
**How to avoid:** Always explicitly set `NODE_ENV=production` in docker-compose.
**Warning signs:** Ghost logs show "Running in development mode", no MySQL connection.

### Pitfall 4: mysqladmin ping False Positive

**What goes wrong:** Ghost starts before MySQL is actually ready, then crashes.
**Why it happens:** `mysqladmin ping` returns success even when connection is refused.
**How to avoid:** Use actual SQL query in healthcheck: `mysql -u user -p password -e "SELECT 1"`.
**Warning signs:** Intermittent Ghost crashes on startup, especially on slow systems.

### Pitfall 5: URL Configuration Mismatch (Local Testing)

**What goes wrong:** Ghost redirects to localhost:2368 regardless of how you access it.
**Why it happens:** Ghost `url` environment variable doesn't match access URL.
**How to avoid:** For local testing, set `url: http://localhost:2368` and access via same URL.
**Warning signs:** Links in admin panel go to wrong URL.

## Code Examples

Verified patterns from official sources:

### Complete docker-compose.yml for Phase 1 (Local Testing)

```yaml
# Source: Adapted from https://github.com/TryGhost/ghost-docker/blob/main/compose.yml
# and https://hub.docker.com/_/ghost

version: "3.8"

services:
  ghost:
    image: ghost:6-alpine
    container_name: ghost-avancer
    restart: unless-stopped
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      url: http://localhost:2368
      database__client: mysql
      database__connection__host: mysql
      database__connection__user: ghost
      database__connection__password: ${GHOST_DB_PASSWORD}
      database__connection__database: ghost
      NODE_ENV: production
    volumes:
      - ghost_content:/var/lib/ghost/content
    ports:
      - "2368:2368"
    networks:
      - ghost-network

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
      test: ["CMD", "mysql", "-ughost", "-p${GHOST_DB_PASSWORD}", "-e", "SELECT 1"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s

volumes:
  ghost_content:
  mysql_data:

networks:
  ghost-network:
    driver: bridge
```

### .env.example Template

```bash
# Source: https://docs.ghost.org/install/docker

# MySQL Root Password (generate with: openssl rand -hex 32)
MYSQL_ROOT_PASSWORD=

# Ghost Database User Password (generate with: openssl rand -hex 32)
GHOST_DB_PASSWORD=
```

### MySQL Backup Command

```bash
# Source: https://gist.github.com/spalladino/6d981f7b33f6e0afe6bb
# Run from host machine

docker exec ghost-mysql mysqldump -u ghost -p"${GHOST_DB_PASSWORD}" ghost > ghost_backup_$(date +%Y%m%d).sql
```

### MySQL Restore Command

```bash
# Source: https://gist.github.com/spalladino/6d981f7b33f6e0afe6bb

cat ghost_backup_YYYYMMDD.sql | docker exec -i ghost-mysql mysql -u ghost -p"${GHOST_DB_PASSWORD}" ghost
```

### Volume Persistence Test Script

```bash
#!/bin/bash
# Test that data persists across container recreation

# 1. Start stack
docker compose up -d
sleep 30  # Wait for Ghost to initialize

# 2. Create test content (manual step - create post in admin)
echo "Go to http://localhost:2368/ghost and create a test post"
read -p "Press Enter when done..."

# 3. Destroy and recreate containers (keep volumes)
docker compose down
docker compose up -d
sleep 30

# 4. Verify content exists
echo "Go to http://localhost:2368 and verify your test post is still there"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Ghost 5 + optional MySQL | Ghost 6 requires MySQL for production | Ghost 6.0 (2024) | SQLite no longer viable for production |
| mysql:5.7 | mysql:8.0 | Ghost 5.x+ | Required for Ghost 6 ActivityPub features |
| Manual SSL config | Caddy auto-SSL | Ghost Docker official tooling | Simpler HTTPS setup (Phase 4) |
| Ghost-CLI in Docker | Environment variables only | Always | Ghost-CLI doesn't work in containers |
| mysqladmin ping healthcheck | Actual SQL query healthcheck | Community best practice | Avoids false positive health status |

**Deprecated/outdated:**
- **SQLite for production:** Ghost explicitly does not support this; QA testing only targets MySQL.
- **MariaDB:** While it worked in Ghost 5, Ghost 6 ActivityPub uses MySQL-specific features.
- **Ghost-CLI commands in Docker:** Use environment variables; CLI designed for traditional server installs.

## Open Questions

Things that couldn't be fully resolved:

1. **Ghost 6 minor version pinning**
   - What we know: `ghost:6-alpine` gets automatic patch updates
   - What's unclear: Whether to pin `ghost:6.16-alpine` for stability
   - Recommendation: Use `ghost:6-alpine` initially, pin after first successful deployment

2. **Local testing without reverse proxy**
   - What we know: Ghost works at localhost:2368 without SSL
   - What's unclear: Some features may behave differently without HTTPS
   - Recommendation: Test core functionality first, add proxy in Phase 4

3. **Portainer-specific volume management**
   - What we know: Portainer can manage named volumes
   - What's unclear: Best practice for "external" volumes in Portainer
   - Recommendation: Let docker-compose create volumes, don't mark as external initially

## Sources

### Primary (HIGH confidence)
- [Ghost Official Docker Hub Image](https://hub.docker.com/_/ghost) - Environment variables, volume paths
- [TryGhost/ghost-docker Repository](https://github.com/TryGhost/ghost-docker/blob/main/compose.yml) - Official compose reference
- [Ghost Docker Installation Docs](https://docs.ghost.org/install/docker) - Official setup guide
- [Docker Compose depends_on Documentation](https://docs.docker.com/compose/compose-file/05-services/#depends_on) - Service health condition
- [MySQL Docker Hub Image](https://hub.docker.com/_/mysql) - MySQL 8.0 configuration

### Secondary (MEDIUM confidence)
- [Self-Hosting Ghost 6 on Linux (2025 edition)](https://zerotohomelab.cloudboxhub.com/how-to-self-host-a-ghost-blog-with-docker-compose-on-linux-2025-edition/) - Community guide verified against official
- [A Better Docker MySQL Healthcheck](https://www.strangebuzz.com/en/snippets/a-better-docker-mysql-heathcheck) - Healthcheck best practices
- [DEV.to MySQL Healthcheck Guide](https://dev.to/samuelko123/health-check-for-mysql-in-a-docker-container-3m5a) - Why not to use mysqladmin ping
- [Portainer Environment Variables Docs](https://docs.portainer.io/faqs/troubleshooting/stacks-deployments-and-updates/environment-variable-management-in-docker-.env-vs.-stack.env) - Portainer-specific patterns

### Tertiary (LOW confidence - verify before using)
- [MySQL Backup from Docker Gist](https://gist.github.com/spalladino/6d981f7b33f6e0afe6bb) - Backup/restore commands
- [Ghost Forum Docker Discussions](https://forum.ghost.org/c/self-hosting) - Community troubleshooting

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Ghost documentation and Docker Hub explicit about requirements
- Architecture: HIGH - Patterns verified in official TryGhost/ghost-docker repository
- Pitfalls: HIGH - Documented in official GitHub issues and verified community sources

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (30 days - Ghost 6.x is stable)
