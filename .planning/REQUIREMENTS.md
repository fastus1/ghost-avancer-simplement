# Requirements: Ghost Avancer Simplement

**Defined:** 2026-02-01
**Core Value:** Le blog doit refléter visuellement l'identité de la plateforme Circle.so

## v1 Requirements

### Infrastructure

- [ ] **INFRA-01**: Ghost 6.x déployé via Portainer Stack (docker-compose.yml)
- [ ] **INFRA-02**: MySQL 8 configuré comme base de données
- [ ] **INFRA-03**: Volumes Docker configurés correctement (persistence données)
- [ ] **INFRA-04**: Caddy configuré comme reverse proxy avec SSL auto
- [ ] **INFRA-05**: Stack testée localement avant production

### Branding

- [ ] **BRAND-01**: Police Inter intégrée (Google Fonts ou self-hosted)
- [ ] **BRAND-02**: Couleurs brand appliquées (light: #074491, dark: #3085F5)
- [ ] **BRAND-03**: Toggle dark/light mode manuel fonctionnel
- [ ] **BRAND-04**: Logo et favicon configurés

### Theme

- [ ] **THEME-01**: Fork de Casper créé et renommé
- [ ] **THEME-02**: Variables CSS pour couleurs/polices
- [ ] **THEME-03**: Dark mode CSS complet
- [ ] **THEME-04**: Light mode CSS complet
- [ ] **THEME-05**: Toggle button intégré dans le header

### Content

- [ ] **CONT-01**: Articles WordPress exportés via plugin officiel
- [ ] **CONT-02**: Articles importés dans Ghost
- [ ] **CONT-03**: Nettoyage post-migration (shortcodes, formatage)
- [ ] **CONT-04**: Images migrées et fonctionnelles

### Production

- [ ] **PROD-01**: Domaine blog.avancersimplement.com configuré
- [ ] **PROD-02**: HTTPS fonctionnel via Let's Encrypt
- [ ] **PROD-03**: GitOps configuré (push Git → Portainer auto-pull)
- [ ] **PROD-04**: Backup strategy en place

## v2 Requirements

### Fonctionnalités futures

- **V2-01**: Commentaires (si besoin plus tard)
- **V2-02**: Newsletter intégrée Ghost
- **V2-03**: Membres/inscription
- **V2-04**: Recherche avancée

## Out of Scope

| Feature | Reason |
|---------|--------|
| Membres/inscription | Blog simple public, pas besoin pour v1 |
| Newsletter | Pas de collecte email pour v1 |
| Contenu payant | Tout est gratuit |
| Commentaires | Pas prévu pour v1 |
| Thème from scratch | Fork Casper plus maintenable |
| Multi-auteur | Un seul auteur prévu |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | TBD | Pending |
| INFRA-02 | TBD | Pending |
| INFRA-03 | TBD | Pending |
| INFRA-04 | TBD | Pending |
| INFRA-05 | TBD | Pending |
| BRAND-01 | TBD | Pending |
| BRAND-02 | TBD | Pending |
| BRAND-03 | TBD | Pending |
| BRAND-04 | TBD | Pending |
| THEME-01 | TBD | Pending |
| THEME-02 | TBD | Pending |
| THEME-03 | TBD | Pending |
| THEME-04 | TBD | Pending |
| THEME-05 | TBD | Pending |
| CONT-01 | TBD | Pending |
| CONT-02 | TBD | Pending |
| CONT-03 | TBD | Pending |
| CONT-04 | TBD | Pending |
| PROD-01 | TBD | Pending |
| PROD-02 | TBD | Pending |
| PROD-03 | TBD | Pending |
| PROD-04 | TBD | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 0
- Unmapped: 22 (pending roadmap)

---
*Requirements defined: 2026-02-01*
*Last updated: 2026-02-01 after initial definition*
