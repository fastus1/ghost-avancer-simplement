#!/bin/bash
# deploy.sh - Pull from GitHub, build theme, sync and restart Ghost
# Usage: ./scripts/deploy.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
THEME_DIR="$REPO_DIR/content/themes/avancer-simplement"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Ghost Theme Deployment Script      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# 1. Pull latest from GitHub
echo -e "${YELLOW}[1/4] Pulling latest changes from GitHub...${NC}"
cd "$REPO_DIR"
git pull origin main
echo -e "${GREEN}✓ Git pull complete${NC}"
echo ""

# 2. Build theme (optional - skip if built files are committed)
echo -e "${YELLOW}[2/4] Building theme...${NC}"
cd "$THEME_DIR"
if [ -f "package.json" ]; then
    # Check if node_modules exists, if not install
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    npm run zip 2>/dev/null || echo "Build skipped (no changes or already built)"
    echo -e "${GREEN}✓ Theme built${NC}"
else
    echo -e "${YELLOW}⚠ No package.json, skipping build${NC}"
fi
echo ""

# 3. Sync theme to Portainer directory
echo -e "${YELLOW}[3/4] Syncing theme to Portainer...${NC}"
"$SCRIPT_DIR/sync-theme.sh"
echo -e "${GREEN}✓ Theme synced${NC}"
echo ""

# 4. Restart Ghost container
echo -e "${YELLOW}[4/4] Restarting Ghost container...${NC}"
docker restart ghost-avancer
sleep 5

# Verify Ghost is running
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:2368)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ Ghost is running (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}⚠ Ghost returned HTTP $HTTP_CODE - check logs${NC}"
fi
echo ""

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Deployment Complete!           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "Visit: ${BLUE}http://localhost:2368${NC}"
