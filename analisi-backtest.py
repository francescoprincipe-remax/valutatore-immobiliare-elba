#!/usr/bin/env python3
"""
Analisi approfondita risultati backtest per ottimizzazione algoritmo valutazione
"""

import json
import statistics
from collections import defaultdict

# Carica risultati backtest
with open('backtest-risultati.json', 'r') as f:
    risultati = json.load(f)

# Carica annunci originali per avere tutti i dettagli
with open('backtest-annunci-reali.json', 'r') as f:
    annunci = json.load(f)

print("=" * 80)
print("ANALISI APPROFONDITA BACKTEST - OTTIMIZZAZIONE PER ZONA")
print("=" * 80)
print()

# Raggruppa per comune
per_comune = defaultdict(list)
for r, a in zip(risultati, annunci):
    if r['valoreStimato'] is not None:
        per_comune[a['comune']].append({
            'codice': r['codice'],
            'localita': a['localita'],
            'superficie': r['superficie'],
            'prezzoReale': r['prezzoReale'],
            'prezzoMqReale': r['prezzoMqReale'],
            'valoreStimato': r['valoreStimato'],
            'prezzoMqStimato': r['prezzoMqStimato'],
            'errore': r['percentuale'],
            'tipologia': a['tipologia'],
            'stato': a['stato'],
            'caratteristiche': {
                'vistaMare': a.get('vistaMare'),
                'terrazzo': a.get('terrazzo'),
                'giardino': a.get('giardino'),
                'boxAuto': a.get('boxAuto'),
            }
        })

print("\n📊 ANALISI PER COMUNE")
print("=" * 80)

analisi_comuni = []

for comune, dati in sorted(per_comune.items()):
    print(f"\n### {comune.upper()}")
    print(f"Annunci: {len(dati)}")
    
    errori = [abs(d['errore']) for d in dati]
    errore_medio = statistics.mean(errori)
    
    # Calcola prezzo/mq reale medio vs stimato
    prezzi_reali_mq = [d['prezzoMqReale'] for d in dati]
    prezzi_stimati_mq = [d['prezzoMqStimato'] for d in dati]
    
    prezzo_reale_medio = statistics.mean(prezzi_reali_mq)
    prezzo_stimato_medio = statistics.mean(prezzi_stimati_mq)
    
    differenza_mq = prezzo_stimato_medio - prezzo_reale_medio
    differenza_perc = (differenza_mq / prezzo_reale_medio) * 100
    
    print(f"Errore medio: {errore_medio:.1f}%")
    print(f"Prezzo/mq reale medio: €{prezzo_reale_medio:,.0f}")
    print(f"Prezzo/mq stimato medio: €{prezzo_stimato_medio:,.0f}")
    print(f"Differenza: €{differenza_mq:+,.0f} ({differenza_perc:+.1f}%)")
    
    # Tendenza
    if abs(differenza_perc) < 10:
        tendenza = "✅ BILANCIATO"
    elif differenza_perc > 0:
        tendenza = f"❌ SOVRASTIMA ({differenza_perc:+.1f}%)"
    else:
        tendenza = f"❌ SOTTOSTIMA ({differenza_perc:+.1f}%)"
    
    print(f"Tendenza: {tendenza}")
    
    # Dettaglio annunci
    print("\nDettaglio annunci:")
    for d in dati:
        simbolo = "✅" if abs(d['errore']) <= 10 else "⚠️" if abs(d['errore']) <= 20 else "❌"
        print(f"  {simbolo} {d['codice']:15s} {d['localita']:20s} {d['superficie']:3d}mq  "
              f"€{d['prezzoMqReale']:4,d}/mq → €{d['prezzoMqStimato']:4,d}/mq  "
              f"({d['errore']:+6.1f}%)")
    
    # Salva per analisi successiva
    analisi_comuni.append({
        'comune': comune,
        'n_annunci': len(dati),
        'errore_medio': errore_medio,
        'prezzo_reale_mq': prezzo_reale_medio,
        'prezzo_stimato_mq': prezzo_stimato_medio,
        'differenza_mq': differenza_mq,
        'differenza_perc': differenza_perc,
        'tendenza': 'sovrastima' if differenza_perc > 10 else 'sottostima' if differenza_perc < -10 else 'bilanciato',
        'annunci': dati
    })

print("\n\n" + "=" * 80)
print("📈 ANALISI PER LOCALITÀ")
print("=" * 80)

# Raggruppa per località
per_localita = defaultdict(list)
for r, a in zip(risultati, annunci):
    if r['valoreStimato'] is not None:
        key = f"{a['comune']} - {a['localita']}"
        per_localita[key].append({
            'codice': r['codice'],
            'superficie': r['superficie'],
            'prezzoMqReale': r['prezzoMqReale'],
            'prezzoMqStimato': r['prezzoMqStimato'],
            'errore': r['percentuale'],
        })

for localita, dati in sorted(per_localita.items()):
    if len(dati) >= 2:  # Solo località con almeno 2 annunci
        print(f"\n{localita}:")
        prezzi_reali = [d['prezzoMqReale'] for d in dati]
        prezzi_stimati = [d['prezzoMqStimato'] for d in dati]
        
        print(f"  Prezzo/mq reale medio: €{statistics.mean(prezzi_reali):,.0f}")
        print(f"  Prezzo/mq stimato medio: €{statistics.mean(prezzi_stimati):,.0f}")
        print(f"  Differenza: €{statistics.mean(prezzi_stimati) - statistics.mean(prezzi_reali):+,.0f}")

print("\n\n" + "=" * 80)
print("🎯 RACCOMANDAZIONI OTTIMIZZAZIONE")
print("=" * 80)

for analisi in sorted(analisi_comuni, key=lambda x: abs(x['differenza_perc']), reverse=True):
    if abs(analisi['differenza_perc']) > 10:
        print(f"\n### {analisi['comune']}")
        print(f"Problema: {analisi['tendenza'].upper()}")
        print(f"Errore medio: {analisi['errore_medio']:.1f}%")
        
        # Calcola prezzo/mq ottimale
        prezzo_attuale = analisi['prezzo_stimato_mq']
        prezzo_target = analisi['prezzo_reale_mq']
        
        # Trova prezzo configurato nel database
        # Per semplicità, usiamo il prezzo stimato medio come proxy
        correzione_percentuale = ((prezzo_target / prezzo_attuale) - 1) * 100
        
        print(f"Prezzo/mq attuale algoritmo: €{prezzo_attuale:,.0f}")
        print(f"Prezzo/mq target (da mercato): €{prezzo_target:,.0f}")
        print(f"Correzione necessaria: {correzione_percentuale:+.1f}%")
        print(f"Nuovo prezzo/mq consigliato: €{prezzo_target:,.0f}")
        
        # Identifica se il problema è sistematico o specifico
        errori_individuali = [abs(d['errore']) for d in analisi['annunci']]
        varianza = statistics.stdev(errori_individuali) if len(errori_individuali) > 1 else 0
        
        if varianza < 15:
            print(f"Tipo errore: SISTEMATICO (varianza {varianza:.1f}%) → correggere prezzo/mq base")
        else:
            print(f"Tipo errore: VARIABILE (varianza {varianza:.1f}%) → rivedere valorizzazioni/pertinenze")

print("\n\n" + "=" * 80)
print("📋 TABELLA CORREZIONI PREZZI/MQ")
print("=" * 80)
print()
print(f"{'Comune':<20} {'Prezzo Attuale':<15} {'Prezzo Target':<15} {'Correzione':<12}")
print("-" * 65)

for analisi in sorted(analisi_comuni, key=lambda x: x['comune']):
    if abs(analisi['differenza_perc']) > 5:
        prezzo_attuale = int(analisi['prezzo_stimato_mq'])
        prezzo_target = int(analisi['prezzo_reale_mq'])
        correzione = analisi['differenza_perc']
        
        print(f"{analisi['comune']:<20} €{prezzo_attuale:>6,d}/mq      €{prezzo_target:>6,d}/mq      {correzione:>+6.1f}%")

print("\n\n" + "=" * 80)
print("🔍 ANALISI CARATTERISTICHE IMMOBILI")
print("=" * 80)

# Analizza se ci sono pattern per tipologia/caratteristiche
print("\nErrori per tipologia:")
per_tipologia = defaultdict(list)
for r, a in zip(risultati, annunci):
    if r['valoreStimato'] is not None and r['percentuale'] is not None:
        per_tipologia[a['tipologia']].append(abs(r['percentuale']))

for tipologia, errori in sorted(per_tipologia.items()):
    print(f"  {tipologia:20s}: {statistics.mean(errori):5.1f}% medio ({len(errori)} annunci)")

print("\nErrori per stato:")
per_stato = defaultdict(list)
for r, a in zip(risultati, annunci):
    if r['valoreStimato'] is not None and r['percentuale'] is not None:
        per_stato[a['stato']].append(abs(r['percentuale']))

for stato, errori in sorted(per_stato.items()):
    print(f"  {stato:20s}: {statistics.mean(errori):5.1f}% medio ({len(errori)} annunci)")

print("\nErrori per superficie:")
for r, a in zip(risultati, annunci):
    if r['valoreStimato'] is not None:
        range_mq = "<50mq" if a['superficie'] < 50 else "50-100mq" if a['superficie'] < 100 else "100-150mq" if a['superficie'] < 150 else ">150mq"
        if 'per_superficie' not in locals():
            per_superficie = defaultdict(list)
        per_superficie[range_mq].append(abs(r['percentuale']))

for range_mq, errori in sorted(per_superficie.items()):
    print(f"  {range_mq:20s}: {statistics.mean(errori):5.1f}% medio ({len(errori)} annunci)")

print("\n" + "=" * 80)
print("✅ Analisi completata")
print("=" * 80)
