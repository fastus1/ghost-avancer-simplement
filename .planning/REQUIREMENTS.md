# Requirements: Ghost Avancer Simplement

**Defined:** 2026-02-01
**Core Value:** Le blog doit refleter visuellement l'identite de la plateforme Circle.so

## v1 Requirements

### Infrastructure

- [x] **INFRA-01**: Ghost 6.x deploye via Portainer Stack (docker-compose.yml)
- [x] **INFRA-02**: MySQL 8 configure comme base de donnees
- [x] **INFRA-03**: Volumes Docker configures correctement (persistence donnees)
- [ ] **INFRA-04**: Caddy configure comme reverse proxy avec SSL auto
- [x] **INFRA-05**: Stack testee localement avant production

### Branding

- [x] **BRAND-01**: Police Inter integree (Google Fonts ou self-hosted)
- [x] **BRAND-02**: Couleurs brand appliquees (light: #074491, dark: #3085F5)
- [x] **BRAND-03**: Toggle dark/light mode manuel fonctionnel
- [x] **BRAND-04**: Logo et favicon configures

### Theme

- [x] **THEME-01**: Fork de Casper cree et renomme
- [x] **THEME-02**: Variables CSS pour couleurs/polices
- [x] **THEME-03**: Dark mode CSS complet
- [x] **THEME-04**: Light mode CSS complet
- [x] **THEME-05**: Toggle button integre dans le header

### Content

- [ ] **CONT-01**: Articles WordPress exportes via plugin officiel
- [ ] **CONT-02**: Articles importes dans Ghost
- [ ] **CONT-03**: Nettoyage post-migration (shortcodes, formatage)
- [ ] **CONT-04**: Images migrees et fonctionnelles

### Production

- [ ] **PROD-01**: Domaine blog.avancersimplement.com configure
- [ ] **PROD-02**: HTTPS fonctionnel via Let's Encrypt
- [ ] **PROD-03**: GitOps configure (push Git -> Portainer auto-pull)
- [ ] **PROD-04**: Backup strategy en place

## v2 Requirements

### Fonctionnalites futures

- **V2-01**: Commentaires (si besoin plus tard)
- **V2-02**: Newsletter integree Ghost
- **V2-03**: Membres/inscription
- **V2-04**: Recherche avancee

## Out of Scope

| Feature | Reason |
|---------|--------|
| Membres/inscription | Blog simple public, pas besoin pour v1 |
| Newsletter | Pas de collecte email pour v1 |
| Contenu payant | Tout est gratuit |
| Commentaires | Pas prevu pour v1 |
| Theme from scratch | Fork Casper plus maintenable |
| Multi-auteur | Un seul auteur prevu |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | 1 | Complete |
| INFRA-02 | 1 | Complete |
| INFRA-03 | 1 | Complete |
| INFRA-04 | 4 | Pending |
| INFRA-05 | 1 | Complete |
| BRAND-01 | 2 | Complete |
| BRAND-02 | 2 | Complete |
| BRAND-03 | 2 | Complete |
| BRAND-04 | 2 | Complete |
| THEME-01 | 2 | Complete |
| THEME-02 | 2 | Complete |
| THEME-03 | 2 | Complete |
| THEME-04 | 2 | Complete |
| THEME-05 | 2 | Complete |
| CONT-01 | 3 | Pending |
| CONT-02 | 3 | Pending |
| CONT-03 | 3 | Pending |
| CONT-04 | 3 | Pending |
| PROD-01 | 4 | Pending |
| PROD-02 | 4 | Pending |
| PROD-03 | 4 | Pending |
| PROD-04 | 4 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

---
*Requirements defined: 2026-02-01*
*Last updated: 2026-02-02 after roadmap creation*
