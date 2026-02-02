# Architecture Patterns: Self-Hosted Ghost Blog

**Domain:** Self-hosted Ghost CMS blog with Docker/Portainer deployment
**Researched:** 2026-02-01
**Confidence:** HIGH (verified via official Ghost documentation)

## Recommended Architecture

```
                                    INTERNET
                                        |
                                        v
                    +-------------------+-------------------+
                    |        REVERSE PROXY (Caddy/Nginx)   |
                    |   - SSL termination (Let's Encrypt)  |
                    |   - X-Forwarded-* headers            |
                    +-------------------+-------------------+
                                        |
                                        v
                    +-------------------+-------------------+
                    |              GHOST (Node.js)          |
                    |   - Port 2368 (internal)              |
                    |   - Admin panel /ghost/               |
                    |   - Content API                       |
                    +-------------------+-------------------+
                                        |
                    +-------------------+-------------------+
                    |           MySQL 8 Database            |
                    |   - Posts, pages, settings            |
                    |   - Users, tags, metadata             |
                    +-------------------+-------------------+

                    +-------------------+-------------------+
                    |         Persistent Volumes            |
                    |   - content/themes/                   |
                    |   - content/images/                   |
                    |   - content/data/                     |
                    +-------------------+-------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With | Port |
|-----------|---------------|-------------------|------|
| **Reverse Proxy** | SSL termination, request routing, header injection | Ghost (internal) | 80/443 external, 2368 internal |
| **Ghost** | CMS engine, admin panel, content rendering, API | Database, volumes | 2368 |
| **MySQL 8** | Data persistence (posts, settings, users) | Ghost | 3306 |
| **Theme Volume** | Theme files (Handlebars templates, CSS, JS) | Ghost reads at startup | N/A |
| **Content Volume** | Uploaded images, media | Ghost reads/writes | N/A |
| **Data Volume** | SQLite backup (if used), logs | Ghost | N/A |

### Data Flow

```
CONTENT CREATION (Admin Panel):
  Author -> /ghost/ admin panel
         -> Ghost Admin API
         -> MySQL (posts table)
         -> Content saved

CONTENT DELIVERY (Public):
  Visitor -> Reverse proxy (HTTPS)
          -> Ghost (2368)
          -> MySQL (fetch content)
          -> Theme templates (render HTML)
          -> Response to visitor

THEME RENDERING:
  Ghost reads theme files from /var/lib/ghost/content/themes/[theme-name]/
  Handlebars templates + data from DB = rendered HTML
  CSS/JS served from /assets/built/
```

## Portainer-Compatible Deployment Architecture

**Critical Constraint:** No direct docker commands. All deployment via Git -> Portainer.

### Repository Structure for Portainer

```
ghost-avancer-simplement/
├── docker-compose.yml          # Stack definition for Portainer
├── .env.example                 # Template for environment variables
├── content/
│   └── themes/
│       └── casper-avancer/     # Custom theme (forked Casper)
│           ├── package.json
│           ├── default.hbs
│           ├── index.hbs
│           ├── post.hbs
│           ├── assets/
│           │   └── css/
│           │       └── custom.css
│           └── partials/
├── config/
│   └── caddy/
│       └── Caddyfile           # Reverse proxy config (optional)
└── .gitignore                   # Exclude .env, node_modules
```

### Portainer Stack Configuration Flow

```
1. Git repository with docker-compose.yml
          |
          v
2. Portainer "Stack from Git Repository"
   - Repo URL: https://github.com/user/ghost-avancer-simplement
   - Branch: refs/heads/main
   - Compose path: docker-compose.yml
          |
          v
3. Environment variables (in Portainer UI or .env)
   - DOMAIN, ADMIN_DOMAIN
   - DATABASE_PASSWORD
   - url (Ghost config)
          |
          v
4. GitOps Auto-Update Options:
   - Polling: Check every X minutes
   - Webhook: GitHub Action triggers Portainer URL
          |
          v
5. Stack deployed, Ghost running
```

### Recommended docker-compose.yml Structure

```yaml
version: "3.8"

services:
  ghost:
    image: ghost:5-alpine
    restart: always
    depends_on:
      - db
    environment:
      url: ${GHOST_URL}
      database__client: mysql
      database__connection__host: db
      database__connection__user: ghost
      database__connection__password: ${DB_PASSWORD}
      database__connection__database: ghost
    volumes:
      - ghost_content:/var/lib/ghost/content
      - ./content/themes/casper-avancer:/var/lib/ghost/content/themes/casper-avancer:ro
    networks:
      - ghost_network
    # Port exposed to reverse proxy only (not public)
    expose:
      - "2368"

  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ghost
      MYSQL_USER: ghost
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ghost_db:/var/lib/mysql
    networks:
      - ghost_network

  # Option A: Caddy (simpler, auto-SSL)
  caddy:
    image: caddy:2-alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - ghost_network
    depends_on:
      - ghost

volumes:
  ghost_content:
  ghost_db:
  caddy_data:
  caddy_config:

networks:
  ghost_network:
    driver: bridge
```

## Patterns to Follow

### Pattern 1: Theme as Volume Mount

**What:** Mount custom theme as a read-only bind mount from git repository
**When:** Always for custom themes in Portainer deployments
**Why:** Theme updates via git push without rebuilding Ghost container

```yaml
volumes:
  # Theme from repo, mounted read-only
  - ./content/themes/casper-avancer:/var/lib/ghost/content/themes/casper-avancer:ro
```

**Workflow:**
1. Edit theme files locally
2. Git commit + push
3. Portainer auto-pulls (webhook or polling)
4. Stack redeploys with updated theme
5. Ghost activates theme from admin panel (once, initially)

### Pattern 2: Environment-Based Configuration

**What:** All Ghost config via environment variables, not config files
**When:** Docker/Portainer deployments
**Why:** docker-compose.yml stays in git, secrets stay in Portainer

```yaml
environment:
  url: ${GHOST_URL}                           # From Portainer env
  database__client: mysql
  database__connection__host: db              # Docker service name
  database__connection__user: ghost
  database__connection__password: ${DB_PASSWORD}  # From Portainer env
  database__connection__database: ghost
```

**Environment variables in Portainer (not in git):**
- `GHOST_URL=https://blog.avancersimplement.com`
- `DB_PASSWORD=secure_password_here`
- `DB_ROOT_PASSWORD=secure_root_password`

### Pattern 3: Reverse Proxy with Proper Headers

**What:** Configure X-Forwarded headers for Ghost behind proxy
**When:** Always when using SSL termination at proxy level
**Why:** Prevents infinite redirect loops, enables correct URL generation

**Caddy example:**
```
blog.avancersimplement.com {
    reverse_proxy ghost:2368 {
        header_up X-Forwarded-Proto https
        header_up X-Forwarded-Host {host}
        header_up X-Real-IP {remote}
    }
}
```

**Nginx example:**
```nginx
location / {
    proxy_pass http://ghost:2368;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Pattern 4: Casper Theme Fork Strategy

**What:** Fork Casper, rename package, maintain upstream connection
**When:** Customizing the default theme
**Why:** Enables receiving upstream updates while keeping customizations

```bash
# Fork on GitHub
# Clone locally
git clone https://github.com/YOUR-USER/casper-avancer.git

# Add upstream for updates
git remote add upstream https://github.com/TryGhost/Casper.git

# Rename in package.json
# "name": "casper-avancer"

# Periodically sync upstream
git fetch upstream
git merge upstream/main
# Resolve conflicts in custom files
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Direct Docker Commands

**What:** Running `docker compose up`, `docker build`, etc. on server
**Why bad:** Breaks Portainer's stack management, causes state drift, complicates updates
**Instead:** All changes through git -> Portainer auto-pull workflow

### Anti-Pattern 2: Embedding Secrets in docker-compose.yml

**What:** Putting passwords and API keys directly in compose file
**Why bad:** Secrets end up in git repository
**Instead:** Use `${VARIABLE}` syntax, set actual values in Portainer UI

### Anti-Pattern 3: SQLite in Production

**What:** Using Ghost's default SQLite database for production blog
**Why bad:** Not designed for concurrent access, no replication, harder backups
**Instead:** Always use MySQL 8 for production Ghost deployments

### Anti-Pattern 4: Modifying Theme Inside Running Container

**What:** Using `docker exec` to edit theme files
**Why bad:** Changes lost on container recreation, not version controlled
**Instead:** Edit in git repo, push, let Portainer redeploy

### Anti-Pattern 5: Exposing Ghost Port Directly

**What:** Publishing port 2368 to the internet
**Why bad:** No SSL, exposes internal port, bypasses security headers
**Instead:** Use reverse proxy (Caddy/Nginx) with SSL termination

### Anti-Pattern 6: Ignoring X-Forwarded Headers

**What:** Not configuring proxy headers when Ghost is behind reverse proxy
**Why bad:** Causes infinite redirect loops when accessing via HTTPS
**Instead:** Always set `X-Forwarded-Proto: https` in proxy configuration

## Build Order for Roadmap

Based on component dependencies, the recommended build order:

```
PHASE 1: Infrastructure Foundation
├── 1.1 docker-compose.yml skeleton
├── 1.2 MySQL service definition
├── 1.3 Ghost service definition (basic)
├── 1.4 Network and volume configuration
└── 1.5 .env.example template

    Dependency: Nothing (greenfield)
    Output: Working Ghost with default Casper theme locally

PHASE 2: Theme Development
├── 2.1 Fork Casper theme
├── 2.2 Rename package (casper-avancer)
├── 2.3 Configure volume mount in compose
├── 2.4 Apply branding (colors, fonts)
├── 2.5 Implement dark/light toggle
└── 2.6 Test theme activation

    Dependency: Phase 1 complete (Ghost running)
    Output: Custom branded theme working

PHASE 3: Reverse Proxy & SSL
├── 3.1 Add Caddy/Nginx service
├── 3.2 Configure domain routing
├── 3.3 Set up Let's Encrypt SSL
├── 3.4 Configure X-Forwarded headers
└── 3.5 Test HTTPS access

    Dependency: Phase 1 (Ghost to proxy to)
    Can run in parallel with Phase 2

PHASE 4: Portainer Integration
├── 4.1 Push to GitHub repository
├── 4.2 Create Stack in Portainer from Git
├── 4.3 Configure environment variables
├── 4.4 Set up GitOps auto-update (webhook/polling)
└── 4.5 Test push-to-deploy workflow

    Dependency: Phases 1-3 complete
    Output: Full CI/CD pipeline

PHASE 5: Production Configuration
├── 5.1 Configure production domain
├── 5.2 DNS setup (blog.avancersimplement.com)
├── 5.3 Production environment variables
├── 5.4 Backup strategy for MySQL volume
└── 5.5 Monitoring/health checks

    Dependency: Phase 4 complete
    Output: Production-ready deployment
```

### Critical Path

```
docker-compose.yml -> MySQL -> Ghost -> Theme Mount -> Reverse Proxy -> Portainer Stack -> Production
```

**Parallelization opportunities:**
- Theme development (Phase 2) can start after Phase 1.3 (Ghost running)
- Reverse proxy (Phase 3) can develop in parallel with theme
- Portainer integration waits for both theme and proxy

## Alternative Architectures Considered

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **Caddy** (recommended) | Auto SSL, simple config, small image | Less documentation than Nginx | Use for this project |
| **Nginx** | Well documented, widely used | Manual SSL cert renewal, more config | Good alternative if Caddy issues |
| **Traefik** | Dynamic discovery, dashboard | Overkill for single service | Skip |
| **Ghost official Docker tooling** | Officially supported, includes ActivityPub | Newer, less community examples | Consider for Ghost 6.x features |
| **No reverse proxy** | Simpler stack | No SSL, exposes internal port | Never in production |

## Scalability Considerations

| Concern | At 100 visitors/day | At 10K visitors/day | At 100K visitors/day |
|---------|---------------------|---------------------|----------------------|
| Database | MySQL single instance fine | MySQL with read replicas | MySQL cluster or managed DB |
| Ghost | Single container fine | Single container + caching | Multiple Ghost containers + load balancer |
| Images | Local volume fine | Consider CDN | Definitely CDN (Cloudflare, etc.) |
| Caching | Not needed | Add Varnish/Redis | Required, full CDN |
| SSL | Caddy Let's Encrypt fine | Same | Cloudflare or similar |

**For "Avancer Simplement" blog:** Single-instance architecture (as documented above) is appropriate. Blog traffic unlikely to exceed 10K/day initially. Optimize later if needed.

## Sources

**HIGH Confidence (Official Documentation):**
- [Ghost Docker Installation Docs](https://docs.ghost.org/install/docker) - Official architecture guide
- [Ghost Admin API](https://docs.ghost.org/admin-api) - Content flow documentation
- [Portainer Stacks Documentation](https://docs.portainer.io/user/docker/stacks/add) - Git-based deployment
- [Portainer Webhooks](https://docs.portainer.io/user/docker/services/webhooks) - Auto-update configuration
- [Ghost Casper Theme](https://github.com/TryGhost/Casper) - Official theme repository
- [Ghost Official Docker Image](https://hub.docker.com/_/ghost) - Container configuration

**MEDIUM Confidence (Verified Community Patterns):**
- [Ghost Proxy Configuration](https://ghost.org/docs/faq/proxying-https-infinite-loops/) - X-Forwarded header setup
- [Portainer GitOps Guide](https://tobiasfenster.io/use-portainer-to-deploy-and-update-docker-container-stacks-from-a-git-repo) - Git webhook workflow
- [Ghost Theme Forum](https://forum.ghost.org/t/dark-mode-light-mode-toggle-in-default-source-theme/46654) - Dark mode implementation patterns
- [Alto Theme](https://github.com/TryGhost/Alto) - Official light/dark mode theme reference

**LOW Confidence (Community Examples - verify before using):**
- Various blog posts on Ghost + Docker setups - patterns verified against official docs
