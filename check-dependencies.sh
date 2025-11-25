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
