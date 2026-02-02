# Ghost Avancer Simplement

## What This Is

Blog Ghost auto-hébergé pour "Avancer Simplement", migrant depuis WordPress. Le blog sera accessible à blog.avancersimplement.com, avec un branding cohérent avec la plateforme Circle.so existante.

## Core Value

Le blog doit être **visuellement identique** à la plateforme Circle.so — même header, même sidebar, mêmes couleurs, même police. La transition entre communaute.avancersimplement.com et le blog doit être seamless.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Ghost déployé localement via Portainer (Docker)
- [ ] Thème Casper modifié avec branding Avancer Simplement
- [ ] Police Inter intégrée (comme Circle.so)
- [ ] Couleurs brand appliquées (light: #074491, dark: #3085F5)
- [ ] Toggle dark/light mode fonctionnel
- [ ] Header identique à Circle.so (64px, logo, navigation)
- [ ] Sidebar 281px avec navigation articles
- [ ] Migration des articles WordPress — import manuel prévu
- [ ] Configuration production pour blog.avancersimplement.com

### Out of Scope

- Membres/inscription — blog public simple
- Newsletter intégrée — pas de collecte email via Ghost
- Contenu payant — tout est gratuit
- Commentaires — pas prévu pour v1
- Thème from scratch — on modifie Casper

## Context

**Écosystème existant :**
- Plateforme communautaire sur Circle.so avec branding établi
- Site WordPress actuel à avancersimplement.com (va devenir statique)
- Autres projets déployés via Portainer (même infrastructure)
- Branding documenté dans `/root/yan/projets/Ghost Avancer Simplement/branding-avancer-simplement.md`

**Stack Ghost :**
- Ghost CMS (Node.js)
- Thème Handlebars (.hbs)
- SQLite ou MySQL pour les données
- Images stockées localement ou CDN

## Constraints

- **Déploiement**: Portainer uniquement — jamais de commandes `docker compose`, `docker build`, etc. directement. Tout via Git → Portainer auto-pull.
- **Branding**: Doit matcher exactement les couleurs Circle.so (light et dark mode)
- **Police**: Inter obligatoire (cohérence avec Circle.so)
- **Thème**: Partir de Casper (maintenabilité, compatibilité Ghost)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Casper comme base de thème | Officiel, documenté, compatible mises à jour Ghost | — Pending |
| Blog simple sans membres | Pas besoin de fonctionnalités avancées pour v1 | — Pending |
| Light + dark mode avec toggle | Cohérence avec Circle.so qui a les deux | — Pending |
| Déploiement local d'abord | Tester avant production | — Pending |

---
*Last updated: 2026-02-01 after initialization*
