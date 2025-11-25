#!/bin/bash
set -e

echo "📦 Installazione Dipendenze PDF Generator"
echo "=========================================="

# Update package list
echo "📥 Aggiornamento lista pacchetti..."
sudo apt update

# Install Python 3.11
echo "🐍 Installazione Python 3.11..."
sudo apt install -y python3.11 python3.11-dev python3-pip

# Install python-pptx
echo "📚 Installazione python-pptx..."
sudo pip3 install python-pptx

# Install LibreOffice headless
echo "📄 Installazione LibreOffice (headless)..."
sudo apt install -y libreoffice-core-nogui libreoffice-writer-nogui libreoffice-impress-nogui

# Create temp directory
echo "📁 Creazione directory temporanea..."
mkdir -p server/temp
chmod 755 server/temp

echo ""
echo "✅ Installazione completata!"
echo ""
echo "🔍 Verifica installazione:"
python3.11 --version
python3.11 -c "import pptx; print('python-pptx: OK')"
libreoffice --version | head -1

echo ""
echo "📋 Esegui './scripts/check-dependencies.sh' per verificare tutte le dipendenze"
