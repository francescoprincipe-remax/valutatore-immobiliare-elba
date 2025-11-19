import { calcolaValutazione, type DatiImmobile } from "./valutazione-engine";

// Test caso reale: bilocale 49mq, terrazza, centro Portoferraio, 1km mare
// Prezzo reale di vendita: €160.000
const datiCasoReale: DatiImmobile = {
  comune: "Portoferraio",
  localita: "Centro",
  tipologia: "appartamento",
  superficieAbitabile: 49,
  numeroCamere: 1,
  numeroBagni: 1,
  statoManutenzione: "buono",
  hasTerrazzo: true,
  superficieTerrazzo: 49,
  tipoTerrazzo: "scoperto",
  distanzaMare: 1000, // 1km
};

console.log("=".repeat(60));
console.log("TEST CASO REALE UTENTE");
console.log("=".repeat(60));
console.log("\nDati immobile:");
console.log(`- Comune: ${datiCasoReale.comune} ${datiCasoReale.localita}`);
console.log(`- Tipologia: ${datiCasoReale.tipologia}`);
console.log(`- Superficie: ${datiCasoReale.superficieAbitabile} mq`);
console.log(`- Camere: ${datiCasoReale.numeroCamere}`);
console.log(`- Bagni: ${datiCasoReale.numeroBagni}`);
console.log(`- Terrazza: ${datiCasoReale.superficieTerrazzo} mq scoperta`);
console.log(`- Distanza mare: ${datiCasoReale.distanzaMare}m`);
console.log(`- Stato: ${datiCasoReale.statoManutenzione}`);

const risultato = calcolaValutazione(datiCasoReale);

console.log("\n" + "=".repeat(60));
console.log("RISULTATO VALUTAZIONE");
console.log("=".repeat(60));
console.log(`\nPrezzo al mq zona: €${risultato.prezzoMqZona.toLocaleString()}`);
console.log(`\nValore base: €${risultato.valoreBase.toLocaleString()}`);
console.log(`  (${datiCasoReale.superficieAbitabile} mq × €${risultato.prezzoMqZona})`);

if (risultato.valorePertinenze > 0) {
  console.log(`\n+ Pertinenze: €${risultato.valorePertinenze.toLocaleString()}`);
  if (risultato.dettaglioPertinenze.terrazzo) {
    console.log(`  - Terrazzo: €${risultato.dettaglioPertinenze.terrazzo.toLocaleString()}`);
  }
}

if (risultato.valoreValorizzazioni > 0) {
  console.log(`\n+ Valorizzazioni: €${risultato.valoreValorizzazioni.toLocaleString()}`);
  Object.entries(risultato.dettaglioValorizzazioni).forEach(([key, value]) => {
    console.log(`  - ${key}: €${(value as number).toLocaleString()}`);
  });
}

if (risultato.valoreSvalutazioni > 0) {
  console.log(`\n- Svalutazioni: €${risultato.valoreSvalutazioni.toLocaleString()}`);
  Object.entries(risultato.dettaglioSvalutazioni).forEach(([key, value]) => {
    console.log(`  - ${key}: €${(value as number).toLocaleString()}`);
  });
}

console.log("\n" + "=".repeat(60));
console.log(`VALORE TOTALE STIMATO: €${risultato.valoreTotale.toLocaleString()}`);
console.log(`Range: €${risultato.valoreMin.toLocaleString()} - €${risultato.valoreMax.toLocaleString()}`);
console.log("=".repeat(60));

console.log(`\n📊 CONFRONTO CON PREZZO REALE:`);
console.log(`   Prezzo reale vendita: €160.000`);
console.log(`   Stima algoritmo: €${risultato.valoreTotale.toLocaleString()}`);
const differenza = risultato.valoreTotale - 160000;
const percentuale = (differenza / 160000) * 100;
console.log(`   Differenza: €${differenza.toLocaleString()} (${percentuale > 0 ? '+' : ''}${percentuale.toFixed(1)}%)`);

if (Math.abs(percentuale) <= 10) {
  console.log(`\n✅ VALUTAZIONE ACCURATA (entro ±10%)`);
} else if (Math.abs(percentuale) <= 20) {
  console.log(`\n⚠️  VALUTAZIONE ACCETTABILE (entro ±20%)`);
} else {
  console.log(`\n❌ VALUTAZIONE DA RIVEDERE (oltre ±20%)`);
}

console.log("\n" + "=".repeat(60));
