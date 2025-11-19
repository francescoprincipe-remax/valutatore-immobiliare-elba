import { calcolaValutazione } from './valutazione-engine';

// Test con dati semplici
const datiTest = {
  comune: 'Portoferraio',
  localita: 'Centro',
  superficieAbitabile: 50,
  tipologia: 'Appartamento',
  statoManutenzione: 'Buono',
  numeroCamere: 1,
  numeroBagni: 1,
};

console.log('=== TEST CALCOLO VALUTAZIONE ===');
console.log('Dati input:', JSON.stringify(datiTest, null, 2));

try {
  const risultato = calcolaValutazione(datiTest);
  console.log('\n=== RISULTATO ===');
  console.log('Prezzo mq zona:', risultato.prezzoMqZona);
  console.log('Valore base:', risultato.valoreBase);
  console.log('Valore pertinenze:', risultato.valorePertinenze);
  console.log('Valore valorizzazioni:', risultato.valoreValorizzazioni);
  console.log('Valore svalutazioni:', risultato.valoreSvalutazioni);
  console.log('VALORE TOTALE:', risultato.valoreTotale);
  console.log('Range:', risultato.valoreMin, '-', risultato.valoreMax);
} catch (error) {
  console.error('ERRORE:', error);
}
