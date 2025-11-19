import { calcolaValutazione } from './server/valutazione-engine.ts';

const datiTest = {
  comune: 'Porto Azzurro',
  localita: 'Centro',
  tipologia: 'Appartamento',
  superficieAbitabile: 49,
  statoManutenzione: 'Buono',
};

console.log('=== TEST VALUTAZIONE PORTO AZZURRO ===');
console.log('Input:', JSON.stringify(datiTest, null, 2));
console.log('\n');

try {
  const risultato = calcolaValutazione(datiTest);
  console.log('=== RISULTATO ===');
  console.log('Prezzo mq zona:', risultato.prezzoMqZona);
  console.log('Valore base:', risultato.valoreBase);
  console.log('Valore pertinenze:', risultato.valorePertinenze);
  console.log('Valore valorizzazioni:', risultato.valoreValorizzazioni);
  console.log('Valore svalutazioni:', risultato.valoreSvalutazioni);
  console.log('VALORE TOTALE:', risultato.valoreTotale);
  console.log('Range:', risultato.valoreMin, '-', risultato.valoreMax);
} catch (error) {
  console.error('ERRORE:', error.message);
  console.error(error.stack);
}
