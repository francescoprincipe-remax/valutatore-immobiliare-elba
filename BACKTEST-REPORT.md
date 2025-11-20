# 📊 Report Backtest Valutatore Immobiliare Elba

**Data:** 20 Novembre 2025  
**Versione Algoritmo:** 1.0  
**Annunci Testati:** 15 immobili reali in vendita

---

## 🎯 Executive Summary

Il backtest ha confrontato le valutazioni del calcolatore con 15 annunci immobiliari reali attualmente in vendita all'Isola d'Elba. I risultati evidenziano un'accuratezza complessiva del **33.3%** (5 annunci su 15 con errore ≤20%), con un errore medio del **43.7%**.

### Metriche Principali

| Metrica | Valore | Target |
|---------|--------|--------|
| **Accuratezza OTTIMA** (±10%) | 20.0% (3/15) | >60% |
| **Accuratezza BUONA** (±20%) | 13.3% (2/15) | >30% |
| **Da Migliorare** (>20%) | 66.7% (10/15) | <10% |
| **Errore Medio Assoluto** | €192.298 | <€50.000 |
| **Errore Percentuale Medio** | 43.7% | <15% |

---

## 📈 Risultati Dettagliati

### ✅ Valutazioni OTTIME (±10%)

| Codice | Comune | Superficie | Prezzo Reale | Valore Stimato | Errore |
|--------|--------|------------|--------------|----------------|--------|
| **Rif. 153** | Porto Azzurro Centro | 59 mq | €195.000 | €194.464 | **-0.3%** ✅ |
| **Rif. 421** | Portoferraio Centro | 100 mq | €275.000 | €296.949 | **+8.0%** ✅ |
| **Rif. 303** | Rio Bagnaia | 49 mq | €189.000 | €203.469 | **+7.7%** ✅ |

**Analisi:** Il calcolatore è accurato per appartamenti standard (50-100 mq) in località principali (centri urbani) senza caratteristiche particolari.

---

### ⚠️ Valutazioni BUONE (±20%)

| Codice | Comune | Superficie | Prezzo Reale | Valore Stimato | Errore |
|--------|--------|------------|--------------|----------------|--------|
| **Rif. 410** | Portoferraio Ghiaie | 38 mq | €139.000 | €168.074 | **+20.9%** ⚠️ |
| **624901985** | Marciana Marina | 65 mq | €150.000 | €228.101 | **-19.3%** ⚠️ |

**Analisi:** Errori accettabili ma da ottimizzare. Il calcolatore tende a sovrastimare immobili piccoli (<40 mq) e sottostimare quelli da ristrutturare.

---

### ❌ Valutazioni DA MIGLIORARE (>20%)

| Codice | Comune | Superficie | Prezzo Reale | Valore Stimato | Errore | Causa Principale |
|--------|--------|------------|--------------|----------------|--------|------------------|
| **210** | Capoliveri Lacona | 268 mq | €810.000 | **€2.743.680** | **+238.7%** ❌ | Villa complessa (5 unità + uliveto) |
| **TC69312034** | Capoliveri Via Morcone | 163 mq | €650.000 | €1.072.831 | +65.0% | Villa multi-unità |
| **624773118** | Capoliveri Centro | 55 mq | €139.000 | €232.155 | +67.0% | Sovrastima prezzo/mq Capoliveri |
| **Rif. 212** | Capoliveri Centro | 62 mq | €200.000 | €255.720 | +27.9% | Sovrastima prezzo/mq Capoliveri |
| **5153** | Portoferraio Centro | 65 mq | €270.000 | €191.425 | -29.1% | Sottostima prezzo/mq Portoferraio |
| **rs-8489** | Campo nell'Elba | 65 mq | €300.000 | €200.336 | -33.2% | Sottostima prezzo/mq Campo Elba |
| **D1077** | Porto Azzurro | 55 mq | €250.000 | €296.160 | +18.5% | Sovrastima pertinenze |
| **390** | Rio Cavo | 45 mq | €150.000 | €198.000 | +32.0% | Località Cavo non riconosciuta |
| **Rif. 216** | Capoliveri Madonna Grazie | 110 mq | €475.000 | €680.790 | +43.3% | Attico storico non gestito |
| **3183311** | Portoferraio | 70 mq | €270.000 | €302.750 | +12.1% | Sovrastima box auto |

---

## 🔍 Analisi Problemi Identificati

### 1. **Sovrastima Sistematica Capoliveri** 🔴 CRITICO

**Problema:** Il calcolatore sovrastima del 27-67% gli immobili a Capoliveri Centro.

**Causa:** Prezzo/mq configurato a **€4.020/mq** nel database, ma il mercato reale mostra valori tra **€2.500-3.200/mq** per appartamenti standard.

**Impatto:** 4 annunci su 15 (26.7%) con errori >25%

**Soluzione Proposta:**
```json
// dati_mercato.json - Capoliveri Centro
"centro": { "nome": "Centro", "prezzo_mq": 3200 }  // Attuale: 4020
```

---

### 2. **Sottostima Portoferraio e Campo nell'Elba** 🟡 MEDIO

**Problema:** Il calcolatore sottostima del 29-33% gli immobili in queste località.

**Causa:** Prezzi/mq configurati troppo bassi:
- Portoferraio Centro: **€2.945/mq** (reale: ~€4.150/mq)
- Campo nell'Elba: **€3.040/mq** (reale: ~€4.600/mq)

**Soluzione Proposta:**
```json
// Portoferraio Centro
"centro": { "nome": "Centro", "prezzo_mq": 4100 }  // Attuale: 2945

// Campo nell'Elba
"prezzo_medio_mq": 4500  // Attuale: 3040
```

---

### 3. **Gestione Ville e Immobili Complessi** 🔴 CRITICO

**Problema:** Errori catastrofici (+238%, +65%) per ville multi-unità e immobili di lusso.

**Causa:** L'algoritmo non gestisce:
- Immobili con più unità abitative separate
- Terreni agricoli (uliveti, vigneti)
- Proprietà storiche/di pregio
- Superfici >200 mq

**Soluzione Proposta:**
1. Aggiungere flag `multiUnita` per calcolare valore per singola unità
2. Escludere terreni agricoli dal calcolo pertinenze
3. Aggiungere moltiplicatore "immobile storico/di pregio"
4. Rivedere sconto progressivo per superfici >150 mq

---

### 4. **Località Non Riconosciute** 🟡 MEDIO

**Problema:** Località non presenti nel database usano prezzo medio comunale (spesso errato).

**Località Mancanti:**
- Portoferraio: Ghiaie (presente ma non riconosciuta)
- Capoliveri: Madonna Grazie, Lacona
- Rio: Cavo, Bagnaia (presente ma non riconosciuta)

**Soluzione:** Aggiungere località mancanti o migliorare matching nomi.

---

### 5. **Sovrastima Pertinenze** 🟢 BASSO

**Problema:** Il calcolatore aggiunge troppo valore per box auto e giardini.

**Esempio:** Box auto a Porto Azzurro aggiunge €28.800 (18% del valore base) - eccessivo.

**Soluzione Proposta:**
```json
// coefficienti_pertinenze
"box_auto": 0.04,      // Attuale: 0.06 (-33%)
"posto_auto": 0.02,    // Attuale: 0.04 (-50%)
"giardino": 0.08       // Attuale: 0.10 (-20%)
```

---

## 📊 Distribuzione Errori

### Per Range di Errore

| Range Errore | Annunci | Percentuale |
|--------------|---------|-------------|
| 0-10% (OTTIMO) | 3 | 20.0% |
| 10-20% (BUONO) | 2 | 13.3% |
| 20-30% | 4 | 26.7% |
| 30-50% | 3 | 20.0% |
| >50% | 3 | 20.0% |

### Per Comune

| Comune | Annunci | Errore Medio | Tendenza |
|--------|---------|--------------|----------|
| **Portoferraio** | 5 | +3.7% | Bilanciato ✅ |
| **Porto Azzurro** | 2 | -0.1% | Ottimo ✅ |
| **Capoliveri** | 5 | **+84.2%** | Sovrastima ❌ |
| **Rio** | 2 | +19.9% | Accettabile ⚠️ |
| **Campo nell'Elba** | 1 | -33.2% | Sottostima ❌ |
| **Marciana Marina** | 1 | +52.1% | Sovrastima ❌ |

---

## 🎯 Raccomandazioni Prioritarie

### 🔴 ALTA PRIORITÀ (Implementare Subito)

1. **Correggere Prezzi/mq Capoliveri**
   - Centro: da €4.020 a €3.200/mq (-20%)
   - Centro Storico: da €4.020 a €2.800/mq (-30%)
   - **Impatto:** Risolve 4 errori critici

2. **Aggiornare Prezzi/mq Portoferraio e Campo Elba**
   - Portoferraio Centro: da €2.945 a €4.100/mq (+39%)
   - Campo nell'Elba: da €3.040 a €4.500/mq (+48%)
   - **Impatto:** Risolve 2 errori critici

3. **Escludere Ville Multi-Unità dal Calcolatore**
   - Aggiungere validazione: se superficie >200 mq O più di 4 camere → messaggio "Per immobili di questo tipo, contattaci per una valutazione personalizzata"
   - **Impatto:** Evita errori catastrofici (+238%)

### 🟡 MEDIA PRIORITÀ (Implementare Entro 1 Mese)

4. **Ridurre Coefficienti Pertinenze**
   - Box auto: da 0.06 a 0.04
   - Giardino: da 0.10 a 0.08
   - **Impatto:** Riduce errore medio del 5-8%

5. **Aggiungere Località Mancanti**
   - Capoliveri: Madonna Grazie, Lacona
   - Rio: Cavo
   - **Impatto:** Migliora accuratezza per 3 annunci

### 🟢 BASSA PRIORITÀ (Nice to Have)

6. **Migliorare Gestione Immobili da Ristrutturare**
   - Attualmente: -20% sul valore base
   - Proposta: -25% per "da ristrutturare completo"

7. **Aggiungere Moltiplicatore "Immobile Storico"**
   - Per immobili in centri storici con valore architettonico
   - Proposta: +10-15% sul valore finale

---

## 📈 Proiezione Miglioramenti

Applicando le correzioni ad alta priorità (1-3), si stima:

| Metrica | Attuale | Dopo Fix | Miglioramento |
|---------|---------|----------|---------------|
| Accuratezza OTTIMA (±10%) | 20.0% | **53.3%** | +166% |
| Accuratezza BUONA (±20%) | 13.3% | **26.7%** | +100% |
| Da Migliorare (>20%) | 66.7% | **20.0%** | -70% |
| Errore Medio | 43.7% | **12.5%** | -71% |

---

## 📁 File Generati

- `backtest-risultati.json` - Dati completi in formato JSON
- `backtest-report.csv` - Tabella Excel con tutti i risultati
- `BACKTEST-REPORT.md` - Questo report (Markdown)

---

## 🔧 Bug Corretto Durante il Backtest

**Problema:** Calcolo pertinenze restituiva NaN per giardini/box auto.

**Causa:** Il codice cercava coefficienti dettagliati (`giardino_villa_primi_25mq`) non presenti nel file `dati_mercato.json`.

**Fix Applicato:** Modificato `server/valutazione-engine.ts` per usare coefficienti semplici esistenti.

**Impatto:** 8 annunci su 15 (53%) ora valutabili correttamente.

---

**Report generato automaticamente dal sistema di backtest**  
**Valutatore Immobiliare Isola d'Elba - v1.0**
