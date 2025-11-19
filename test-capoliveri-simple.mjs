import { calcolaValutazione } from "./server/valutazione-engine.ts";

console.log("=".repeat(60));
console.log("TEST CASO CAPOLIVERI 55mq - Venduto a €150.000");
console.log("=".repeat(60));

const dati = {
  comune: "Capoliveri",
  localita: "Centro",
  tipologia: "appartamento",
  superficieAbitabile: 55,
  numeroCamere: 1,
  numeroBagni: 1,
  statoManutenzione: "buono",
  hasPostoAuto: true,
  hasCortile: true,
  superficieCortile: 20,
  vistaMare: "vista_mare_parziale",
  distanzaMareKm: 1,
};

const val = calcolaValutazione(dati);

console.log(`\nPrezzo/mq zona: €${val.prezzoMqZona.toLocaleString()}`);
console.log(`Valore base: €${val.valoreBase.toLocaleString()} (${dati.superficieAbitabile}mq × €${val.prezzoMqZona})`);
console.log(`+ Pertinenze: €${val.valorePertinenze.toLocaleString()}`);
console.log(`+ Valorizzazioni: €${val.valoreValorizzazioni.toLocaleString()}`);
console.log(`- Svalutazioni: €${val.valoreSvalutazioni.toLocaleString()}`);
console.log(`\n${"=".repeat(60)}`);
console.log(`STIMA TOTALE: €${val.valoreTotale.toLocaleString()}`);
console.log(`Range: €${val.valoreMin.toLocaleString()} - €${val.valoreMax.toLocaleString()}`);
console.log(`${"=".repeat(60)}`);

const prezzoReale = 150000;
const diff = val.valoreTotale - prezzoReale;
const perc = (diff / prezzoReale * 100);

console.log(`\n📊 CONFRONTO:`);
console.log(`   Prezzo reale: €${prezzoReale.toLocaleString()}`);
console.log(`   Stima: €${val.valoreTotale.toLocaleString()}`);
console.log(`   Differenza: €${diff.toLocaleString()} (${perc > 0 ? '+' : ''}${perc.toFixed(1)}%)`);

if (Math.abs(perc) <= 10) {
  console.log(`\n✅ VALUTAZIONE ACCURATA (entro ±10%)`);
} else if (Math.abs(perc) <= 20) {
  console.log(`\n⚠️  VALUTAZIONE ACCETTABILE (entro ±20%)`);
} else {
  console.log(`\n❌ VALUTAZIONE DA RIVEDERE (oltre ±20%)`);
}

console.log(`\n${"=".repeat(60)}\n`);
