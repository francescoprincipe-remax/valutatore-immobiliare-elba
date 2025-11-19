#!/usr/bin/env node
import { drizzle } from 'drizzle-orm/mysql2';
import { datiMercato } from '../drizzle/schema.ts';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connessione al database
const db = drizzle(process.env.DATABASE_URL);

// Carica i dati dal JSON
const datiJson = JSON.parse(
  readFileSync(join(__dirname, 'dati_mercato.json'), 'utf-8')
);

async function seedMarketData() {
  console.log('🌱 Caricamento dati di mercato...');

  const records = [];

  // Comuni principali
  for (const [comuneKey, comuneData] of Object.entries(datiJson.comuni)) {
    // Record principale del comune
    records.push({
      comune: comuneData.nome,
      localita: null,
      prezzoMedioMq: comuneData.prezzo_medio_mq,
      prezzoMinMq: comuneData.range_omi?.min || null,
      prezzoMaxMq: comuneData.range_omi?.max || null,
      trendAnnuale: comuneData.trend_annuale || null,
      numeroAnnunci: comuneData.annunci_attivi || null,
      caratteristiche: comuneData.caratteristiche || null,
    });

    // Località specifiche del comune
    if (comuneData.localita) {
      for (const [localitaKey, localitaData] of Object.entries(comuneData.localita)) {
        records.push({
          comune: comuneData.nome,
          localita: localitaData.nome,
          prezzoMedioMq: Math.round((localitaData.prezzo_stimato_min + localitaData.prezzo_stimato_max) / 2),
          prezzoMinMq: localitaData.prezzo_min || localitaData.prezzo_stimato_min,
          prezzoMaxMq: localitaData.prezzo_max || localitaData.prezzo_stimato_max,
          trendAnnuale: null,
          numeroAnnunci: null,
          caratteristiche: localitaData.caratteristiche || null,
        });
      }
    }
  }

  // Zone premium
  for (const [zonaKey, zonaData] of Object.entries(datiJson.zone_premium)) {
    records.push({
      comune: zonaData.comune,
      localita: zonaData.nome,
      prezzoMedioMq: Math.round((zonaData.prezzo_min || zonaData.prezzo_stimato_min + zonaData.prezzo_max || zonaData.prezzo_stimato_max) / 2),
      prezzoMinMq: zonaData.prezzo_min || zonaData.prezzo_stimato_min,
      prezzoMaxMq: zonaData.prezzo_max || zonaData.prezzo_stimato_max,
      trendAnnuale: null,
      numeroAnnunci: null,
      caratteristiche: zonaData.caratteristiche,
    });
  }

  // Inserimento nel database
  for (const record of records) {
    try {
      await db.insert(datiMercato).values(record);
      console.log(`✓ Inserito: ${record.comune}${record.localita ? ' - ' + record.localita : ''}`);
    } catch (error) {
      console.error(`✗ Errore inserimento ${record.comune}: ${error.message}`);
    }
  }

  console.log(`\n✅ Caricati ${records.length} record di dati di mercato`);
}

seedMarketData()
  .then(() => {
    console.log('🎉 Seed completato!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Errore durante il seed:', error);
    process.exit(1);
  });
