# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Blog Ghost auto-hébergé pour "Avancer Simplement". Ghost est un CMS headless open-source basé sur Node.js.

## Déploiement

**CRITIQUE : Workflow de déploiement du thème**

Portainer gère le conteneur Ghost mais **ne synchronise PAS automatiquement le thème**.
Le bind mount pointe vers `/data/compose/29/content/themes/` qui doit être synchronisé manuellement.

### Commandes de déploiement

```bash
# Déploiement complet (pull + build + sync + restart)
./scripts/deploy.sh

# Synchronisation seule (après modifications locales)
./scripts/sync-theme.sh --restart

# Synchronisation sans restart (pour vérifier les fichiers)
./scripts/sync-theme.sh
```

### Workflow recommandé

1. Modifier le thème localement
2. Builder le thème : `cd content/themes/avancer-simplement && npm run zip`
3. Commit et push vers GitHub
4. Exécuter `./scripts/deploy.sh` (ou `sync-theme.sh --restart`)

### Notes importantes

- JAMAIS de commandes `docker compose up/down` directement
- Le script `sync-theme.sh` copie les fichiers vers `/data/compose/29/content/themes/`
- Ghost doit être redémarré pour appliquer les changements de thème
- Les fichiers `assets/built/*` doivent être committés (CSS/JS compilés)

## Structure Ghost

```
content/
├── themes/           # Thèmes Handlebars (.hbs)
│   └── [nom-theme]/
│       ├── package.json
│       ├── default.hbs      # Layout principal
│       ├── index.hbs        # Page d'accueil
│       ├── post.hbs         # Article
│       ├── page.hbs         # Page statique
│       ├── tag.hbs          # Archive par tag
│       ├── author.hbs       # Page auteur
│       ├── partials/        # Composants réutilisables
│       └── assets/          # CSS, JS, images
├── data/             # Base SQLite (ghost.db)
├── images/           # Uploads
└── settings/         # Routes, redirects
```

## Commandes développement thème

```bash
# Dans le dossier du thème
npm install
npm run dev          # Watch + LiveReload (si configuré)
npm run zip          # Créer archive pour upload

# Validation thème Ghost
npx gscan .          # Vérifier compatibilité
npx gscan --v5 .     # Vérifier pour Ghost 5.x
```

## Helpers Handlebars courants

- `{{#foreach posts}}` - Boucle sur les articles
- `{{#is "home"}}` - Condition sur le contexte
- `{{content}}` - Contenu de l'article
- `{{excerpt}}` - Extrait
- `{{feature_image}}` - Image mise en avant
- `{{@site.title}}` - Titre du site
- `{{navigation}}` - Menu principal

## API Ghost (si headless)

```bash
# Content API (lecture publique)
curl "https://[domain]/ghost/api/content/posts/?key=[content-api-key]"

# Admin API (écriture, nécessite JWT)
```
