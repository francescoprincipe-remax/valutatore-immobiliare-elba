#!/usr/bin/env python3
"""
Aggiorna il database dati_mercato.json con i prezzi reali dal CSV
"""

import json
import csv
from collections import defaultdict

# Carica CSV prezzi reali
prezzi_reali = {}
with open('/home/ubuntu/upload/prezzielbacalcolatore.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    for row in reader:
        if not row['Comune'] or not row['Località']:
            continue
        
        comune = row['Comune']
        localita = row['Località']
        prezzo_reale = row['Prezzo_Reale_Mercato_€_mq'].strip()
        
        # Se non c'è prezzo reale, usa quello attuale
        if not prezzo_reale:
            prezzo_reale = row['Prezzo_Attuale_€_mq']
        
        try:
            prezzo = int(prezzo_reale)
            if comune not in prezzi_reali:
                prezzi_reali[comune] = {}
            prezzi_reali[comune][localita] = prezzo
        except (ValueError, TypeError):
            print(f"⚠️  Prezzo non valido per {comune} - {localita}: '{prezzo_reale}'")

print(f"✅ Caricati prezzi per {len(prezzi_reali)} comuni")
for comune, localita_dict in prezzi_reali.items():
    print(f"   {comune}: {len(localita_dict)} località")

# Carica database attuale
with open('server/dati_mercato.json', 'r', encoding='utf-8') as f:
    dati = json.load(f)

# Mappa nomi comuni (normalizza)
mappa_comuni = {
    "Campo nell'Elba": "campo_nell_elba",
    "Capoliveri": "capoliveri",
    "Marciana": "marciana",
    "Marciana Marina": "marciana_marina",
    "Porto Azzurro": "porto_azzurro",
    "Portoferraio": "portoferraio",
    "Rio": "rio"
}

# Funzione per normalizzare nomi località
def normalizza_localita(nome):
    """Converte nome località in chiave database"""
    return nome.lower().replace("'", "_").replace(" ", "_").replace("à", "a").replace("è", "e").replace("ì", "i").replace("ò", "o").replace("ù", "u")

# Aggiorna prezzi
aggiornamenti = 0
non_trovati = []

for comune_nome, localita_dict in prezzi_reali.items():
    comune_key = mappa_comuni.get(comune_nome)
    if not comune_key or comune_key not in dati['comuni']:
        print(f"❌ Comune non trovato: {comune_nome}")
        continue
    
    for localita_nome, prezzo in localita_dict.items():
        # Prova diverse varianti del nome località
        localita_key = normalizza_localita(localita_nome)
        
        # Cerca la località nel database
        trovata = False
        for key in dati['comuni'][comune_key]['localita'].keys():
            if key == localita_key or normalizza_localita(dati['comuni'][comune_key]['localita'][key]['nome']) == normalizza_localita(localita_nome):
                # Aggiorna prezzo
                vecchio_prezzo = dati['comuni'][comune_key]['localita'][key]['prezzo_mq']
                dati['comuni'][comune_key]['localita'][key]['prezzo_mq'] = prezzo
                
                if vecchio_prezzo != prezzo:
                    diff = prezzo - vecchio_prezzo
                    perc = (diff / vecchio_prezzo) * 100 if vecchio_prezzo > 0 else 0
                    print(f"✓ {comune_nome} - {localita_nome}: €{vecchio_prezzo} → €{prezzo} ({diff:+d}, {perc:+.1f}%)")
                    aggiornamenti += 1
                
                trovata = True
                break
        
        if not trovata:
            non_trovati.append(f"{comune_nome} - {localita_nome}")

# Aggiorna prezzi medi comunali (media delle località)
for comune_key, comune_data in dati['comuni'].items():
    prezzi_localita = [loc['prezzo_mq'] for loc in comune_data['localita'].values()]
    if prezzi_localita:
        prezzo_medio = int(sum(prezzi_localita) / len(prezzi_localita))
        vecchio_medio = comune_data['prezzo_medio_mq']
        comune_data['prezzo_medio_mq'] = prezzo_medio
        
        if vecchio_medio != prezzo_medio:
            print(f"✓ {comune_data['nome']} (medio): €{vecchio_medio} → €{prezzo_medio}")

# Salva database aggiornato
with open('server/dati_mercato.json', 'w', encoding='utf-8') as f:
    json.dump(dati, f, indent=2, ensure_ascii=False)

print()
print("=" * 60)
print(f"✅ Aggiornamento completato!")
print(f"   Prezzi aggiornati: {aggiornamenti}")
print(f"   Località non trovate: {len(non_trovati)}")

if non_trovati:
    print("\n⚠️  Località non trovate nel database:")
    for loc in non_trovati[:10]:  # Mostra prime 10
        print(f"   - {loc}")
    if len(non_trovati) > 10:
        print(f"   ... e altre {len(non_trovati) - 10}")

print()
print("Database aggiornato: server/dati_mercato.json")
print("=" * 60)
