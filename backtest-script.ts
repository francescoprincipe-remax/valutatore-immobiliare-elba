import { calcolaValutazione, type DatiImmobile } from './server/valutazione-engine';
import * as fs from 'fs';

// Leggi annunci reali
const annunci = JSON.parse(fs.readFileSync('backtest-annunci-reali.json', 'utf-8'));

// Funzione per mappare stato a formato algoritmo
function mappaStato(stato: string): string {
  const mapping: Record<string, string> = {
    'Ottimo': 'ottimo',
    'Ristrutturato': 'ottimo',
    'Buono': 'buono',
    'Medio': 'abitabile',
    'Da ristrutturare': 'da ristrutturare'
  };
  return mapping[stato] || 'buono';
}

// Funzione per mappare vista mare
function mappaVistaMare(vista: string | null): string | undefined {
  if (!vista) return undefined;
  if (vista.includes('panoramica')) return 'panoramica';
  if (vista.includes('totale')) return 'totale';
  if (vista.includes('aperta') || vista.includes('Si')) return 'da alcune stanze';
  return undefined;
}

// Funzione per normalizzare località
function normalizzaLocalita(localita: string): string {
  const mapping: Record<string, string> = {
    'Centro Storico': 'Centro',
    'Centro città': 'Centro',
    'Residenziale': 'Centro',
    'Periferia': 'Centro',
    'Via Morcone': 'Centro'
  };
  return mapping[localita] || localita;
}

console.log('='.repeat(80));
console.log('BACKTEST VALUTATORE IMMOBILIARE - CONFRONTO CON ANNUNCI REALI');
console.log('='.repeat(80));
console.log();

const risultati: any[] = [];

annunci.forEach((annuncio: any, index: number) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`ANNUNCIO ${index + 1}/${annunci.length} - ${annuncio.codice}`);
  console.log(`${'='.repeat(80)}`);
  
  console.log(`\n📍 DATI ANNUNCIO REALE:`);
  console.log(`   Comune: ${annuncio.comune} - ${annuncio.localita}`);
  console.log(`   Tipologia: ${annuncio.tipologia}`);
  console.log(`   Superficie: ${annuncio.superficie} mq`);
  console.log(`   Stato: ${annuncio.stato}`);
  console.log(`   Distanza mare: ${annuncio.distanzaMare}m`);
  if (annuncio.vistaMare) console.log(`   Vista mare: ${annuncio.vistaMare}`);
  if (annuncio.terrazzo) console.log(`   Terrazzo: Sì`);
  if (annuncio.giardino) console.log(`   Giardino: ${annuncio.giardino} mq`);
  if (annuncio.boxAuto) console.log(`   Box auto: Sì`);
  console.log(`   💰 PREZZO REALE: €${annuncio.prezzoReale.toLocaleString()}`);
  console.log(`   💶 Prezzo/mq reale: €${Math.round(annuncio.prezzoReale / annuncio.superficie).toLocaleString()}/mq`);

  // Prepara dati per l'algoritmo
  const dati: DatiImmobile = {
    comune: annuncio.comune,
    localita: normalizzaLocalita(annuncio.localita),
    tipologia: annuncio.tipologia,
    superficieAbitabile: annuncio.superficie,
    numeroCamere: annuncio.camere,
    numeroBagni: annuncio.bagni,
    statoManutenzione: mappaStato(annuncio.stato),
    distanzaMare: annuncio.distanzaMare,
    vistaMare: mappaVistaMare(annuncio.vistaMare),
    hasTerrazzo: annuncio.terrazzo,
    superficieTerrazzo: annuncio.terrazzo ? 15 : undefined,
    hasGiardino: !!annuncio.giardino,
    superficieGiardino: annuncio.giardino || undefined,
    tipoGiardino: annuncio.giardino && annuncio.giardino > 100 ? 'villa' : undefined,
    hasPostoAuto: annuncio.boxAuto,
    tipoPostoAuto: annuncio.boxAuto ? 'coperto' : undefined,
    numeroPostiAuto: annuncio.boxAuto ? 1 : undefined,
  };

  try {
    // Calcola valutazione
    const valutazione = calcolaValutazione(dati);

    console.log(`\n🔍 VALUTAZIONE ALGORITMO:`);
    console.log(`   Prezzo/mq zona: €${valutazione.prezzoMqZona.toLocaleString()}`);
    console.log(`   Valore base: €${valutazione.valoreBase.toLocaleString()}`);
    console.log(`   Pertinenze: +€${valutazione.valorePertinenze.toLocaleString()}`);
    console.log(`   Valorizzazioni: +€${valutazione.valoreValorizzazioni.toLocaleString()}`);
    console.log(`   Svalutazioni: -€${valutazione.valoreSvalutazioni.toLocaleString()}`);
    console.log(`   💰 VALORE STIMATO: €${valutazione.valoreTotale.toLocaleString()}`);
    console.log(`   Range: €${valutazione.valoreMin.toLocaleString()} - €${valutazione.valoreMax.toLocaleString()}`);
    console.log(`   Prezzo consigliato: €${valutazione.prezzoConsigliato.toLocaleString()}`);

    // Calcola differenza
    const differenza = valutazione.valoreTotale - annuncio.prezzoReale;
    const percentuale = (differenza / annuncio.prezzoReale) * 100;
    const inRange = annuncio.prezzoReale >= valutazione.valoreMin && annuncio.prezzoReale <= valutazione.valoreMax;

    console.log(`\n📊 CONFRONTO:`);
    console.log(`   Differenza: €${differenza.toLocaleString()} (${percentuale > 0 ? '+' : ''}${percentuale.toFixed(1)}%)`);
    console.log(`   Prezzo reale nel range: ${inRange ? '✅ SÌ' : '❌ NO'}`);
    
    if (Math.abs(percentuale) <= 10) {
      console.log(`   Accuratezza: ✅ OTTIMA (±10%)`);
    } else if (Math.abs(percentuale) <= 20) {
      console.log(`   Accuratezza: ⚠️  BUONA (±20%)`);
    } else {
      console.log(`   Accuratezza: ❌ DA MIGLIORARE (>${Math.abs(percentuale).toFixed(0)}%)`);
    }

    // Salva risultato
    risultati.push({
      id: annuncio.id,
      codice: annuncio.codice,
      comune: annuncio.comune,
      localita: annuncio.localita,
      superficie: annuncio.superficie,
      prezzoReale: annuncio.prezzoReale,
      prezzoMqReale: Math.round(annuncio.prezzoReale / annuncio.superficie),
      valoreStimato: valutazione.valoreTotale,
      prezzoMqStimato: Math.round(valutazione.valoreTotale / annuncio.superficie),
      valoreMin: valutazione.valoreMin,
      valoreMax: valutazione.valoreMax,
      differenza: differenza,
      percentuale: percentuale,
      inRange: inRange,
      accuratezza: Math.abs(percentuale) <= 10 ? 'OTTIMA' : Math.abs(percentuale) <= 20 ? 'BUONA' : 'DA MIGLIORARE'
    });

  } catch (error) {
    console.error(`\n❌ ERRORE nel calcolo:`, error);
    risultati.push({
      id: annuncio.id,
      codice: annuncio.codice,
      errore: String(error)
    });
  }
});

// Statistiche finali
console.log(`\n\n${'='.repeat(80)}`);
console.log('STATISTICHE BACKTEST');
console.log(`${'='.repeat(80)}`);

const risultatiValidi = risultati.filter(r => !r.errore);
const totale = risultatiValidi.length;
const inRange = risultatiValidi.filter(r => r.inRange).length;
const ottima = risultatiValidi.filter(r => r.accuratezza === 'OTTIMA').length;
const buona = risultatiValidi.filter(r => r.accuratezza === 'BUONA').length;
const daMigliorare = risultatiValidi.filter(r => r.accuratezza === 'DA MIGLIORARE').length;

const differenzeAssolute = risultatiValidi.map(r => Math.abs(r.differenza));
const percentualiAssolute = risultatiValidi.map(r => Math.abs(r.percentuale));

const mediaDifferenza = differenzeAssolute.reduce((a, b) => a + b, 0) / totale;
const mediaPercentuale = percentualiAssolute.reduce((a, b) => a + b, 0) / totale;

console.log(`\n📈 ACCURATEZZA GENERALE:`);
console.log(`   Annunci testati: ${totale}`);
console.log(`   Prezzo reale nel range (±10%): ${inRange}/${totale} (${(inRange/totale*100).toFixed(1)}%)`);
console.log(`   Accuratezza OTTIMA (±10%): ${ottima}/${totale} (${(ottima/totale*100).toFixed(1)}%)`);
console.log(`   Accuratezza BUONA (±20%): ${buona}/${totale} (${(buona/totale*100).toFixed(1)}%)`);
console.log(`   Da migliorare (>20%): ${daMigliorare}/${totale} (${(daMigliorare/totale*100).toFixed(1)}%)`);

console.log(`\n📊 ERRORE MEDIO:`);
console.log(`   Differenza assoluta media: €${Math.round(mediaDifferenza).toLocaleString()}`);
console.log(`   Errore percentuale medio: ${mediaPercentuale.toFixed(1)}%`);

// Trova casi migliori e peggiori
const migliore = risultatiValidi.reduce((prev, curr) => 
  Math.abs(curr.percentuale) < Math.abs(prev.percentuale) ? curr : prev
);
const peggiore = risultatiValidi.reduce((prev, curr) => 
  Math.abs(curr.percentuale) > Math.abs(prev.percentuale) ? curr : prev
);

console.log(`\n🏆 MIGLIORE STIMA:`);
console.log(`   ${migliore.codice} - ${migliore.comune}`);
console.log(`   Errore: ${migliore.percentuale > 0 ? '+' : ''}${migliore.percentuale.toFixed(1)}%`);

console.log(`\n⚠️  PEGGIORE STIMA:`);
console.log(`   ${peggiore.codice} - ${peggiore.comune}`);
console.log(`   Errore: ${peggiore.percentuale > 0 ? '+' : ''}${peggiore.percentuale.toFixed(1)}%`);

// Salva risultati in JSON
fs.writeFileSync('backtest-risultati.json', JSON.stringify(risultati, null, 2));
console.log(`\n✅ Risultati salvati in: backtest-risultati.json`);

// Genera report CSV
const csvHeader = 'ID,Codice,Comune,Località,Superficie,Prezzo Reale,€/mq Reale,Valore Stimato,€/mq Stimato,Differenza €,Differenza %,In Range,Accuratezza\n';
const csvRows = risultatiValidi.map(r => 
  `${r.id},${r.codice},${r.comune},${r.localita},${r.superficie},${r.prezzoReale},${r.prezzoMqReale},${r.valoreStimato},${r.prezzoMqStimato},${r.differenza},${r.percentuale.toFixed(1)},${r.inRange ? 'SI' : 'NO'},${r.accuratezza}`
).join('\n');

fs.writeFileSync('backtest-report.csv', csvHeader + csvRows);
console.log(`✅ Report CSV salvato in: backtest-report.csv`);

console.log(`\n${'='.repeat(80)}\n`);
