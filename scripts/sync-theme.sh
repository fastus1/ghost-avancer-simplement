#!/bin/bash
# sync-theme.sh - Synchronise le thème Ghost vers le répertoire Portainer
# Usage: ./scripts/sync-theme.sh [--restart]

set -e

# Configuration
REPO_DIR="/home/yan/projets/Ghost Avancer Simplement"
PORTAINER_THEMES_DIR="/data/compose/29/content/themes"
THEME_NAME="avancer-simplement"
CONTAINER_NAME="ghost-avancer"

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Synchronisation du thème Ghost ===${NC}"

# 1. Vérifier que le répertoire source existe
if [ ! -d "$REPO_DIR/content/themes/$THEME_NAME" ]; then
    echo -e "${RED}Erreur: Thème source non trouvé: $REPO_DIR/content/themes/$THEME_NAME${NC}"
    exit 1
fi

# 2. Créer le répertoire destination si nécessaire
if [ ! -d "$PORTAINER_THEMES_DIR" ]; then
    echo -e "${YELLOW}Création du répertoire destination...${NC}"
    sudo mkdir -p "$PORTAINER_THEMES_DIR"
fi

# 3. Synchroniser le thème (rsync pour efficacité)
echo -e "${YELLOW}Synchronisation du thème $THEME_NAME...${NC}"
sudo rsync -av --delete \
    "$REPO_DIR/content/themes/$THEME_NAME/" \
    "$PORTAINER_THEMES_DIR/$THEME_NAME/"

echo -e "${GREEN}Thème synchronisé avec succès.${NC}"

# 4. Afficher les fichiers modifiés récemment
echo -e "${YELLOW}Fichiers récemment modifiés:${NC}"
find "$PORTAINER_THEMES_DIR/$THEME_NAME" -type f -mmin -5 2>/dev/null | head -10 || true

# 5. Redémarrer le conteneur si demandé
if [ "$1" == "--restart" ]; then
    echo -e "${YELLOW}Redémarrage du conteneur Ghost...${NC}"
    docker restart "$CONTAINER_NAME"
    echo -e "${GREEN}Conteneur redémarré.${NC}"

    # Attendre que Ghost soit prêt
    echo -e "${YELLOW}Attente que Ghost soit prêt...${NC}"
    sleep 5

    # Vérifier que Ghost répond
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:2368 | grep -q "200"; then
        echo -e "${GREEN}Ghost est opérationnel!${NC}"
    else
        echo -e "${RED}Attention: Ghost ne répond pas encore. Vérifiez les logs avec: docker logs $CONTAINER_NAME${NC}"
    fi
else
    echo -e "${YELLOW}Note: Utilisez --restart pour redémarrer Ghost et appliquer les changements.${NC}"
fi

echo -e "${GREEN}=== Synchronisation terminée ===${NC}"
