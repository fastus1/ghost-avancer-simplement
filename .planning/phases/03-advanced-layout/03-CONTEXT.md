# Phase 3: Advanced Layout - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Recréer le layout Circle.so dans Ghost — header 64px identique avec navigation communauté, sidebar 281px pour navigation articles. L'objectif est une transition visuelle seamless entre communaute.avancersimplement.com et le blog.

</domain>

<decisions>
## Implementation Decisions

### Header & navigation
- Header 64px avec background #2B2E33 (dark) / adapté en light
- Logo via URL Cloudinary: https://res.cloudinary.com/dxhn08di4/image/upload/v1770034227/logo-plateforme_ibpiqf.png (360px × 36px)
- Navigation: Accueil → Nos Applications → Cours → **Blog** → Évènements → Membres → Leaderboard
- Onglet "Blog" ajouté après "Cours", style actif (pilule) quand on est sur le blog
- Liens pointent vers communaute.avancersimplement.com (externes) sauf Blog (interne)
- Mobile (< 768px): header simplifié avec logo + burger menu, sidebar disparaît

### Cohérence Circle.so
- Toggle dark/light mode conservé (Phase 2), placé dans la sidebar (en bas, discret)
- Dark mode par défaut respecte localStorage (comportement Phase 2 inchangé)
- Couleurs light mode: garder les valeurs définies en Phase 2 (global.css)
- Header et sidebar adaptent leurs couleurs selon le mode (pas toujours sombres)

### Claude's Discretion
- Structure HTML exacte du header (nav, ul, a)
- Implémentation du burger menu mobile
- Animations/transitions sur le toggle
- Styles hover/focus des liens navigation

</decisions>

<specifics>
## Specific Ideas

- Design spec complet dans `/root/yan/projets/Ghost Avancer Simplement/design-ghost.md`
- Le blog doit être "visuellement identique" à Circle.so — même header, même sidebar, mêmes couleurs
- Transition seamless: un utilisateur ne doit pas sentir qu'il quitte Circle.so pour aller sur le blog

</specifics>

<deferred>
## Deferred Ideas

- Contenu de la sidebar (liste articles, catégories, TOC) — non discuté, à définir lors du planning
- Zone principale (largeur, espacement, scroll) — non discuté, Claude's discretion

</deferred>

---

*Phase: 03-advanced-layout*
*Context gathered: 2026-02-02*
