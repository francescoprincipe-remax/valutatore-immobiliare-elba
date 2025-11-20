import { calcolaValutazione } from './server/valutazione-engine';

const dati = {
  comune: 'Capoliveri',
  localita: 'Centro',
  tipologia: 'Appartamento',
  superficieAbitabile: 53,
  statoManutenzione: 'Ottimo stato',
  vistaMare: 'da alcune stanze'
};

console.log('=== TEST CALCOLO VALUTAZIONE ===');
console.log('Input:', JSON.stringify(dati, null, 2));

const risultato = calcolaValutazione(dati);

console.log('\n=== RISULTATO ===');
console.log('Prezzo mq zona:', risultato.prezzoMqZona);
console.log('Valore Base:', risultato.valoreBase);
console.log('Valorizzazioni:', risultato.valoreValorizzazioni);
console.log('Svalutazioni:', risultato.valoreSvalutazioni);
console.log('\n**VALORE TOTALE:**', risultato.valoreTotale);
console.log('**Valore Min:**', risultato.valoreMin);
console.log('**Valore Max:**', risultato.valoreMax);
console.log('**Prezzo Consigliato:**', risultato.prezzoConsigliato);
