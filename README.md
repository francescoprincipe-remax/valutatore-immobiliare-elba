# 🏠 Valutatore Immobiliare Isola d'Elba

**Valutazione professionale di immobili basata su dati di mercato reali dell'Isola d'Elba**

---

## 🔗 Link Essenziali

### Per Nuove Chat / Sviluppatori

**Checkpoint Manus Corrente:**
```
manus-webdev://eb7536b7
```

**Repository GitHub:**
https://github.com/francescoprincipe-remax/valutatore-immobiliare-elba

**Sito Live:**
https://3000-ikihybht38uvcohx58p2v-3139bba0.manusvm.computer

**Sito Produzione:**
https://elba-value-aa6kavmf.manus.space

---

## 🚀 Quick Start per Nuove Chat

### 1. Ripristina Progetto

```bash
# La nuova chat deve eseguire:
webdev_rollback_checkpoint("eb7536b7")
```

### 2. Verifica Stato

```bash
webdev_check_status()
```

### 3. Inizia a Lavorare

Il progetto è pronto! Puoi:
- Modificare file in `/home/ubuntu/valutatore-immobiliare-elba`
- Testare su https://3000-ikihybht38uvcohx58p2v-3139bba0.manusvm.computer
- Salvare checkpoint con `webdev_save_checkpoint()`
- Pushare su GitHub con `git push origin main`

---

## 📦 Cosa Contiene

- ✅ **Bug valore €0 risolto** - Calcolo corretto per tutti i comuni
- ✅ **Prezzo Porto Azzurro** - Aggiornato a €3.200/mq
- ✅ **Prezzo/mq decrescente** - Sconto 5-15% oltre 60mq
- ✅ **Form lead PDF** - Nome, cognome, telefono
- ✅ **CTA WhatsApp** - Link: https://wa.me/message/4K6JSOQWVOTRL1
- ✅ **Watermark RE/MAX** - Logo ufficiale full-page
- ✅ **Sezione FAQ** - 12 domande frequenti
- ✅ **Footer legale** - Disclaimer professionale

---

## 🛠 Comandi Utili

```bash
# Sviluppo locale
cd /home/ubuntu/valutatore-immobiliare-elba
pnpm install
pnpm dev

# Database
pnpm db:push          # Applica schema
pnpm seed             # Popola dati mercato

# Test
pnpm test             # Esegui tutti i test
pnpm test:watch       # Watch mode

# Build
pnpm build            # Build produzione

# Git
git status            # Vedi modifiche
git add .             # Aggiungi tutto
git commit -m "..."   # Commit
git push origin main  # Push su GitHub
```

---

## 📝 File Importanti

### Backend
- `server/routers.ts` - API tRPC
- `server/valutazione-engine.ts` - Algoritmo calcolo
- `server/dati_mercato.json` - Prezzi comuni Elba
- `drizzle/schema.ts` - Schema database

### Frontend
- `client/src/pages/Home.tsx` - Homepage
- `client/src/pages/Valuta.tsx` - Form valutazione
- `client/src/pages/Risultato.tsx` - Pagina risultati
- `client/src/pages/FAQ.tsx` - Domande frequenti
- `client/src/components/RemaxWatermark.tsx` - Watermark logo

### Documentazione
- `CONTRIBUTING.md` - Guida collaboratori
- `DEPLOYMENT.md` - Guida deployment
- `LICENSE` - Licenza proprietaria
- `todo.md` - Task completati/da fare

---

## 🔐 Secrets Configurati

Già disponibili automaticamente:
- `DATABASE_URL` - TiDB connection
- `JWT_SECRET` - Session signing
- `VITE_APP_TITLE` - Valutatore Immobiliare Elba
- `VITE_APP_LOGO` - /remax-logo-watermark.png
- `OWNER_NAME` - Francesco Principe

---

## 📊 Stato Progetto

**Ultima Modifica:** 2025-01-20  
**Checkpoint:** eb7536b7  
**Versione:** 1.0.0  
**Stato:** ✅ Produzione

**Funzionalità Completate:**
- [x] Algoritmo valutazione con 50+ parametri
- [x] 8 comuni Elba con prezzi aggiornati
- [x] Form multi-step con validazione
- [x] Report PDF professionale
- [x] Form lead per download PDF
- [x] CTA WhatsApp personalizzate
- [x] Sezione FAQ
- [x] Watermark RE/MAX ufficiale
- [x] Footer legale professionale
- [x] GDPR banner e privacy policy
- [x] Responsive design
- [x] Test completi (6/6 passano)

---

## 🎯 Per Modifiche Rapide

### Cambiare Prezzi Comuni

Modifica `server/dati_mercato.json`:
```json
{
  "comuni": {
    "porto_azzurro": {
      "localita": {
        "centro": {
          "prezzo_mq": 3200  // ← Modifica qui
        }
      }
    }
  }
}
```

### Cambiare Link WhatsApp

Cerca `https://wa.me/message/4K6JSOQWVOTRL1` e sostituisci in:
- `client/src/pages/Risultato.tsx`
- `client/src/pages/Home.tsx`

### Aggiungere FAQ

Modifica `client/src/pages/FAQ.tsx` array `faqs`:
```typescript
{
  domanda: "Nuova domanda?",
  risposta: "Risposta dettagliata..."
}
```

---

## 📞 Contatti

**Proprietario:** Francesco Principe  
**WhatsApp:** https://wa.me/message/4K6JSOQWVOTRL1  
**GitHub:** https://github.com/francescoprincipe-remax

---

## 📄 Licenza

Copyright © 2025 Francesco Principe - Agenzia Immobiliare RE/MAX

Tutti i diritti riservati. Vedi [LICENSE](LICENSE) per dettagli.

---

**🚀 Pronto per lavorare! Qualsiasi nuova chat può partire da qui.**
