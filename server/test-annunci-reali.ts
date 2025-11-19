import { calcolaValutazione, type DatiImmobile } from "./valutazione-engine";
import * as fs from "fs";

// Leggi annunci reali
const annunci = JSON.parse(fs.readFileSync("test-annunci-reali.json", "utf-8"));

console.log("=".repeat(80));
console.log("TEST ALGORITMO CON ANNUNCI REALI ISOLA D'ELBA");
console.log("=".repeat(80));
console.log(`\nTotale annunci da testare: ${annunci.length}`);
console.log("Obiettivo: stima deve essere SOTTO il prezzo pubblicato (target: -5% a -15%)\n");

const risultati: any[] = [];

annunci.forEach((annuncio: any, index: number) => {
  console.log("\n" + "-".repeat(80));
  console.log(`ANNUNCIO ${index + 1}/${annunci.length} - ID: ${annuncio.id}`);
  console.log("-".repeat(80));
  
  // Prepara dati per algoritmo
  // Nota: per ora usiamo dati base, poi potremmo aprire i dettagli per info complete
  const dati: DatiImmobile = {
    comune: annuncio.comune,
    localita: annuncio.localita,
    tipologia: "appartamento",
    superficieAbitabile: annuncio.superficie,
    numeroCamere: annuncio.camere,
    numeroBagni: annuncio.bagni,
    statoManutenzione: "buono", // Assumiamo buono come default
  };

  console.log(`\n📍 Località: ${annuncio.comune}${annuncio.localita ? ` - ${annuncio.localita}` : ""}`);
  console.log(`📐 Superficie: ${annuncio.superficie} mq`);
  console.log(`🛏️  Camere: ${annuncio.camere} | 🚿 Bagni: ${annuncio.bagni}`);
  console.log(`💰 Prezzo pubblicato: €${annuncio.prezzo.toLocaleString()}`);
  if (annuncio.prezzo_originale) {
    console.log(`   (ribassato da €${annuncio.prezzo_originale.toLocaleString()} ${annuncio.sconto})`);
  }

  // Calcola valutazione
  const valutazione = calcolaValutazione(dati);

  console.log(`\n🔍 VALUTAZIONE ALGORITMO:`);
  console.log(`   Prezzo/mq zona: €${valutazione.prezzoMqZona.toLocaleString()}`);
  console.log(`   Valore stimato: €${valutazione.valoreTotale.toLocaleString()}`);
  console.log(`   Range: €${valutazione.valoreMin.toLocaleString()} - €${valutazione.valoreMax.toLocaleString()}`);

  // Calcola differenza
  const differenza = valutazione.valoreTotale - annuncio.prezzo;
  const percentuale = (differenza / annuncio.prezzo) * 100;

  console.log(`\n📊 CONFRONTO:`);
  console.log(`   Differenza: €${differenza.toLocaleString()} (${percentuale > 0 ? '+' : ''}${percentuale.toFixed(1)}%)`);

  let esito = "";
  if (percentuale < -20) {
    esito = "❌ TROPPO BASSA (oltre -20%)";
  } else if (percentuale < -5) {
    esito = "✅ OTTIMA (tra -5% e -20%)";
  } else if (percentuale <= 5) {
    esito = "⚠️  ACCETTABILE (±5%)";
  } else if (percentuale <= 15) {
    esito = "⚠️  ALTA (tra +5% e +15%)";
  } else {
    esito = "❌ TROPPO ALTA (oltre +15%)";
  }

  console.log(`   Esito: ${esito}`);

  risultati.push({
    id: annuncio.id,
    superficie: annuncio.superficie,
    prezzo_pubblicato: annuncio.prezzo,
    stima_algoritmo: valutazione.valoreTotale,
    differenza: differenza,
    percentuale: percentuale,
    esito: esito,
  });
});

// Riepilogo finale
console.log("\n" + "=".repeat(80));
console.log("RIEPILOGO FINALE");
console.log("=".repeat(80));

const ottime = risultati.filter(r => r.percentuale < -5 && r.percentuale >= -20).length;
const accettabili = risultati.filter(r => r.percentuale >= -5 && r.percentuale <= 5).length;
const alte = risultati.filter(r => r.percentuale > 5 && r.percentuale <= 15).length;
const troppoAlte = risultati.filter(r => r.percentuale > 15).length;
const troppoBasse = risultati.filter(r => r.percentuale < -20).length;

console.log(`\n📈 DISTRIBUZIONE RISULTATI:`);
console.log(`   ✅ Ottime (sotto -5% a -20%): ${ottime}/${risultati.length}`);
console.log(`   ⚠️  Accettabili (±5%): ${accettabili}/${risultati.length}`);
console.log(`   ⚠️  Alte (+5% a +15%): ${alte}/${risultati.length}`);
console.log(`   ❌ Troppo alte (oltre +15%): ${troppoAlte}/${risultati.length}`);
console.log(`   ❌ Troppo basse (oltre -20%): ${troppoBasse}/${risultati.length}`);

const mediaPercentuale = risultati.reduce((sum, r) => sum + r.percentuale, 0) / risultati.length;
console.log(`\n📊 MEDIA DIFFERENZA: ${mediaPercentuale > 0 ? '+' : ''}${mediaPercentuale.toFixed(1)}%`);

if (mediaPercentuale < -15) {
  console.log(`\n⚠️  ALGORITMO TROPPO CONSERVATIVO: stime troppo basse in media`);
} else if (mediaPercentuale < -5) {
  console.log(`\n✅ ALGORITMO OTTIMALE: stime conservative ma realistiche`);
} else if (mediaPercentuale <= 5) {
  console.log(`\n✅ ALGORITMO ACCURATO: stime molto vicine ai prezzi reali`);
} else {
  console.log(`\n❌ ALGORITMO TROPPO OTTIMISTA: stime sopra i prezzi di mercato`);
}

console.log("\n" + "=".repeat(80));

// Salva risultati
fs.writeFileSync(
  "test-annunci-risultati.json",
  JSON.stringify(risultati, null, 2)
);
console.log("\n💾 Risultati salvati in: test-annunci-risultati.json\n");
