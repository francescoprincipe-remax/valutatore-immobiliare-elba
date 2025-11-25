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

# 4. Directory temp
echo -n "Directory server/temp: "
if [ -d "server/temp" ]; then
    echo "✅ ESISTE"
else
    echo "⚠️  NON ESISTE (verrà creata automaticamente)"
fi

# 5. Template PPTX
echo -n "Template PPTX: "
if [ -f "server/template-report.pptx" ]; then
    echo "✅ TROVATO"
else
    echo "❌ NON TROVATO"
fi

echo ""
echo "======================================"
