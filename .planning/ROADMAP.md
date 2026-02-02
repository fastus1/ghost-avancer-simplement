# Roadmap: Ghost Avancer Simplement

## Overview

Ce projet migre le blog WordPress existant vers Ghost auto-heberge, avec un branding coherent avec Circle.so (couleurs, police Inter, dark/light mode toggle). Le parcours suit une logique de dependances critiques: infrastructure stable -> contenu migre -> theme personnalise -> deploiement production.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Infrastructure Foundation** - Ghost + MySQL + volumes fonctionnels localement
- [ ] **Phase 2: Theme & Branding** - Casper fork avec Inter, couleurs brand, dark/light toggle
- [ ] **Phase 3: Content Migration** - Articles WordPress migres et nettoyes
- [ ] **Phase 4: Production Deployment** - Caddy + SSL + GitOps via Portainer

## Phase Details

### Phase 1: Infrastructure Foundation
**Goal**: Ghost 6.x tourne localement avec MySQL 8 et persistence des donnees validee
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-05
**Plans:** 1 plan
**Success Criteria** (what must be TRUE):
  1. Ghost admin accessible a localhost:2368/ghost avec compte cree
  2. Un article de test persiste apres recreation du container Ghost
  3. Backup de la base MySQL fonctionne (mysqldump reussit)
  4. Stack docker-compose.yml reproductible (peut etre detruit et recree)

Plans:
- [x] 01-01-PLAN.md — Docker Compose stack with Ghost 6 + MySQL 8 + persistence validation

### Phase 2: Theme & Branding
**Goal**: Theme Casper personnalise avec branding Avancer Simplement et toggle dark/light
**Depends on**: Phase 1
**Requirements**: BRAND-01, BRAND-02, BRAND-03, BRAND-04, THEME-01, THEME-02, THEME-03, THEME-04, THEME-05
**Plans:** 4 plans
**Success Criteria** (what must be TRUE):
  1. Police Inter visible sur tous les textes du blog
  2. Couleurs brand appliquees (#074491 en light mode, #3085F5 en dark mode)
  3. Toggle dark/light mode dans le header fonctionne et persiste (localStorage)
  4. Logo et favicon visibles dans le navigateur
  5. Theme active et fonctionnel sans erreurs console

Plans:
- [ ] 02-01-PLAN.md — Fork Casper theme and self-host Inter font
- [ ] 02-02-PLAN.md — CSS custom properties for light/dark mode theming
- [ ] 02-03-PLAN.md — Toggle button with localStorage persistence
- [ ] 02-04-PLAN.md — Logo/favicon assets and final theme verification

### Phase 3: Content Migration
**Goal**: Articles WordPress (20-100) importes, nettoyes et fonctionnels dans Ghost
**Depends on**: Phase 1 (Phase 2 ideal but not blocking)
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04
**Success Criteria** (what must be TRUE):
  1. Tous les articles WordPress visibles dans Ghost admin
  2. Images des articles affichees correctement
  3. Shortcodes WordPress supprimes ou remplaces
  4. Categories converties en tags Ghost
**Plans**: TBD (1-2 plans)

Plans:
- [ ] 03-01: TBD

### Phase 4: Production Deployment
**Goal**: Blog accessible a blog.avancersimplement.com via Portainer avec HTTPS
**Depends on**: Phase 1, Phase 2, Phase 3
**Requirements**: PROD-01, PROD-02, PROD-03, PROD-04
**Success Criteria** (what must be TRUE):
  1. blog.avancersimplement.com accessible avec HTTPS valide
  2. Portainer Stack creee depuis Git repository
  3. Push Git declenche mise a jour du stack (GitOps)
  4. Backup automatise ou documente pour production
**Plans**: TBD (1-2 plans)

Plans:
- [ ] 04-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infrastructure Foundation | 1/1 | Complete | 2026-02-02 |
| 2. Theme & Branding | 0/4 | Planning complete | - |
| 3. Content Migration | 0/? | Not started | - |
| 4. Production Deployment | 0/? | Not started | - |

## Coverage Validation

**22 v1 requirements mapped:**

| Requirement | Phase | Coverage |
|-------------|-------|----------|
| INFRA-01 | 1 | Ghost 6.x deploye via Portainer Stack |
| INFRA-02 | 1 | MySQL 8 configure |
| INFRA-03 | 1 | Volumes Docker (persistence) |
| INFRA-04 | 4 | Caddy reverse proxy + SSL |
| INFRA-05 | 1 | Stack testee localement |
| BRAND-01 | 2 | Police Inter integree |
| BRAND-02 | 2 | Couleurs brand appliquees |
| BRAND-03 | 2 | Toggle dark/light mode |
| BRAND-04 | 2 | Logo et favicon |
| THEME-01 | 2 | Fork de Casper |
| THEME-02 | 2 | Variables CSS couleurs/polices |
| THEME-03 | 2 | Dark mode CSS |
| THEME-04 | 2 | Light mode CSS |
| THEME-05 | 2 | Toggle button header |
| CONT-01 | 3 | Export WordPress |
| CONT-02 | 3 | Import dans Ghost |
| CONT-03 | 3 | Nettoyage post-migration |
| CONT-04 | 3 | Images migrees |
| PROD-01 | 4 | Domaine configure |
| PROD-02 | 4 | HTTPS Let's Encrypt |
| PROD-03 | 4 | GitOps Portainer |
| PROD-04 | 4 | Backup strategy |

**Coverage: 22/22 (100%)**

---
*Roadmap created: 2026-02-02*
*Last updated: 2026-02-02*
