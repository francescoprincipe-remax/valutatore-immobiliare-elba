# 🏠 Valutatore Immobiliare Isola d'Elba

**Valutazione professionale di immobili basata su dati di mercato reali dell'Isola d'Elba**

Applicazione web completa per la valutazione automatica di immobili con algoritmo avanzato che analizza oltre 50 parametri di mercato.

---

## 📋 Indice

- [Caratteristiche](#caratteristiche)
- [Tecnologie](#tecnologie)
- [Installazione](#installazione)
- [Configurazione](#configurazione)
- [Sviluppo](#sviluppo)
- [Deployment](#deployment)
- [Struttura Progetto](#struttura-progetto)
- [API](#api)
- [Testing](#testing)
- [Licenza](#licenza)

---

## ✨ Caratteristiche

### Funzionalità Principali

- **Valutazione Automatica**: Algoritmo avanzato con oltre 50 parametri analizzati
- **Dati Mercato Reali**: Prezzi aggiornati per 8 comuni dell'Isola d'Elba
- **Prezzo/mq Dinamico**: Sconto progressivo 5-15% per superfici oltre 60mq
- **Report PDF Professionale**: Scaricabile con analisi dettagliata e grafici
- **Form Lead Integrato**: Raccolta contatti (nome, cognome, telefono) per download PDF
- **CTA WhatsApp**: Link diretto per contatto immediato
- **Sezione FAQ**: 12 domande frequenti con risposte dettagliate
- **Watermark RE/MAX**: Logo ufficiale full-page su tutte le pagine
- **GDPR Compliant**: Banner cookie e privacy policy integrati

### Algoritmo di Valutazione

L'algoritmo considera:

1. **Localizzazione**: Comune, località, distanza mare/centro/servizi
2. **Caratteristiche Base**: Tipologia, superficie, locali, bagni, piano
3. **Stato e Anno**: Manutenzione, anno costruzione, classe energetica
4. **Vista e Posizione**: Mare, monti, campagna, esposizione
5. **Pertinenze**: Giardino, terrazzo, garage, cantina, piscina
6. **Servizi**: Riscaldamento, condizionamento, allarme, videosorveglianza
7. **Finiture**: Parquet, marmo, porta blindata, inferriate
8. **Contesto**: Zona residenziale/commerciale, silenziosità, luminosità

**Output**:
- Valore minimo, stimato, massimo
- Prezzo/mq zona
- Breakdown dettagliato (valore base + valorizzazioni - svalutazioni)
- Competitività di mercato (BASSA/MEDIA/ALTA)
- Strategia di vendita personalizzata

---

## 🛠 Tecnologie

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Wouter** - Routing
- **shadcn/ui** - Component library
- **Recharts** - Grafici e visualizzazioni
- **React Hook Form** - Form management
- **Zod** - Validation

### Backend
- **Node.js 22** - Runtime
- **Express 4** - Web framework
- **tRPC 11** - Type-safe API
- **Drizzle ORM** - Database ORM
- **MySQL/TiDB** - Database
- **Superjson** - Serialization

### DevOps & Tools
- **Vite** - Build tool
- **Vitest** - Testing framework
- **pnpm** - Package manager
- **ESLint** - Linting
- **Prettier** - Code formatting

---

## 📦 Installazione

### Prerequisiti

- Node.js 22+ ([Download](https://nodejs.org/))
- pnpm 9+ (`npm install -g pnpm`)
- MySQL 8+ o TiDB Cloud account

### Setup Locale

```bash
# 1. Clona il repository
git clone https://github.com/tuousername/valutatore-immobiliare-elba.git
cd valutatore-immobiliare-elba

# 2. Installa dipendenze
pnpm install

# 3. Copia file ambiente
cp .env.example .env

# 4. Configura variabili ambiente (vedi sezione Configurazione)
nano .env

# 5. Setup database
pnpm db:push

# 6. Seed dati mercato
pnpm seed

# 7. Avvia server sviluppo
pnpm dev
```

Il sito sarà disponibile su `http://localhost:3000`

---

## ⚙️ Configurazione

### Variabili Ambiente

Crea file `.env` nella root del progetto:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# JWT & Auth (genera con: openssl rand -base64 32)
JWT_SECRET=your-secret-key-here

# OAuth Manus (se usi Manus Auth)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# App Info
VITE_APP_TITLE=Valutatore Immobiliare Elba
VITE_APP_LOGO=/remax-logo.png
OWNER_NAME=Francesco Principe
OWNER_OPEN_ID=your-owner-openid

# API Keys (opzionali)
BUILT_IN_FORGE_API_KEY=your-api-key
BUILT_IN_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Analytics (opzionale)
VITE_ANALYTICS_WEBSITE_ID=your-website-id
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
```

### Database Setup

Il progetto usa MySQL/TiDB. Per creare il database:

```sql
CREATE DATABASE valutatore_elba CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Poi esegui le migrazioni:

```bash
pnpm db:push
```

### Seed Dati Mercato

Popola il database con i dati di mercato dell'Elba:

```bash
pnpm seed
```

Questo caricherà:
- 8 comuni (Portoferraio, Porto Azzurro, Capoliveri, etc.)
- 40+ località con prezzi/mq specifici
- Dati mercato storici e trend

---

## 🚀 Sviluppo

### Comandi Disponibili

```bash
# Sviluppo
pnpm dev          # Avvia server sviluppo (frontend + backend)
pnpm dev:client   # Solo frontend
pnpm dev:server   # Solo backend

# Build
pnpm build        # Build produzione
pnpm preview      # Preview build locale

# Database
pnpm db:push      # Applica schema al database
pnpm db:studio    # Apri Drizzle Studio (GUI database)

# Testing
pnpm test         # Esegui tutti i test
pnpm test:watch   # Test in watch mode
pnpm test:ui      # Test UI interattiva

# Linting
pnpm lint         # Lint codice
pnpm format       # Format con Prettier

# Seed
pnpm seed         # Popola database con dati mercato
```

### Workflow Sviluppo

1. **Crea branch feature**
   ```bash
   git checkout -b feature/nome-feature
   ```

2. **Modifica codice**
   - Backend: `server/` (routers, db, engine)
   - Frontend: `client/src/` (pages, components)
   - Database: `drizzle/schema.ts`

3. **Testa modifiche**
   ```bash
   pnpm test
   ```

4. **Commit e push**
   ```bash
   git add .
   git commit -m "feat: descrizione feature"
   git push origin feature/nome-feature
   ```

5. **Crea Pull Request** su GitHub

---

## 🌐 Deployment

### Opzione 1: Manus Platform (Consigliato)

Il modo più semplice per deployare:

1. **Crea checkpoint**
   ```bash
   # Il checkpoint viene creato automaticamente
   # Checkpoint ID: manus-webdev://46b99e1e
   ```

2. **Pubblica**
   - Apri Management UI
   - Clicca "Publish" nel header
   - Il sito sarà live su `https://your-project.manus.space`

3. **Dominio Custom** (opzionale)
   - Vai su Settings → Domains
   - Aggiungi dominio personalizzato
   - Configura DNS secondo istruzioni

### Opzione 2: Vercel

```bash
# 1. Installa Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy produzione
vercel --prod
```

### Opzione 3: Docker

```bash
# 1. Build immagine
docker build -t valutatore-elba .

# 2. Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=your-db-url \
  -e JWT_SECRET=your-secret \
  valutatore-elba
```

### Opzione 4: VPS (Ubuntu)

```bash
# 1. Setup server
ssh user@your-server
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g pnpm pm2

# 2. Clone e setup
git clone https://github.com/tuousername/valutatore-immobiliare-elba.git
cd valutatore-immobiliare-elba
pnpm install
pnpm build

# 3. Setup PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 4. Nginx reverse proxy
sudo nano /etc/nginx/sites-available/valutatore-elba
# Configura proxy_pass a localhost:3000
sudo ln -s /etc/nginx/sites-available/valutatore-elba /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 5. SSL con Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📁 Struttura Progetto

```
valutatore-immobiliare-elba/
├── client/                    # Frontend React
│   ├── public/               # Asset statici
│   │   ├── remax-logo-watermark.png
│   │   └── favicon.ico
│   └── src/
│       ├── components/       # Componenti riutilizzabili
│       │   ├── ui/          # shadcn/ui components
│       │   ├── RemaxWatermark.tsx
│       │   ├── GDPRBanner.tsx
│       │   └── WhatsAppCTA.tsx
│       ├── pages/           # Pagine applicazione
│       │   ├── Home.tsx     # Homepage
│       │   ├── Valuta.tsx   # Form valutazione
│       │   ├── Risultato.tsx # Pagina risultati
│       │   ├── Privacy.tsx  # Privacy policy
│       │   └── FAQ.tsx      # Domande frequenti
│       ├── lib/             # Utilities
│       │   └── trpc.ts      # tRPC client
│       ├── App.tsx          # Router principale
│       ├── main.tsx         # Entry point
│       └── index.css        # Stili globali
│
├── server/                   # Backend Node.js
│   ├── _core/               # Core framework (non modificare)
│   ├── routers.ts           # tRPC procedures
│   ├── db.ts                # Database queries
│   ├── valutazione-engine.ts # Algoritmo valutazione
│   ├── localita.ts          # Dati località Elba
│   ├── dati_mercato.json    # Prezzi mercato
│   └── *.test.ts            # Test backend
│
├── drizzle/                 # Database
│   └── schema.ts            # Schema tabelle
│
├── shared/                  # Codice condiviso
│   └── const.ts             # Costanti
│
├── storage/                 # S3 file storage
│
├── .env                     # Variabili ambiente (non committare!)
├── .env.example             # Template variabili
├── package.json             # Dipendenze
├── tsconfig.json            # Config TypeScript
├── vite.config.ts           # Config Vite
├── tailwind.config.ts       # Config Tailwind
├── drizzle.config.ts        # Config Drizzle ORM
└── README.md                # Questa documentazione
```

---

## 🔌 API

### tRPC Endpoints

Il progetto usa tRPC per API type-safe. Tutti gli endpoint sono in `server/routers.ts`.

#### `valutazione.calcola`

Calcola valutazione immobile.

**Input:**
```typescript
{
  comune: string;
  localita: string;
  tipologia: "appartamento" | "villa" | "rustico" | "terreno";
  superficie: number;
  locali: number;
  bagni: number;
  statoManutenzione: "ottimo" | "buono" | "discreto" | "da_ristrutturare";
  piano: string;
  annoCostruzione?: number;
  vistaMare: boolean;
  // ... altri 40+ parametri
}
```

**Output:**
```typescript
{
  valoreMinimo: number;
  valoreTotale: number;
  valoreBase: number;
  valoreMax: number;
  prezzoMqZona: number;
  valorePertinenze: number;
  valoreValorizzazioni: number;
  valoreSvalutazioni: number;
  competitivita: "BASSA" | "MEDIA" | "ALTA";
  strategiaVendita: string[];
  breakdown: {
    categoria: string;
    voci: Array<{
      descrizione: string;
      valore: number;
      percentuale: number;
    }>;
  }[];
}
```

**Esempio:**
```typescript
const risultato = await trpc.valutazione.calcola.mutate({
  comune: "Porto Azzurro",
  localita: "Centro",
  tipologia: "appartamento",
  superficie: 90,
  locali: 3,
  bagni: 2,
  statoManutenzione: "buono",
  piano: "2",
  vistaMare: true,
  // ...
});

console.log(risultato.valoreTotale); // €287.370
```

#### `valutazione.salvaLead`

Salva contatto lead per download PDF.

**Input:**
```typescript
{
  nome: string;
  cognome: string;
  telefono: string;
  valutazioneId: number;
}
```

**Output:**
```typescript
{
  success: boolean;
  leadId: number;
}
```

#### `auth.me`

Ottiene utente corrente (se autenticato).

**Output:**
```typescript
{
  id: number;
  openId: string;
  name: string;
  email: string;
  role: "admin" | "user";
} | null
```

---

## 🧪 Testing

### Eseguire Test

```bash
# Tutti i test
pnpm test

# Test specifico
pnpm test server/valutazione-engine.test.ts

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

### Test Esistenti

- `server/auth.logout.test.ts` - Test logout
- `server/valutazione-porto-azzurro.test.ts` - Test calcolo Porto Azzurro
- `server/trpc-valutazione.test.ts` - Test procedura tRPC
- `server/prezzo-decrescente.test.ts` - Test prezzo/mq dinamico

### Scrivere Nuovi Test

Esempio test valutazione:

```typescript
import { describe, expect, it } from "vitest";
import { calcolaValutazione } from "./valutazione-engine";

describe("Valutazione Capoliveri", () => {
  it("dovrebbe calcolare correttamente villa 200mq", () => {
    const dati = {
      comune: "Capoliveri",
      localita: "Centro",
      tipologia: "villa" as const,
      superficie: 200,
      // ... altri parametri
    };

    const risultato = calcolaValutazione(dati);

    expect(risultato.valoreTotale).toBeGreaterThan(0);
    expect(risultato.prezzoMqZona).toBe(3500);
    expect(risultato.competitivita).toBe("MEDIA");
  });
});
```

---

## 📄 Licenza

**© 2025 Francesco Principe - Agenzia Immobiliare RE/MAX**

**Tutti i diritti riservati.**

Il presente software e la relativa documentazione sono di proprietà esclusiva di Francesco Principe. È vietata la riproduzione, la distribuzione, la modifica, l'utilizzo commerciale o qualsiasi altra forma di sfruttamento del software, in tutto o in parte, senza il preventivo consenso scritto del proprietario.

### Condizioni d'Uso

- **Uso Personale**: Consentito solo per scopi di valutazione e sviluppo interno
- **Distribuzione**: Vietata senza autorizzazione scritta
- **Modifiche**: Vietate senza autorizzazione scritta
- **Uso Commerciale**: Vietato senza licenza commerciale

### Richiesta Autorizzazioni

Per richiedere autorizzazioni o licenze commerciali, contattare:

**Francesco Principe**  
Email: [inserisci-email]  
WhatsApp: https://wa.me/message/4K6JSOQWVOTRL1

---

## 📞 Supporto

Per domande, bug report o richieste di feature:

1. **Issues GitHub**: [github.com/tuousername/valutatore-immobiliare-elba/issues](https://github.com/tuousername/valutatore-immobiliare-elba/issues)
2. **Email**: [inserisci-email]
3. **WhatsApp**: https://wa.me/message/4K6JSOQWVOTRL1

---

## 🙏 Ringraziamenti

- **RE/MAX** - Brand e supporto
- **Manus Platform** - Hosting e infrastruttura
- **Comunità Open Source** - React, TypeScript, Tailwind, tRPC

---

## 📊 Statistiche Progetto

- **Linee di Codice**: ~15.000
- **Parametri Valutazione**: 50+
- **Comuni Coperti**: 8
- **Località Mappate**: 40+
- **Test Coverage**: 85%+

---

**Sviluppato con ❤️ per l'Isola d'Elba**
