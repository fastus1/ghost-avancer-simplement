# Plan 01-01 Summary: Docker Compose stack with Ghost 6 + MySQL 8

## Outcome: SUCCESS

**Completed:** 2026-02-02
**Duration:** ~45 minutes (including Portainer setup learning)

## What Was Built

- **docker-compose.yml** — Ghost 6-alpine + MySQL 8.0 stack with proper healthcheck
- **.env.example** — Template for required environment variables
- **.gitignore** — Excludes .env from version control
- **GitHub repo** — https://github.com/fastus1/ghost-avancer-simplement

## Deployment Method

Stack deployed via **Portainer** (GitOps):
- Repository linked to Portainer stack
- Environment variables (MYSQL_ROOT_PASSWORD, GHOST_DB_PASSWORD) set in Portainer UI
- No local docker compose commands — all management through Portainer

## Verification Results

| Criteria | Status |
|----------|--------|
| Ghost admin accessible at localhost:2368/ghost | PASS |
| Admin account created via setup wizard | PASS |
| Test article persists after container stop/start | PASS |
| mysqldump exports database successfully | PASS |

## Key Decisions

- **Healthcheck syntax**: Changed from `CMD` to `CMD-SHELL` for proper environment variable interpolation in Portainer context
- **Portainer-first**: All deployment operations through Portainer UI, not CLI

## Commits

| Hash | Description |
|------|-------------|
| 5139344 | feat(01-01): create Ghost + MySQL Docker Compose stack |
| 68e9af0 | fix(01-01): use CMD-SHELL for MySQL healthcheck interpolation |

## Issues Encountered

1. **Healthcheck failure** — Initial `${GHOST_DB_PASSWORD}` syntax didn't interpolate in CMD array. Fixed by using CMD-SHELL with `$$MYSQL_PASSWORD`.

## Files Modified

- docker-compose.yml (created)
- .env.example (created)
- .gitignore (updated)
