# Valutatore Immobiliare Isola d'Elba - TODO

## Setup Iniziale
- [x] Copia file dal repository GitHub
- [x] Configurazione database schema
- [x] Setup algoritmo valutazione
- [x] Configurazione generazione PDF

## Feature Frontend
- [x] Homepage con form valutazione
- [x] Interfaccia inserimento dati immobile
- [x] Visualizzazione risultati valutazione
- [x] Download PDF personalizzato

## Feature Backend
- [x] Algoritmo valutazione con variazioni per tipologia
- [x] Sistema generazione PDF con python-pptx
- [x] Gestione lead nel database
- [x] Invio notifiche email

## Dati e Configurazione
- [ ] Database prezzi al mq per 73 località
- [ ] Variazioni prezzo per tipologia (bilocale, trilocale, etc.)
- [ ] Template PowerPoint per PDF
- [ ] Punti di forza dinamici

## Testing e Deploy
- [ ] Test generazione PDF
- [ ] Test algoritmo valutazione
- [ ] Checkpoint finale
- [ ] Deploy in produzione


## Replica Completa da GitHub
- [x] Download codice aggiornato da GitHub
- [x] Copia tutti i componenti frontend
- [x] Copia tutti i flussi e logiche backend
- [x] Fix errori TypeScript
- [x] Verifica funzionamento completo


## Bug da Risolvere
- [x] Errore generazione PDF quando utente compila form e clicca "Scarica PDF" (dipendenze installate)
- [x] Calcoli errati algoritmo valutazione:
  - [x] Valore pertinenze troppo alto (€707k per attico 120mq) - RISOLTO con prezzi fissi
  - [x] Sostituiti coefficienti percentuali con prezzi fissi al mq
  - [x] Giardino: €60/mq, Terrazzo: €80/mq, Box: €20k
  - [x] Piscina privata: +€25k (condominiale: €0)
  - [ ] Distanza mare mostra valori strani (2323m) - da verificare frontend

- [x] Errore generazione PDF in produzione - RISOLTO DEFINITIVAMENTE:
  - [x] Errore LibreOffice "failed to launch javaldx" - RISOLTO
  - [x] Modificato script Python per ignorare warning su stderr
  - [x] Controlla solo return code di LibreOffice
  - [x] Aggiunto logging dettagliato nell'endpoint generatePDF
  - [x] Server riavviato e testato end-to-end
  - [x] Test conversione PPTX → PDF - OK (1.6MB PDF generato)


## Documentazione e Handoff
- [ ] Aggiornare GitHub con tutti i file del progetto
- [ ] Creare AI-HANDOFF-PROMPT.md completo per replica
- [ ] Includere credenziali e configurazioni necessarie
- [ ] Testare che il prompt funzioni per replica da zero
