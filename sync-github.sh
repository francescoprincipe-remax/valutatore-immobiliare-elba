#!/bin/bash

# Script per sincronizzazione automatica GitHub dopo checkpoint Manus
# Uso: ./sync-github.sh "messaggio commit opzionale"

set -e  # Exit on error

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Sincronizzazione GitHub in corso...${NC}\n"

# Vai nella directory del progetto
cd "$(dirname "$0")"

# Verifica se ci sono modifiche
if [[ -z $(git status -s) ]]; then
    echo -e "${YELLOW}✓ Nessuna modifica da sincronizzare${NC}"
    exit 0
fi

# Mostra modifiche
echo -e "${YELLOW}📝 Modifiche rilevate:${NC}"
git status -s
echo ""

# Aggiungi tutti i file
echo -e "${GREEN}➕ Aggiunta file...${NC}"
git add .

# Crea commit con messaggio personalizzato o automatico
if [ -n "$1" ]; then
    COMMIT_MSG="$1"
else
    # Messaggio automatico con timestamp
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    COMMIT_MSG="chore: sync checkpoint ${TIMESTAMP}"
fi

echo -e "${GREEN}💾 Commit: ${COMMIT_MSG}${NC}"
git commit -m "$COMMIT_MSG"

# Push su GitHub
echo -e "${GREEN}🚀 Push su GitHub...${NC}"
git push origin main

echo -e "\n${GREEN}✅ Sincronizzazione completata!${NC}"
echo -e "${GREEN}📦 Repository: https://github.com/francescoprincipe-remax/valutatore-immobiliare-elba${NC}"
