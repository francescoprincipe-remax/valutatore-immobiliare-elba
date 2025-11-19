import { calcolaValutazione } from './valutazione-engine';

// Test con dati Porto Azzurro 49mq
const datiTest = {
  comune: 'Porto Azzurro',
  localita: 'Centro',
  superficieAbitabile: 49,
  tipologia: 'Appartamento',
  statoManutenzione: 'Buono',
  numeroCamere: 1,
  numeroBagni: 1,
};

console.log('=== TEST PORTO AZZURRO 49MQ ===');
console.log('Dati input:', JSON.stringify(datiTest, null, 2));

try {
  const risultato = calcolaValutazione(datiTest);
  console.log('\n=== RISULTATO ===');
  console.log('Prezzo mq zona:', risultato.prezzoMqZona);
  console.log('Valore base:', risultato.valoreBase);
  console.log('Valore pertinenze:', risultato.valorePertinenze);
  console.log('Dettaglio pertinenze:', risultato.dettaglioPertinenze);
  console.log('Valore valorizzazioni:', risultato.valoreValorizzazioni);
  console.log('Dettaglio valorizzazioni:', risultato.dettaglioValorizzazioni);
  console.log('Valore svalutazioni:', risultato.valoreSvalutazioni);
  console.log('Dettaglio svalutazioni:', risultato.dettaglioSvalutazioni);
  console.log('\n*** VALORE TOTALE:', risultato.valoreTotale, '***');
  console.log('Range:', risultato.valoreMin, '-', risultato.valoreMax);
  
  // Verifica calcolo manuale
  const totaleManuale = risultato.valoreBase + risultato.valorePertinenze + risultato.valoreValorizzazioni - risultato.valoreSvalutazioni;
  console.log('\nVerifica calcolo manuale:', totaleManuale);
  console.log('Match con valoreTotale?', totaleManuale === risultato.valoreTotale);
} catch (error) {
  console.error('ERRORE:', error);
}
