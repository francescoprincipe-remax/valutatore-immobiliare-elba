#!/usr/bin/env python3
"""
Estrae tutte le zone (comuni + località) dal database in formato CSV
"""

import json
import csv

# Carica dati mercato
with open('server/dati_mercato.json', 'r') as f:
    dati = json.load(f)

# Prepara CSV
zone = []

for comune_key, comune_data in dati['comuni'].items():
    comune_nome = comune_data['nome']
    prezzo_medio_comunale = comune_data['prezzo_medio_mq']
    
    # Aggiungi località
    for localita_key, localita_data in comune_data['localita'].items():
        localita_nome = localita_data['nome']
        prezzo_attuale = localita_data['prezzo_mq']
        
        zone.append({
            'Comune': comune_nome,
            'Località': localita_nome,
            'Prezzo_Attuale_€_mq': prezzo_attuale,
            'Prezzo_Reale_Mercato_€_mq': '',  # Da compilare
            'Note': ''
        })

# Ordina per comune e località
zone.sort(key=lambda x: (x['Comune'], x['Località']))

# Scrivi CSV
with open('zone-prezzi-da-compilare.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['Comune', 'Località', 'Prezzo_Attuale_€_mq', 'Prezzo_Reale_Mercato_€_mq', 'Note'])
    writer.writeheader()
    writer.writerows(zone)

print(f"✅ CSV generato: zone-prezzi-da-compilare.csv")
print(f"📊 Totale zone: {len(zone)}")
print()
print("Istruzioni:")
print("1. Apri il file zone-prezzi-da-compilare.csv")
print("2. Compila la colonna 'Prezzo_Reale_Mercato_€_mq' con i prezzi attuali del mercato")
print("3. Opzionale: aggiungi note nella colonna 'Note'")
print("4. Salva il file e riesegui lo script di aggiornamento")
