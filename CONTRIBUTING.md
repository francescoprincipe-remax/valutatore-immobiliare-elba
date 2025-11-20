# 🤝 Guida per Collaboratori

Grazie per l'interesse nel contribuire al Valutatore Immobiliare Elba! Questa guida ti aiuterà a iniziare.

---

## 📋 Indice

- [Codice di Condotta](#codice-di-condotta)
- [Come Contribuire](#come-contribuire)
- [Setup Ambiente Sviluppo](#setup-ambiente-sviluppo)
- [Workflow Git](#workflow-git)
- [Standard Codice](#standard-codice)
- [Testing](#testing)
- [Documentazione](#documentazione)
- [Pull Request](#pull-request)

---

## 📜 Codice di Condotta

### I Nostri Impegni

- Rispetto reciproco
- Comunicazione costruttiva
- Focus sulla qualità del codice
- Collaborazione aperta

### Comportamenti Inaccettabili

- Linguaggio offensivo o discriminatorio
- Attacchi personali
- Spam o autopromozione
- Violazione della privacy

---

## 🚀 Come Contribuire

### Tipi di Contributi

1. **Bug Fix** - Correzione errori esistenti
2. **Feature** - Nuove funzionalità
3. **Documentazione** - Miglioramenti README, commenti, guide
4. **Test** - Aggiunta o miglioramento test
5. **Performance** - Ottimizzazioni
6. **Refactoring** - Miglioramento codice esistente

### Prima di Iniziare

1. **Cerca Issue Esistenti**: Verifica se qualcuno sta già lavorando su qualcosa di simile
2. **Apri Issue**: Per feature importanti, apri prima un'issue per discutere
3. **Assegnati**: Commenta l'issue per farti assegnare il lavoro

---

## 💻 Setup Ambiente Sviluppo

### Prerequisiti

- Node.js 22+
- pnpm 9+
- MySQL 8+ o TiDB
- Git
- Editor: VS Code (consigliato)

### Setup Iniziale

```bash
# 1. Fork repository su GitHub

# 2. Clona il tuo fork
git clone https://github.com/tuo-username/valutatore-immobiliare-elba.git
cd valutatore-immobiliare-elba

# 3. Aggiungi upstream remote
git remote add upstream https://github.com/francesco-principe/valutatore-immobiliare-elba.git

# 4. Installa dipendenze
pnpm install

# 5. Copia .env.example
cp .env.example .env

# 6. Configura database locale
# Modifica .env con le tue credenziali MySQL

# 7. Setup database
pnpm db:push
pnpm seed

# 8. Avvia server sviluppo
pnpm dev
```

### VS Code Extensions Consigliate

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- GitLens
- Error Lens

---

## 🌿 Workflow Git

### Branching Strategy

```
main (produzione)
  └── develop (sviluppo)
       ├── feature/nome-feature
       ├── fix/nome-bug
       └── docs/nome-doc
```

### Creare Branch Feature

```bash
# 1. Aggiorna develop
git checkout develop
git pull upstream develop

# 2. Crea branch feature
git checkout -b feature/nome-feature

# 3. Lavora sulla feature
# ... modifica file ...

# 4. Commit frequenti
git add .
git commit -m "feat: descrizione breve"

# 5. Push al tuo fork
git push origin feature/nome-feature

# 6. Apri Pull Request su GitHub
```

### Convenzioni Commit

Usiamo [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: Nuova feature
- `fix`: Bug fix
- `docs`: Documentazione
- `style`: Formattazione (non cambia logica)
- `refactor`: Refactoring codice
- `test`: Aggiunta/modifica test
- `chore`: Manutenzione (build, deps, etc.)
- `perf`: Performance improvement

**Esempi:**

```bash
feat(valutazione): aggiungi calcolo prezzo/mq decrescente

fix(risultato): correggi visualizzazione valore €0

docs(readme): aggiorna istruzioni installazione

test(engine): aggiungi test per Porto Azzurro

refactor(db): ottimizza query valutazioni
```

---

## 📐 Standard Codice

### TypeScript

```typescript
// ✅ BUONO
interface DatiImmobile {
  comune: string;
  superficie: number;
  vistaMare: boolean;
}

function calcolaValore(dati: DatiImmobile): number {
  return dati.superficie * 3000;
}

// ❌ CATTIVO
function calcola(d: any) {
  return d.s * 3000;
}
```

### React Components

```typescript
// ✅ BUONO - Functional component con TypeScript
interface Props {
  valore: number;
  onClose: () => void;
}

export default function RisultatoCard({ valore, onClose }: Props) {
  return (
    <div className="card">
      <h2>Valore: €{valore.toLocaleString()}</h2>
      <button onClick={onClose}>Chiudi</button>
    </div>
  );
}

// ❌ CATTIVO - Senza tipi
export default function RisultatoCard(props) {
  return <div>{props.valore}</div>;
}
```

### Tailwind CSS

```tsx
// ✅ BUONO - Classi semantiche
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">Titolo</h2>
</div>

// ❌ CATTIVO - Troppi valori arbitrari
<div className="flex items-center justify-between p-[17px] bg-[#ffffff] rounded-[8px]">
  <h2 className="text-[21px] font-[700] text-[#111111]">Titolo</h2>
</div>
```

### tRPC Procedures

```typescript
// ✅ BUONO - Input validato con Zod
import { z } from "zod";

export const valutazioneRouter = router({
  calcola: publicProcedure
    .input(
      z.object({
        comune: z.string().min(1),
        superficie: z.number().positive(),
        vistaMare: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const risultato = calcolaValutazione(input);
      return risultato;
    }),
});

// ❌ CATTIVO - Senza validazione
export const valutazioneRouter = router({
  calcola: publicProcedure.mutation(async ({ input }) => {
    return calcolaValutazione(input);
  }),
});
```

### Naming Conventions

```typescript
// Variabili e funzioni: camelCase
const valoreTotale = 100000;
function calcolaValore() {}

// Componenti React: PascalCase
function RisultatoCard() {}

// Costanti: UPPER_SNAKE_CASE
const MAX_SUPERFICIE = 1000;

// File: kebab-case
// valutazione-engine.ts
// risultato-card.tsx
```

---

## 🧪 Testing

### Scrivere Test

Ogni feature DEVE avere test corrispondenti.

```typescript
import { describe, expect, it } from "vitest";
import { calcolaValutazione } from "./valutazione-engine";

describe("Valutazione Immobili", () => {
  describe("Porto Azzurro", () => {
    it("dovrebbe calcolare correttamente appartamento 90mq", () => {
      const dati = {
        comune: "Porto Azzurro",
        localita: "Centro",
        tipologia: "appartamento" as const,
        superficie: 90,
        locali: 3,
        bagni: 2,
        statoManutenzione: "buono" as const,
        piano: "2",
        vistaMare: true,
        // ... altri parametri
      };

      const risultato = calcolaValutazione(dati);

      expect(risultato.valoreTotale).toBeGreaterThan(0);
      expect(risultato.prezzoMqZona).toBe(3200);
      expect(risultato.competitivita).toBe("MEDIA");
    });

    it("dovrebbe applicare sconto per superfici grandi", () => {
      const dati50mq = { ...datiBase, superficie: 50 };
      const dati150mq = { ...datiBase, superficie: 150 };

      const risultato50 = calcolaValutazione(dati50mq);
      const risultato150 = calcolaValutazione(dati150mq);

      const prezzoMq50 = risultato50.valoreBase / 50;
      const prezzoMq150 = risultato150.valoreBase / 150;

      expect(prezzoMq150).toBeLessThan(prezzoMq50);
    });
  });
});
```

### Eseguire Test

```bash
# Tutti i test
pnpm test

# Test specifico
pnpm test valutazione-engine

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

### Coverage Minimo

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

---

## 📚 Documentazione

### Commenti Codice

```typescript
/**
 * Calcola il valore di un immobile basandosi su dati di mercato reali.
 *
 * L'algoritmo considera oltre 50 parametri tra cui:
 * - Localizzazione (comune, località, distanza mare)
 * - Caratteristiche fisiche (superficie, locali, piano)
 * - Stato e finiture (manutenzione, classe energetica)
 * - Vista e posizione (mare, monti, esposizione)
 *
 * @param dati - Dati completi dell'immobile
 * @returns Risultato valutazione con valore stimato e breakdown
 *
 * @example
 * ```typescript
 * const risultato = calcolaValutazione({
 *   comune: "Porto Azzurro",
 *   superficie: 90,
 *   vistaMare: true,
 *   // ...
 * });
 * console.log(risultato.valoreTotale); // €287.370
 * ```
 */
export function calcolaValutazione(dati: DatiImmobile): RisultatoValutazione {
  // Implementazione...
}
```

### README

Aggiorna README.md quando:
- Aggiungi nuova feature importante
- Cambi processo installazione/setup
- Aggiungi nuove dipendenze
- Modifichi API pubbliche

---

## 🔄 Pull Request

### Checklist PR

Prima di aprire una PR, verifica:

- [ ] Codice compila senza errori (`pnpm build`)
- [ ] Tutti i test passano (`pnpm test`)
- [ ] Lint passa (`pnpm lint`)
- [ ] Codice formattato (`pnpm format`)
- [ ] Documentazione aggiornata
- [ ] Commit seguono convenzioni
- [ ] Branch aggiornato con develop
- [ ] Nessun file sensibile committato (.env, secrets)

### Template PR

```markdown
## Descrizione

Breve descrizione delle modifiche.

## Tipo di Cambiamento

- [ ] Bug fix
- [ ] Nuova feature
- [ ] Breaking change
- [ ] Documentazione

## Motivazione

Perché questa modifica è necessaria?

## Testing

Come hai testato le modifiche?

- [ ] Test unitari aggiunti/aggiornati
- [ ] Test manuali eseguiti
- [ ] Screenshot (se UI)

## Checklist

- [ ] Codice compila
- [ ] Test passano
- [ ] Documentazione aggiornata
- [ ] Commit convenzionali
```

### Review Process

1. **Apri PR** dal tuo fork al repository upstream
2. **CI/CD** esegue automaticamente test e lint
3. **Code Review** da maintainer (1-3 giorni)
4. **Richieste Modifiche** - implementa feedback
5. **Approvazione** - PR viene mergiata
6. **Deploy** - modifiche vanno in produzione

### Dopo il Merge

```bash
# Aggiorna il tuo fork
git checkout develop
git pull upstream develop
git push origin develop

# Elimina branch feature locale
git branch -d feature/nome-feature

# Elimina branch feature remoto
git push origin --delete feature/nome-feature
```

---

## 🐛 Segnalare Bug

### Template Issue Bug

```markdown
**Descrizione Bug**
Descrizione chiara e concisa del bug.

**Riprodurre**
Passi per riprodurre:
1. Vai su '...'
2. Clicca su '...'
3. Scroll fino a '...'
4. Vedi errore

**Comportamento Atteso**
Cosa ti aspettavi che succedesse.

**Screenshot**
Se applicabile, aggiungi screenshot.

**Ambiente**
- OS: [es. macOS 14.0]
- Browser: [es. Chrome 120]
- Versione Node: [es. 22.0.0]

**Contesto Aggiuntivo**
Altre informazioni rilevanti.
```

---

## 💡 Proporre Feature

### Template Issue Feature

```markdown
**Problema da Risolvere**
Descrizione chiara del problema che la feature risolverebbe.

**Soluzione Proposta**
Descrizione della soluzione che vorresti implementare.

**Alternative Considerate**
Altre soluzioni che hai considerato.

**Contesto Aggiuntivo**
Screenshot, mockup, esempi di altri progetti.
```

---

## 📞 Supporto

Hai domande? Contattaci:

- **GitHub Discussions**: [link]
- **Email**: [email]
- **WhatsApp**: https://wa.me/message/4K6JSOQWVOTRL1

---

## 🙏 Grazie!

Ogni contributo, grande o piccolo, è apprezzato. Grazie per aiutarci a migliorare il Valutatore Immobiliare Elba!

---

**Happy Coding! 🚀**
