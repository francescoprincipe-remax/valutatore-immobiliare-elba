# 📦 Requisiti di Deployment - Valutatore Immobiliare Elba

**Data**: 24 Novembre 2025  
**Versione**: 1.0.0

---

## ⚠️ IMPORTANTE: Dipendenze per Generazione PDF

Il sistema di generazione PDF richiede le seguenti dipendenze installate sul server di produzione:

---

## 🐍 Python 3.11

### Verifica Installazione
```bash
python3.11 --version
```

### Installazione (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y python3.11 python3.11-dev
```

---

## 📚 Modulo Python: python-pptx

### Verifica Installazione
```bash
python3.11 -c "import pptx; print('OK')"
```

### Installazione
```bash
sudo pip3 install python-pptx
```

**OPPURE** (se pip3 non funziona):
```bash
sudo python3.11 -m pip install python-pptx
```

---

## 📄 LibreOffice (per conversione PPTX → PDF)

### Verifica Installazione
```bash
libreoffice --version
```

### Installazione (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y libreoffice-core libreoffice-writer libreoffice-impress
```

**Installazione Headless** (senza GUI, consigliato per server):
```bash
sudo apt install -y libreoffice-core-nogui libreoffice-writer-nogui libreoffice-impress-nogui
```

---

## ✅ Script di Verifica Completa

Esegui questo script per verificare che tutte le dipendenze siano installate:

```bash
#!/bin/bash

echo "🔍 Verifica Dipendenze PDF Generator"
echo "======================================"

# 1. Python 3.11
echo -n "Python 3.11: "
if python3.11 --version &>/dev/null; then
    echo "✅ $(python3.11 --version)"
else
    echo "❌ NON INSTALLATO"
fi

# 2. python-pptx
echo -n "python-pptx: "
if python3.11 -c "import pptx" &>/dev/null; then
    echo "✅ INSTALLATO"
else
    echo "❌ NON INSTALLATO"
fi

# 3. LibreOffice
echo -n "LibreOffice: "
if libreoffice --version &>/dev/null; then
    echo "✅ $(libreoffice --version | head -1)"
else
    echo "❌ NON INSTALLATO"
fi

echo ""
echo "======================================"
```

Salva come `check-dependencies.sh`, rendi eseguibile e lancia:
```bash
chmod +x check-dependencies.sh
./check-dependencies.sh
```

---

## 🚀 Script di Installazione Automatica

```bash
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

echo ""
echo "✅ Installazione completata!"
echo ""
echo "🔍 Verifica installazione:"
python3.11 --version
python3.11 -c "import pptx; print('python-pptx: OK')"
libreoffice --version | head -1
```

Salva come `install-dependencies.sh`, rendi eseguibile e lancia:
```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

---

## 🧪 Test Generazione PDF

Dopo aver installato le dipendenze, testa la generazione PDF:

```bash
cd /path/to/valutatore-immobiliare-elba

# Crea un file JSON di test
cat > server/temp/test.json << 'EOF'
{
  "COMUNE": "Portoferraio",
  "LOCALITA": "Centro",
  "VALORE_TOTALE": "300.000",
  "VALORE_MINIMO": "270.000",
  "VALORE_MASSIMO": "330.000",
  "PREZZO_MQ": "2.500",
  "COMPETITIVITA": "MEDIA",
  "PREZZO_CONSIGLIATO": "276.000",
  "TIPOLOGIA": "Appartamento",
  "PIANO": "Secondo",
  "STATO": "Buono stato",
  "VISTA_MARE": "Parziale",
  "DISTANZA_MARE": "300 m",
  "SUPERFICIE": "120 mq",
  "VALORE_BASE": "250.000",
  "VALORE_PERTINENZE": "20.000",
  "VALORE_VALORIZZAZIONI": "30.000",
  "ICONA_1": "🌊",
  "PUNTO_FORZA_1_TITOLO": "Vista Mare",
  "PUNTO_FORZA_1_TESTO": "Bellissima vista sul mare.",
  "ICONA_2": "🏖️",
  "PUNTO_FORZA_2_TITOLO": "Vicino al Mare",
  "PUNTO_FORZA_2_TESTO": "A pochi passi dalla spiaggia.",
  "ICONA_3": "✨",
  "PUNTO_FORZA_3_TITOLO": "Buono Stato",
  "PUNTO_FORZA_3_TESTO": "Immobile ben tenuto.",
  "ICONA_4": "🚗",
  "PUNTO_FORZA_4_TITOLO": "Posto Auto",
  "PUNTO_FORZA_4_TESTO": "Comodo posto auto."
}
EOF

# Esegui lo script Python
/usr/bin/python3.11 -I server/pptx-generator.py server/temp/test.json server/temp/test-output.pdf

# Verifica che il PDF sia stato generato
if [ -f server/temp/test-output.pdf ]; then
    echo "✅ PDF generato con successo!"
    ls -lh server/temp/test-output.pdf
else
    echo "❌ Errore: PDF non generato"
    exit 1
fi
```

---

## 🔧 Troubleshooting

### Errore: "ModuleNotFoundError: No module named 'pptx'"

**Soluzione**:
```bash
sudo pip3 install python-pptx
```

### Errore: "libreoffice: command not found"

**Soluzione**:
```bash
sudo apt install -y libreoffice-core libreoffice-impress
```

### Errore: "Permission denied"

**Soluzione**: Assicurati che la directory `server/temp/` esista e sia scrivibile:
```bash
mkdir -p server/temp
chmod 755 server/temp
```

### Errore: "Template not found"

**Soluzione**: Verifica che il template esista:
```bash
ls -la server/templates/template-stima.pptx
```

Se manca, assicurati che sia stato committato su Git:
```bash
git add server/templates/template-stima.pptx
git commit -m "Add PDF template"
git push
```

---

## 📋 Checklist Pre-Deploy

Prima di deployare in produzione, verifica:

- [ ] Python 3.11 installato
- [ ] python-pptx installato
- [ ] LibreOffice installato
- [ ] Directory `server/temp/` esiste e scrivibile
- [ ] Template `server/templates/template-stima.pptx` esiste
- [ ] Test generazione PDF funziona localmente
- [ ] Variabili ambiente configurate (se necessarie)

---

## 🌐 Configurazione Server di Produzione

### Manus Platform

Se il sito è deployato su Manus Platform, potrebbe essere necessario:

1. **Accedere al pannello di controllo**
2. **Aprire una shell/SSH** sul server
3. **Eseguire lo script di installazione** dipendenze
4. **Riavviare il servizio** dopo l'installazione

### Docker (se applicabile)

Se usi Docker, aggiungi al `Dockerfile`:

```dockerfile
# Installa Python 3.11 e dipendenze
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3-pip \
    libreoffice-core-nogui \
    libreoffice-writer-nogui \
    libreoffice-impress-nogui \
    && rm -rf /var/lib/apt/lists/*

# Installa python-pptx
RUN pip3 install python-pptx
```

---

## 📞 Supporto

Se riscontri problemi durante l'installazione:

1. Verifica i log del server
2. Controlla i permessi delle directory
3. Assicurati che tutte le dipendenze siano installate
4. Testa la generazione PDF localmente prima di deployare

---

**Autore**: AI Assistant  
**Data**: 24 Novembre 2025  
**Status**: PRODUCTION READY
