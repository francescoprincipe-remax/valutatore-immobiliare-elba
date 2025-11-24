# 🤖 AI Handoff Prompt - Valutatore Immobiliare Isola d'Elba

## 📋 Contesto Generale del Progetto

Stai per lavorare su **Valutatore Immobiliare Isola d'Elba**, un'applicazione web professionale per la stima automatica del valore di mercato di immobili sull'Isola d'Elba (Toscana, Italia). Il progetto è stato sviluppato per **Francesco Principe - RE/MAX Mindset**, agente immobiliare specializzato nel mercato elbano.

### Obiettivo del Progetto
Fornire agli utenti una **stima automatica gratuita** del valore di mercato del loro immobile basata su:
- Database di 73 località con prezzi al mq aggiornati (dati reali di mercato forniti dal cliente)
- Algoritmo di valutazione avanzato con oltre 50 parametri
- Report PDF professionale scaricabile dopo compilazione form lead

### Business Model
- **Lead generation**: Gli utenti compilano un form con i loro dati per scaricare il report PDF
- **Conversione**: I lead vengono salvati nel database e notificati via email al proprietario
- **Funnel**: Il PDF contiene CTA multiple per contattare l'agente via WhatsApp

---

## 🏗️ Architettura Tecnica

### Stack Tecnologico
- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend**: Node.js + Express 4 + tRPC 11
- **Database**: MySQL (TiDB Cloud)
- **ORM**: Drizzle ORM
- **PDF Generation**: Python 3.11 + python-pptx + LibreOffice (PowerPoint → PDF)
- **Email**: SendGrid API
- **Deployment**: Manus Platform (https://valutator-asn5tjzf.manus.space)
- **Repository**: https://github.com/francescoprincipe-remax/valutatore-immobiliare-elba

### Struttura del Progetto
```
valutatore-immobiliare-elba/
├── client/                      # Frontend React
│   ├── src/
│   │   ├── pages/              # Pagine principali
│   │   │   ├── Home.tsx        # Homepage con hero + FAQ
│   │   │   ├── Valuta.tsx      # Form valutazione (6 step)
│   │   │   ├── Risultato.tsx   # Pagina risultati + form lead
│   │   │   └── AdminLeads.tsx  # Dashboard admin lead
│   │   ├── components/         # Componenti riutilizzabili
│   │   ├── data/
│   │   │   └── localita.ts     # Database 73 località + prezzi/mq
│   │   └── lib/
│   │       └── trpc.ts         # Client tRPC
│   └── public/                 # Assets statici
├── server/
│   ├── routers.ts              # Endpoint tRPC principali
│   ├── db.ts                   # Query database
│   ├── valutazione-engine.ts   # Algoritmo di valutazione
│   ├── pptx-generator.py       # Script Python per PDF
│   ├── _core/
│   │   ├── email.ts            # Helper SendGrid
│   │   └── notification.ts     # Notifiche owner
│   └── temp/                   # File temporanei PDF
├── drizzle/
│   └── schema.ts               # Schema database (users, valutazioni, leads)
├── todo.md                     # Storico completo modifiche
└── AI-HANDOFF-PROMPT.md        # Questo file
```

---

## 📊 Database Schema

### Tabella `users`
- `id` (PK): Auto-increment
- `openId`: Manus OAuth identifier (unique)
- `email`, `name`, `loginMethod`
- `role`: 'admin' | 'user'
- `createdAt`, `updatedAt`, `lastSignedIn`

### Tabella `valutazioni`
- `id` (PK): Auto-increment
- `userId`: FK a users (nullable per utenti anonimi)
- `comune`, `localita`, `tipologia`, `superficieAbitabile`, ecc.
- `valoreTotale`, `valoreMin`, `valoreMax`, `prezzoConsigliato`
- `breakdown`: JSON con dettagli valorizzazioni
- `createdAt`

### Tabella `leads`
- `id` (PK): Auto-increment
- `nome`, `cognome`, `email`, `telefono`
- `comune`, `tipologia`, `superficie`, `valoreTotale`
- `gdprConsent`: boolean
- `createdAt`

---

## 🧮 Algoritmo di Valutazione

### File: `server/valutazione-engine.ts`

#### 1. Prezzo Base al mq
```typescript
// Database: client/src/data/localita.ts
const PREZZI_MQ: Record<string, Record<string, number>> = {
  "Capoliveri": {
    "Centro": 3500,
    "Lacona": 3800,
    // ... 73 località totali
  }
}
```

#### 2. Regole Speciali
- **Portoferraio Centro <50mq**: +15% (monolocali premium)
- **Immobili <50mq**: -10% (sconto monolocali generici)
- **Immobili >150mq**: Sconto progressivo ville
  - 100-150mq: -2%
  - 150-200mq: -5%
  - 200-250mq: -10%
  - 250-300mq: -15%
  - >300mq: -20%
- **Mansarde/sottotetti**: -15% (campo `piano`)

#### 3. Stato Manutenzione
- Nuovo/Mai abitato: +10%
- Ottimo stato: +5%
- Ristrutturato: +3%
- Buono: 0%
- Abitabile: -10%
- Da ristrutturare: -35%

#### 4. Pertinenze (valori aggiunti)
- **Giardino**: €150-300/mq (tipo privato/condominiale)
- **Piscina**: €15.000-25.000 (privata/condominiale)
- **Terrazzo**: €200-400/mq (coperto/scoperto)
- **Box auto**: €15.000-25.000 (coperto/scoperto)
- **Cantina**: €100/mq

#### 5. Valorizzazioni (% sul valore base)
- **Vista mare**: +8% (totale), +1.5% (alcune stanze)
- **Posizione panoramica**: +5%
- **Fronte mare**: +12%
- **Servizi**: Aria condizionata +2%, Riscaldamento autonomo +1.5%, ecc.
- **Finiture**: Parquet +2%, Marmo +3%, ecc.

#### 6. Range Valutazione
- **Valore minimo**: valoreTotale × 0.90
- **Valore massimo**: valoreTotale × 1.10
- **Prezzo consigliato**: valoreTotale × (0.97 - 0.88) [sempre sotto il valore medio]

#### 7. Competitività Mercato
Basata su numero immobili simili in zona (simulato):
- BASSA: <5 immobili
- MEDIA: 5-10 immobili
- ALTA: 10-20 immobili
- MOLTO_ALTA: >20 immobili

---

## 🐛 Problemi Risolti e Soluzioni Critiche

### 1. Bug Generazione PDF (CRITICO - Risolto 24 Nov 2025)

**Problema**: Errore "Errore durante la generazione del PDF. Riprova." quando utente scaricava PDF.

**Causa Root**: Environment Python contaminato da UV/Python 3.13. Lo script Python caricava librerie da `/home/ubuntu/.local/share/uv/python/cpython-3.13.8` invece di usare Python 3.11 standard, causando `AssertionError: SRE module mismatch`.

**Soluzione Applicata**:
```typescript
// server/routers.ts - Endpoint generatePDF
const pythonProcess = spawn('/usr/bin/python3.11', [
  '-I',  // ← CRITICO: Isolated mode (disabilita user site-packages)
  scriptPath,
  jsonPath,
  pdfPath
], {
  env: {
    ...process.env,
    PYTHONPATH: undefined,  // ← Pulisce environment
    VIRTUAL_ENV: undefined,
    UV_PYTHON: undefined
  }
});
```

**File Modificati**:
- `server/routers.ts`: Aggiunto flag `-I` e environment pulito
- `server/pptx-generator.py`: Shebang cambiato da `#!/usr/bin/env python3` a `#!/usr/bin/python3.11`

**Test**: Creato test vitest completo in `server/pdf-generation.test.ts` che simula flusso end-to-end (calcola → generatePDF → download).

---

### 2. Bug Valori €0 (Risolto)

**Problema**: Valori min/max/totale/consigliato mostravano €0 nella pagina risultati.

**Causa**: Bug nel calcolo pertinenze (NaN propagato).

**Soluzione**: Corretto calcolo giardino/terrazzo/box auto con fallback a 0.

---

### 3. Accuratezza Valutazioni (Ottimizzata)

**Backtest Iniziale**: Errore medio 43.7%, accuratezza ±20% = 33%

**Ottimizzazioni Applicate**:
1. Aggiornati prezzi/mq con dati reali forniti dal cliente (43 località)
2. Ridotti tutti i prezzi del 7% (sovrastima generale)
3. Implementato sconto progressivo ville >150mq
4. Aumentato sconto "da ristrutturare" a -35%
5. Ridotta valorizzazione vista mare "alcune stanze" a +1.5%

**Backtest Finale**: Errore medio 30.4%, accuratezza ±20% = 60% (+82% miglioramento)

---

### 4. Disclaimer Legale (Implementato)

**Problema**: Terminologia "valutazione professionale" poteva creare aspettative legali errate.

**Soluzione**:
- Sostituito "valutazione professionale" con "Stima Automatica di Mercato"
- Aggiunto disclaimer prominente nella pagina risultati (box giallo con AlertCircle)
- Chiarito che è una stima non vincolante basata su algoritmo
- Homepage: "Stima automatica basata su dati di mercato reali"

---

## 🔧 Funzionalità Principali

### 1. Form Valutazione (6 Step)
**File**: `client/src/pages/Valuta.tsx`

**Step**:
1. Localizzazione (comune, località, distanza mare)
2. Tipologia e caratteristiche (tipo, superficie, camere, bagni, piano, stato)
3. Pertinenze (giardino, piscina, terrazzo, box auto, cantina)
4. Vista e posizione (vista mare, esposizione, posizione, accesso mare)
5. Servizi e comfort (aria condizionata, riscaldamento, finiture)
6. Riepilogo

**Endpoint**: `trpc.valutazione.calcola`
- Salva valutazione nel database (anche per utenti anonimi con `userId: null`)
- Restituisce `valutazioneId` (salvato in sessionStorage per generare PDF)

---

### 2. Pagina Risultati
**File**: `client/src/pages/Risultato.tsx`

**Sezioni**:
- **Alert immobili >200mq**: Banner arancione con CTA "Richiedi Valutazione Personalizzata"
- **Hero Result Card**: Valore min/medio/max + competitività
- **Disclaimer**: Box giallo con AlertCircle (stima automatica non vincolante)
- **Composizione Valore**: Progress bar (base + pertinenze + valorizzazioni)
- **Breakdown Dettagliato**: Accordion con dettagli valorizzazioni (nascosto di default)
- **Punti di Forza**: Lista caratteristiche positive immobile
- **CTA Finale**: "Vuoi Vendere Più Velocemente?" → WhatsApp

**Bottone "Scarica Report PDF"**:
1. Apre dialog con form lead (nome, cognome, telefono, email, GDPR)
2. Salva lead nel database (`trpc.lead.create`)
3. Invia email notifica al proprietario (SendGrid)
4. Genera PDF (`trpc.valutazione.generatePDF`)
5. Scarica PDF automaticamente

---

### 3. Generazione PDF
**File**: `server/pptx-generator.py`

**Flusso**:
1. Backend crea file JSON con dati valutazione (`/server/temp/valutazione-{id}.json`)
2. Esegue script Python: `/usr/bin/python3.11 -I pptx-generator.py input.json output.pdf`
3. Script Python:
   - Carica template PowerPoint (`server/template-report.pptx`)
   - Sostituisce placeholder con dati reali
   - Salva PPTX modificato
   - Converte PPTX → PDF usando LibreOffice headless
4. Backend legge PDF, converte in base64, restituisce al frontend
5. Frontend scarica PDF automaticamente

**Template PowerPoint**: 7 pagine professionali con design Canva, watermark mongolfiera RE/MAX, CTA multiple.

**IMPORTANTE**: Usare SEMPRE flag `-I` (isolated mode) per evitare conflitti con UV/Python 3.13!

---

### 4. Dashboard Admin Lead
**File**: `client/src/pages/AdminLeads.tsx`

**Accesso**: `/admin/leads` (richiede autenticazione + `role='admin'`)

**Funzionalità**:
- Tabella lead con filtri (data, comune, range prezzo)
- Statistiche (totale lead, comune più attivo, trend mensile)
- Esportazione CSV
- Protezione: solo utenti admin possono accedere

**Endpoint**: `trpc.lead.getAll`, `trpc.lead.getStats`

---

### 5. Notifiche Email
**File**: `server/_core/email.ts`

**Trigger**: Quando utente compila form lead per scaricare PDF

**Contenuto Email**:
- Dati immobile completi (comune, località, tipologia, superficie, stato)
- Dati contatto lead (nome, cognome, email, telefono)
- Valore stimato
- CTA "Visualizza Lead nella Dashboard"

**Configurazione**: SendGrid API key in secrets (SENDGRID_API_KEY, SENDGRID_FROM_EMAIL)

---

## 📝 File Critici da Conoscere

### 1. `client/src/data/localita.ts`
Database completo di 73 località con prezzi al mq. **QUESTO È IL CUORE DEL SISTEMA DI PRICING**.

Struttura:
```typescript
export const COMUNI_ELBA = [
  "Capoliveri", "Campo nell'Elba", "Marciana", 
  "Marciana Marina", "Porto Azzurro", "Portoferraio", "Rio"
];

export const LOCALITA_PER_COMUNE: Record<string, string[]> = {
  "Capoliveri": ["Centro", "Lacona", "Morcone", ...],
  // ...
};

export const PREZZI_MQ: Record<string, Record<string, number>> = {
  "Capoliveri": {
    "Centro": 3500,      // €/mq aggiornato con dati reali
    "Lacona": 3800,
    // ...
  },
  // ...
};
```

**Quando modificare**: Se il cliente fornisce nuovi dati di mercato o vuoi aggiungere località.

---

### 2. `server/valutazione-engine.ts`
Algoritmo di valutazione completo. **TOCCARE CON CAUTELA - OGNI MODIFICA IMPATTA TUTTE LE STIME**.

Funzione principale: `calcolaValutazione(input: ValutazioneInput): RisultatoValutazione`

**Quando modificare**: 
- Aggiungere nuove regole di pricing
- Modificare percentuali valorizzazioni
- Aggiungere nuovi parametri

**IMPORTANTE**: Dopo modifiche, eseguire backtest su annunci reali per verificare accuratezza.

---

### 3. `server/routers.ts`
Endpoint tRPC principali:

```typescript
valutazione: router({
  calcola: publicProcedure.input(z.object({...})).mutation(async ({ input, ctx }) => {
    // 1. Calcola valutazione
    const risultato = calcolaValutazione(input);
    
    // 2. Salva nel database (SEMPRE, anche per utenti anonimi)
    const valutazioneId = await saveValutazione({
      userId: ctx.user?.id ?? null,  // ← null per anonimi
      ...input,
      ...risultato
    });
    
    // 3. Restituisci risultato + valutazioneId
    return { ...risultato, valutazioneId };
  }),
  
  generatePDF: publicProcedure.input(z.object({
    valutazioneId: z.string(),
    leadData: z.object({...})
  })).mutation(async ({ input }) => {
    // 1. Recupera valutazione dal database
    const valutazione = await getValutazioneById(input.valutazioneId);
    
    // 2. Crea file JSON temporaneo
    const jsonPath = `/server/temp/valutazione-${valutazioneId}.json`;
    fs.writeFileSync(jsonPath, JSON.stringify({...valutazione, ...leadData}));
    
    // 3. Esegui script Python (ISOLATED MODE!)
    const pythonProcess = spawn('/usr/bin/python3.11', [
      '-I',  // ← CRITICO!
      'pptx-generator.py',
      jsonPath,
      pdfPath
    ], {
      env: {
        ...process.env,
        PYTHONPATH: undefined,
        VIRTUAL_ENV: undefined,
        UV_PYTHON: undefined
      }
    });
    
    // 4. Leggi PDF e converti in base64
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfBuffer.toString('base64');
    
    // 5. Cleanup file temporanei
    fs.unlinkSync(jsonPath);
    fs.unlinkSync(pdfPath);
    
    return { success: true, pdfBase64, filename: 'stima-immobiliare-elba.pdf' };
  })
}),

lead: router({
  create: publicProcedure.input(z.object({...})).mutation(async ({ input }) => {
    // 1. Salva lead nel database
    await db.insert(leads).values(input);
    
    // 2. Invia email notifica al proprietario
    await sendLeadNotificationEmail({
      to: process.env.OWNER_EMAIL,
      leadData: input
    });
    
    return { success: true };
  }),
  
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Solo admin possono accedere
    if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  })
})
```

---

### 4. `server/pptx-generator.py`
Script Python per generazione PDF. **NON MODIFICARE LO SHEBANG O IL FLAG -I!**

```python
#!/usr/bin/python3.11
# ↑ CRITICO: Usare python3.11 esplicito, NON /usr/bin/env python3

import json
import sys
from pptx import Presentation
import subprocess

def main():
    # 1. Leggi dati da JSON
    with open(sys.argv[1], 'r') as f:
        data = json.load(f)
    
    # 2. Carica template PowerPoint
    prs = Presentation('server/template-report.pptx')
    
    # 3. Sostituisci placeholder
    for slide in prs.slides:
        for shape in slide.shapes:
            if hasattr(shape, 'text'):
                shape.text = shape.text.replace('{{NOME}}', data['nome'])
                shape.text = shape.text.replace('{{VALORE}}', f"€{data['valoreTotale']:,}")
                # ... altri placeholder
    
    # 4. Salva PPTX modificato
    temp_pptx = sys.argv[2].replace('.pdf', '.pptx')
    prs.save(temp_pptx)
    
    # 5. Converti PPTX → PDF con LibreOffice
    subprocess.run([
        'libreoffice',
        '--headless',
        '--convert-to', 'pdf',
        '--outdir', os.path.dirname(sys.argv[2]),
        temp_pptx
    ], check=True)
    
    # 6. Cleanup PPTX temporaneo
    os.remove(temp_pptx)

if __name__ == '__main__':
    main()
```

**Dipendenze Python**: python-pptx, LibreOffice (già installati nel sistema)

---

### 5. `todo.md`
**STORICO COMPLETO DI TUTTE LE MODIFICHE**. Leggi questo file per capire:
- Quali problemi sono stati risolti
- Quali ottimizzazioni sono state applicate
- Quali feature sono state implementate
- Backtest e risultati accuratezza

**Formato**: Checklist markdown con sezioni cronologiche.

---

## 🚀 Workflow Operativo

### Modificare Prezzi al mq
1. Apri `client/src/data/localita.ts`
2. Modifica `PREZZI_MQ[comune][localita]`
3. Salva e testa con una valutazione di prova
4. Esegui backtest su annunci reali (vedi sezione Backtest)

### Aggiungere Nuova Località
1. Apri `client/src/data/localita.ts`
2. Aggiungi località a `LOCALITA_PER_COMUNE[comune]`
3. Aggiungi prezzo a `PREZZI_MQ[comune][nuovaLocalita]`
4. Testa form valutazione (dropdown deve mostrare nuova località)

### Modificare Algoritmo Valutazione
1. Apri `server/valutazione-engine.ts`
2. Modifica logica in `calcolaValutazione()`
3. Esegui test: `pnpm test server/valutazione-engine.test.ts`
4. Esegui backtest su annunci reali
5. Verifica accuratezza (target: errore medio <35%, accuratezza ±20% >50%)

### Modificare Template PDF
1. Apri `server/template-report.pptx` con PowerPoint/LibreOffice
2. Modifica design mantenendo placeholder `{{NOME}}`, `{{VALORE}}`, ecc.
3. Salva template
4. Aggiorna `server/pptx-generator.py` se aggiungi nuovi placeholder
5. Testa generazione PDF end-to-end

### Debugging Generazione PDF
1. Controlla log server: `pnpm dev` (cerca `[PDF]` nei log)
2. Verifica file temporanei: `ls -lh /home/ubuntu/valutatore-immobiliare-elba/server/temp/`
3. Testa script Python standalone:
   ```bash
   cd /home/ubuntu/valutatore-immobiliare-elba
   /usr/bin/python3.11 -I server/pptx-generator.py \
     server/temp/test.json \
     server/temp/test.pdf
   ```
4. Verifica LibreOffice: `libreoffice --version`

### Eseguire Backtest
1. Crea file `backtest-annunci.json` con annunci reali:
   ```json
   [
     {
       "riferimento": "Rif. 123",
       "comune": "Capoliveri",
       "localita": "Centro",
       "tipologia": "appartamento",
       "superficieAbitabile": 80,
       "prezzoReale": 280000,
       ...
     }
   ]
   ```
2. Esegui script backtest: `pnpm test:backtest`
3. Analizza risultati in `backtest-report.csv`
4. Target: errore medio <35%, accuratezza ±20% >50%

---

## 🔐 Secrets e Configurazione

### Environment Variables (già configurate)
- `DATABASE_URL`: MySQL/TiDB connection string
- `JWT_SECRET`: Session cookie signing
- `SENDGRID_API_KEY`: SendGrid per email
- `SENDGRID_FROM_EMAIL`: Email mittente
- `OWNER_EMAIL`: Email proprietario (riceve notifiche lead)
- `VITE_APP_TITLE`: "Valutatore Immobiliare Elba"
- `VITE_APP_LOGO`: Logo RE/MAX

**NON MODIFICARE** questi secrets direttamente nel codice. Usa Management UI → Settings → Secrets.

---

## 📊 Metriche e KPI

### Accuratezza Valutazioni
- **Target**: Errore medio <35%, accuratezza ±20% >50%
- **Attuale**: Errore medio 30.4%, accuratezza ±20% = 60%
- **Metodo**: Backtest su 15 annunci reali

### Conversione Lead
- **Funnel**: Valutazione → Risultati → Form Lead → Download PDF
- **Tracking**: Dashboard admin `/admin/leads`
- **Metriche**: Totale lead, comune più attivo, trend mensile

### Performance
- **Tempo generazione PDF**: 10-15 secondi (normale per conversione LibreOffice)
- **Tempo calcolo valutazione**: <1 secondo

---

## ⚠️ Problemi Noti e Limitazioni

### 1. Immobili >300mq
**Problema**: Algoritmo tende a sovrastimare ville molto grandi (>300mq).

**Workaround Attuale**: 
- Alert arancione prominente nella pagina risultati per immobili >200mq
- CTA "Richiedi Valutazione Personalizzata" via WhatsApp

**Soluzione Futura**: Implementare curva di sconto più aggressiva per immobili >300mq.

---

### 2. Immobili Multi-Unità
**Problema**: Immobili con 5+ unità abitative (es. villa 210 Lacona con 5 appartamenti) non sono gestiti correttamente.

**Workaround Attuale**: Alert >200mq copre anche questi casi.

**Soluzione Futura**: Aggiungere campo "numero unità abitative" nel form e applicare sconto specifico.

---

### 3. Località Senza Dati
**Problema**: Alcune località minori potrebbero non avere dati di mercato sufficienti.

**Workaround Attuale**: Usare prezzo medio del comune.

**Soluzione Futura**: Implementare fallback intelligente basato su località simili.

---

### 4. Generazione PDF Lenta
**Problema**: Conversione PowerPoint → PDF con LibreOffice richiede 10-15 secondi.

**Workaround Attuale**: Loading state nel frontend ("Generazione in corso...").

**Soluzione Futura**: 
- Implementare caching PDF per valutazioni identiche
- Valutare alternative a LibreOffice (es. servizi cloud come CloudConvert)

---

## 🧪 Testing

### Test Esistenti
- `server/auth.logout.test.ts`: Test autenticazione
- `server/pdf-generation.test.ts`: Test end-to-end generazione PDF
- `server/valutazione-engine.test.ts`: Test algoritmo valutazione

### Eseguire Test
```bash
cd /home/ubuntu/valutatore-immobiliare-elba
pnpm test                    # Tutti i test
pnpm test pdf-generation     # Solo test PDF
pnpm test valutazione        # Solo test algoritmo
```

### Test Manuali Consigliati
1. **Form valutazione completo**: Compila tutti i 6 step e verifica calcolo
2. **Download PDF**: Compila form lead e verifica download PDF
3. **Dashboard admin**: Accedi come admin e verifica visualizzazione lead
4. **Email notifica**: Verifica ricezione email dopo creazione lead

---

## 📚 Risorse e Documentazione

### Repository GitHub
https://github.com/francescoprincipe-remax/valutatore-immobiliare-elba

**Branch**: `main` (production)

**Sync**: Automatico dopo ogni checkpoint Manus

### Sito Live
https://valutator-asn5tjzf.manus.space

**Management UI**: Accessibile dal pannello Manus (Preview, Database, Settings, ecc.)

### Documentazione Template
- **README.md**: Template tRPC + Manus Auth + Database
- **todo.md**: Storico completo modifiche (LEGGI QUESTO!)
- **AI-HANDOFF-PROMPT.md**: Questo file

### Contatti
- **Cliente**: Francesco Principe - RE/MAX Mindset
- **WhatsApp**: https://wa.me/message/4K6JSOQWVOTRL1
- **Email**: (vedi OWNER_EMAIL in secrets)

---

## 🎯 Prossimi Passi Consigliati

### Breve Termine (1-2 settimane)
1. **Monitorare conversione lead**: Analizzare dashboard admin per identificare pattern
2. **A/B testing CTA**: Testare varianti form lead per aumentare conversioni
3. **Ottimizzare template PDF**: Aggiungere grafici, personalizzare branding

### Medio Termine (1-2 mesi)
1. **Implementare caching PDF**: Ridurre tempo generazione per valutazioni identiche
2. **Aggiungere località**: Espandere database con nuove zone
3. **Migliorare algoritmo**: Raffinare regole per immobili >300mq e multi-unità

### Lungo Termine (3-6 mesi)
1. **Integrazione CRM**: Sincronizzare lead con CRM RE/MAX
2. **Dashboard analytics avanzata**: Grafici conversione, heatmap località, trend prezzi
3. **Versione mobile app**: PWA o app nativa per iOS/Android

---

## 🚨 CHECKLIST PRE-MODIFICA

Prima di modificare qualsiasi file critico, verifica:

- [ ] Ho letto `todo.md` per capire lo storico modifiche?
- [ ] Ho capito l'impatto della modifica sull'algoritmo di valutazione?
- [ ] Ho eseguito test locali prima di committare?
- [ ] Ho eseguito backtest se ho modificato prezzi/algoritmo?
- [ ] Ho aggiornato `todo.md` con le modifiche?
- [ ] Ho salvato checkpoint Manus prima di modifiche critiche?
- [ ] Ho sincronizzato con GitHub dopo modifiche importanti?

---

## 🆘 Troubleshooting Rapido

### Errore "Errore durante la generazione del PDF"
1. Verifica log server: cerca `[PDF]` nei log
2. Controlla che Python sia eseguito con flag `-I`: `ps aux | grep python`
3. Testa script Python standalone (vedi sezione Debugging)
4. Verifica LibreOffice: `libreoffice --version`

### Valori €0 nella pagina risultati
1. Apri console browser (F12)
2. Cerca errori JavaScript
3. Verifica che `valutazioneId` sia salvato in sessionStorage
4. Controlla endpoint `calcola` restituisca `valutazioneId`

### Lead non salvati nel database
1. Verifica console browser per errori tRPC
2. Controlla log server per errori database
3. Verifica schema database: `pnpm db:push`
4. Testa endpoint `lead.create` manualmente

### Email non ricevute
1. Verifica `SENDGRID_API_KEY` in secrets
2. Controlla log server per errori SendGrid
3. Verifica email mittente sia verificata in SendGrid
4. Testa invio email standalone: `pnpm test:email`

---

## 📞 Supporto

Se hai domande o problemi:

1. **Leggi `todo.md`**: Probabilmente il problema è già stato risolto
2. **Cerca nei log**: Server logs contengono informazioni dettagliate
3. **Testa componenti singolarmente**: Isola il problema (frontend vs backend vs database)
4. **Consulta documentazione template**: README.md ha esempi e best practices

---

**Buon lavoro! 🚀**

Questo progetto è stato sviluppato con cura e attenzione ai dettagli. Mantieni lo stesso standard di qualità e documentazione.

---

*Ultimo aggiornamento: 24 Novembre 2025*  
*Checkpoint: cf705e2d*  
*Versione: 1.0.0*
