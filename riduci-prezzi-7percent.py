#!/usr/bin/env python3
"""
Riduce tutti i prezzi/mq del 7% nel database dati_mercato.json
"""

import json

# Carica database
with open('server/dati_mercato.json', 'r', encoding='utf-8') as f:
    dati = json.load(f)

print("=" * 60)
print("RIDUZIONE PREZZI/MQ DEL 7%")
print("=" * 60)
print()

# Riduce prezzi per ogni comune e località
for comune_key, comune_data in dati['comuni'].items():
    print(f"📍 {comune_data['nome']}")
    
    # Riduce prezzo medio comunale
    vecchio_medio = comune_data['prezzo_medio_mq']
    nuovo_medio = int(vecchio_medio * 0.93)  # -7%
    comune_data['prezzo_medio_mq'] = nuovo_medio
    diff = nuovo_medio - vecchio_medio
    print(f"   Prezzo medio: €{vecchio_medio} → €{nuovo_medio} ({diff:+d}, -7.0%)")
    
    # Riduce prezzi località
    for loc_key, loc_data in comune_data['localita'].items():
        vecchio_prezzo = loc_data['prezzo_mq']
        nuovo_prezzo = int(vecchio_prezzo * 0.93)  # -7%
        loc_data['prezzo_mq'] = nuovo_prezzo
        
        if vecchio_prezzo != nuovo_prezzo:
            diff_loc = nuovo_prezzo - vecchio_prezzo
            print(f"   - {loc_data['nome']}: €{vecchio_prezzo} → €{nuovo_prezzo} ({diff_loc:+d})")
    
    print()

# Salva database aggiornato
with open('server/dati_mercato.json', 'w', encoding='utf-8') as f:
    json.dump(dati, f, indent=2, ensure_ascii=False)

print("=" * 60)
print("✅ Riduzione completata!")
print("Database aggiornato: server/dati_mercato.json")
print("=" * 60)
