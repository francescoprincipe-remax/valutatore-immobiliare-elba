/**
 * Algoritmo di valutazione immobiliare per l'Isola d'Elba
 * Basato sui dati di mercato reali e coefficienti specifici
 */

import datiMercatoJson from './dati_mercato.json';

export interface DatiImmobile {
  // Localizzazione
  comune: string;
  localita?: string;
  indirizzo?: string;
  distanzaMare?: number; // metri

  // Tipologia e caratteristiche
  tipologia: string;
  categoriaCatastale?: string;
  superficieAbitabile: number;
  numeroCamere?: number;
  numeroBagni?: number;
  piano?: string;
  statoManutenzione: string;
  annoCostruzione?: number;
  classeEnergetica?: string;

  // Pertinenze
  hasGiardino?: boolean;
  superficieGiardino?: number;
  tipoGiardino?: string;
  statoGiardino?: string;
  hasPiscina?: boolean;

  hasTerrazzo?: boolean;
  superficieTerrazzo?: number;
  tipoTerrazzo?: string;

  hasCortile?: boolean;
  superficieCortile?: number;

  hasCantina?: boolean;
  superficieCantina?: number;

  hasPostoAuto?: boolean;
  tipoPostoAuto?: string;
  numeroPostiAuto?: number;

  // Vista e posizione
  vistaMare?: string;
  esposizione?: string[];
  tipoPosizione?: string;
  accessoMare?: string;

  // Servizi e comfort
  servizi?: string[];
  finiture?: string[];
}

export interface RisultatoValutazione {
  // Valore base
  valoreBase: number;
  prezzoMqZona: number;

  // Pertinenze (valore aggiunto in €)
  valorePertinenze: number;
  dettaglioPertinenze: {
    giardino?: number;
    terrazzo?: number;
    cortile?: number;
    cantina?: number;
    postoAuto?: number;
  };

  // Fattori moltiplicativi (valore aggiunto in €)
  valoreValorizzazioni: number;
  dettaglioValorizzazioni: {
    vistaMare?: number;
    distanzaMare?: number;
    statoManutenzione?: number;
    classeEnergetica?: number;
    servizi?: number;
    finiture?: number;
    esposizione?: number;
    posizione?: number;
    accessoMare?: number;
  };

  // Svalutazioni
  valoreSvalutazioni: number;
  dettaglioSvalutazioni: {
    statoManutenzione?: number;
    distanzaMare?: number;
    posizione?: number;
  };

  // Totale
  valoreTotale: number;
  valoreMin: number;
  valoreMax: number;

  // Analisi competitività
  immobiliSimiliZona: number;
  livelloCompetitivita: 'BASSA' | 'MEDIA' | 'ALTA' | 'MOLTO_ALTA';
  prezzoConsigliato: number;

  // Consigli
  consigli: {
    puntiForza: string[];
    miglioramenti: string[];
    strategiaVendita: string[];
  };
}

/**
 * Calcola il valore di un immobile
 */
export function calcolaValutazione(dati: DatiImmobile): RisultatoValutazione {
  // 1. Determina il prezzo al mq della zona
  let prezzoMqZona = getPrezzoMqZona(dati.comune, dati.localita);

  // 2. Applica sconto progressivo per superfici grandi
  // Più mq = prezzo/mq più basso (economia di scala)
  const superficie = dati.superficieAbitabile;
  let scontoSuperficie = 0;
  
  if (superficie > 150) {
    scontoSuperficie = 0.15; // -15% per immobili > 150mq
  } else if (superficie > 120) {
    scontoSuperficie = 0.12; // -12% per immobili 121-150mq
  } else if (superficie > 100) {
    scontoSuperficie = 0.10; // -10% per immobili 101-120mq
  } else if (superficie > 80) {
    scontoSuperficie = 0.07; // -7% per immobili 81-100mq
  } else if (superficie > 60) {
    scontoSuperficie = 0.05; // -5% per immobili 61-80mq
  }
  // Immobili <= 60mq: nessuno sconto (prezzo pieno)
  
  prezzoMqZona = Math.round(prezzoMqZona * (1 - scontoSuperficie));

  // 3. Calcola valore base
  const valoreBase = dati.superficieAbitabile * prezzoMqZona;

  // 3. Calcola valore pertinenze
  const { valorePertinenze, dettaglioPertinenze } = calcolaValorePertinenze(dati, prezzoMqZona);

  // 4. Calcola valorizzazioni
  const { valoreValorizzazioni, dettaglioValorizzazioni } = calcolaValorizzazioni(
    dati,
    valoreBase
  );

  // 5. Calcola svalutazioni
  const { valoreSvalutazioni, dettaglioSvalutazioni } = calcolaSvalutazioni(dati, valoreBase);

  // 6. Calcola totale
  let valoreTotale = valoreBase + valorePertinenze + valoreValorizzazioni - valoreSvalutazioni;

  // 6.5. Applica sconto per monolocali/immobili piccoli (<50mq)
  if (dati.superficieAbitabile < 50) {
    // Sconto -10% per monolocali (mercato meno liquido)
    valoreTotale = Math.round(valoreTotale * 0.90);
  }

  // 6.5b. Applica sconto per mansarde/sottotetti (non civile abitazione)
  if (dati.piano && (dati.piano.toLowerCase().includes('mansarda') || dati.piano.toLowerCase().includes('sottotetto') || dati.piano.toLowerCase().includes('attico'))) {
    // Sconto -15% per mansarde/sottotetti (altezze ridotte, non sempre abitabilità piena)
    valoreTotale = Math.round(valoreTotale * 0.85);
  }

  // 6.6. Applica riduzione prezzo/mq per immobili grandi (curva progressiva)
  // Modello: riduzione progressiva del prezzo/mq all'aumentare della superficie
  // Rationale: immobili grandi hanno mercato più ristretto e prezzo/mq inferiore
  if (dati.superficieAbitabile > 100) {
    let fattoreRiduzione = 1.0;
    
    if (dati.superficieAbitabile <= 150) {
      // 100-150mq: riduzione leggera -2%
      fattoreRiduzione = 0.98;
    } else if (dati.superficieAbitabile <= 200) {
      // 150-200mq: riduzione moderata -5%
      fattoreRiduzione = 0.95;
    } else if (dati.superficieAbitabile <= 250) {
      // 200-250mq: riduzione significativa -10%
      fattoreRiduzione = 0.90;
    } else if (dati.superficieAbitabile <= 300) {
      // 250-300mq: riduzione forte -15%
      fattoreRiduzione = 0.85;
    } else {
      // >300mq: riduzione massima -20% + ulteriore -1% ogni 50mq (max -30% totale)
      const mqOltre300 = dati.superficieAbitabile - 300;
      const riduzioneExtra = Math.min(0.10, Math.floor(mqOltre300 / 50) * 0.01);
      fattoreRiduzione = 0.80 - riduzioneExtra;
    }
    
    valoreTotale = Math.round(valoreTotale * fattoreRiduzione);
  }

  // 7. Calcola range (±10%)
  const valoreMin = Math.round(valoreTotale * 0.9);
  const valoreMax = Math.round(valoreTotale * 1.1);

  // 8. Analisi competitività (simulata - in produzione userebbe dati reali)
  const immobiliSimiliZona = simulaImmobiliSimili(dati);
  const livelloCompetitivita = determinaCompetitivita(immobiliSimiliZona);
  const prezzoConsigliato = calcolaPrezzoConsigliato(valoreTotale, livelloCompetitivita);

  // 9. Genera consigli
  const consigli = generaConsigli(dati, dettaglioValorizzazioni, dettaglioSvalutazioni);

  return {
    valoreBase,
    prezzoMqZona,
    valorePertinenze,
    dettaglioPertinenze,
    valoreValorizzazioni,
    dettaglioValorizzazioni,
    valoreSvalutazioni,
    dettaglioSvalutazioni,
    valoreTotale: Math.round(valoreTotale),
    valoreMin,
    valoreMax,
    immobiliSimiliZona,
    livelloCompetitivita,
    prezzoConsigliato,
    consigli,
  };
}

/**
 * Ottiene il prezzo al mq per la zona specifica
 */
function getPrezzoMqZona(comune: string, localita?: string): number {
  const dati = datiMercatoJson as any;

  // Normalizza nome comune per matching
  const comuneNorm = comune.toLowerCase().replace(/[^a-z]/g, '_');

  // Cerca prima nelle località specifiche
  if (localita) {
    // Cerca nelle località del comune
    const comuneData = dati.comuni[comuneNorm];
    if (comuneData && comuneData.localita) {
      // Normalizza nome località per matching
      const localitaNorm = localita.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/^s_/g, 's_'); // Mantieni S. come s_
      
      const locData = comuneData.localita[localitaNorm];
      if (locData && locData.prezzo_mq) {
        return locData.prezzo_mq;
      }

      // Prova match alternativo per nome completo
      for (const [key, loc] of Object.entries(comuneData.localita)) {
        const l = loc as any;
        if (l.nome.toLowerCase() === localita.toLowerCase()) {
          return l.prezzo_mq;
        }
      }
    }
  }

  // Altrimenti usa il prezzo medio del comune
  const comuneData = dati.comuni[comuneNorm];
  if (comuneData && comuneData.prezzo_medio_mq) {
    return comuneData.prezzo_medio_mq;
  }

  // Fallback: prezzo conservativo isola (media generale)
  return 3000;
}

/**
 * Calcola il valore delle pertinenze
 */
function calcolaValorePertinenze(dati: DatiImmobile, prezzoMqZona: number) {
  const coefficienti = datiMercatoJson.coefficienti_pertinenze as any;
  const dettaglio: any = {};
  let totale = 0;

  // Giardino
  if (dati.hasGiardino && dati.superficieGiardino) {
    const superficie = dati.superficieGiardino;
    // Usa coefficiente semplice dal JSON: 10% del valore al mq
    let valore = superficie * coefficienti.giardino * prezzoMqZona;

    // Bonus piscina
    if (dati.hasPiscina) {
      valore *= (1 + coefficienti.piscina); // +15% se ha piscina
    }

    dettaglio.giardino = Math.round(valore);
    totale += valore;
  }

  // Terrazzo/Balcone
  if (dati.hasTerrazzo && dati.superficieTerrazzo) {
    // Usa coefficiente terrazzo dal JSON: 8% del valore al mq
    const valore = dati.superficieTerrazzo * coefficienti.terrazzo * prezzoMqZona;
    dettaglio.terrazzo = Math.round(valore);
    totale += valore;
  }

  // Cortile
  if (dati.hasCortile && dati.superficieCortile) {
    const superficie = dati.superficieCortile;
    // Usa coefficiente cortile dal JSON: 5% del valore al mq
    const valore = superficie * coefficienti.cortile * prezzoMqZona;
    dettaglio.cortile = Math.round(valore);
    totale += valore;
  }

  // Cantina/Magazzino
  if (dati.hasCantina && dati.superficieCantina) {
    // Usa coefficiente cantina dal JSON: 3% del valore al mq
    const valore = dati.superficieCantina * coefficienti.cantina * prezzoMqZona;
    dettaglio.cantina = Math.round(valore);
    totale += valore;
  }

  // Posto auto
  if (dati.hasPostoAuto && dati.numeroPostiAuto) {
    const coeff = dati.tipoPostoAuto === 'coperto' ? coefficienti.box_auto : coefficienti.posto_auto;
    // Assume 15mq per posto auto
    const valore = 15 * coeff * prezzoMqZona * dati.numeroPostiAuto;
    dettaglio.postoAuto = Math.round(valore);
    totale += valore;
  }

  return {
    valorePertinenze: Math.round(totale),
    dettaglioPertinenze: dettaglio,
  };
}

/**
 * Calcola le valorizzazioni (incrementi percentuali sul valore base)
 */
function calcolaValorizzazioni(dati: DatiImmobile, valoreBase: number) {
  const moltiplicatori = datiMercatoJson.moltiplicatori_vista as any;
  const moltiplicatoriStato = datiMercatoJson.moltiplicatori_stato as any;

  const dettaglio: any = {};
  let totale = 0;

  // Vista mare
  if (dati.vistaMare) {
    let incremento = 0;
    if (dati.vistaMare.includes('panoramica')) incremento = moltiplicatori.vista_mare_panoramica_180;
    else if (dati.vistaMare.includes('frontale')) incremento = moltiplicatori.vista_mare_frontale;
    else if (dati.vistaMare.includes('parziale')) incremento = moltiplicatori.vista_mare_parziale;
    else if (dati.vistaMare.includes('alcune stanze')) incremento = moltiplicatori.vista_mare_da_alcune_stanze;

    if (incremento > 0) {
      const valore = valoreBase * incremento;
      dettaglio.vistaMare = Math.round(valore);
      totale += valore;
    }
  }

  // Distanza mare - bonus solo per vicinanza eccezionale
  if (dati.distanzaMare !== undefined && dati.distanzaMare <= 500) {
    // Solo per immobili entro 500m dal mare
    const incremento = 0.03; // +3% per vicinanza mare
    const valore = valoreBase * incremento;
    dettaglio.distanzaMare = Math.round(valore);
    totale += valore;
  }

  // Stato manutenzione (solo se positivo)
  if (dati.statoManutenzione) {
    let incremento = 0;
    if (dati.statoManutenzione.includes('nuovo') || dati.statoManutenzione.includes('lusso')) {
      incremento = moltiplicatoriStato.nuovo_lusso;
    } else if (dati.statoManutenzione.includes('ottimo') || dati.statoManutenzione.includes('ristrutturato')) {
      incremento = moltiplicatoriStato.ottimo_ristrutturato;
    }

    if (incremento > 0) {
      const valore = valoreBase * incremento;
      dettaglio.statoManutenzione = Math.round(valore);
      totale += valore;
    }
  }

  // Classe energetica
  if (dati.classeEnergetica && ['A4', 'A3', 'A2', 'A1', 'A', 'B'].includes(dati.classeEnergetica)) {
    const valore = valoreBase * 0.03; // +3% per classi alte (ridotto)
    dettaglio.classeEnergetica = Math.round(valore);
    totale += valore;
  }

  // Servizi
  if (dati.servizi && dati.servizi.length > 0) {
    let incremento = 0;
    if (dati.servizi.includes('aria_condizionata')) incremento += 0.02;
    if (dati.servizi.includes('fotovoltaico')) incremento += 0.03;
    if (dati.servizi.includes('pompa_calore')) incremento += 0.02;
    if (dati.servizi.includes('allarme')) incremento += 0.01;
    if (dati.servizi.includes('domotica')) incremento += 0.02;

    if (incremento > 0) {
      const valore = valoreBase * incremento;
      dettaglio.servizi = Math.round(valore);
      totale += valore;
    }
  }

  // Accesso mare diretto
  if (dati.accessoMare && dati.accessoMare.includes('diretto')) {
    const valore = valoreBase * 0.12; // Ridotto da 30% a 12%
    dettaglio.accessoMare = Math.round(valore);
    totale += valore;
  }

  // Posizione
  if (dati.tipoPosizione) {
    let incremento = 0;
    if (dati.tipoPosizione.includes('tranquilla') || dati.tipoPosizione.includes('panoramica')) {
      incremento = 0.02; // Ridotto da 5% a 2%
    }

    if (incremento > 0) {
      const valore = valoreBase * incremento;
      dettaglio.posizione = Math.round(valore);
      totale += valore;
    }
  }

  return {
    valoreValorizzazioni: Math.round(totale),
    dettaglioValorizzazioni: dettaglio,
  };
}

/**
 * Calcola le svalutazioni
 */
function calcolaSvalutazioni(dati: DatiImmobile, valoreBase: number) {
  const moltiplicatoriStato = datiMercatoJson.moltiplicatori_stato as any;

  const dettaglio: any = {};
  let totale = 0;

  // Stato manutenzione (solo se negativo)
  if (dati.statoManutenzione) {
    let decremento = 0;
    if (dati.statoManutenzione.includes('ristrutturare')) {
      decremento = Math.abs(moltiplicatoriStato.da_ristrutturare);
    } else if (dati.statoManutenzione.includes('abitabile')) {
      decremento = Math.abs(moltiplicatoriStato.abitabile);
    }

    if (decremento > 0) {
      const valore = valoreBase * decremento;
      dettaglio.statoManutenzione = Math.round(valore);
      totale += valore;
    }
  }

  // Distanza mare eccessiva (oltre 2km = -5%)
  if (dati.distanzaMare !== undefined && dati.distanzaMare > 2000) {
    const decremento = 0.05; // -5% per distanza eccessiva
    const valore = valoreBase * decremento;
    dettaglio.distanzaMare = Math.round(valore);
    totale += valore;
  }

  // Posizione rumorosa
  if (dati.tipoPosizione && dati.tipoPosizione.includes('rumorosa')) {
    const valore = valoreBase * 0.10;
    dettaglio.posizione = Math.round(valore);
    totale += valore;
  }

  return {
    valoreSvalutazioni: Math.round(totale),
    dettaglioSvalutazioni: dettaglio,
  };
}

/**
 * Simula il numero di immobili simili in zona
 * In produzione, questo interrogherebbe un database di annunci reali
 */
function simulaImmobiliSimili(dati: DatiImmobile): number {
  // Simulazione basata sul comune
  const basePerComune: Record<string, number> = {
    'Portoferraio': 8,
    'Campo nell\'Elba': 12,
    'Capoliveri': 10,
    'Marciana Marina': 6,
    'Porto Azzurro': 7,
    'Marciana': 5,
    'Rio': 4,
  };

  const base = basePerComune[dati.comune] || 8;
  // Aggiungi variazione casuale ±3
  return base + Math.floor(Math.random() * 7) - 3;
}

/**
 * Determina il livello di competitività
 */
function determinaCompetitivita(immobiliSimili: number): 'BASSA' | 'MEDIA' | 'ALTA' | 'MOLTO_ALTA' {
  if (immobiliSimili <= 3) return 'BASSA';
  if (immobiliSimili <= 8) return 'MEDIA';
  if (immobiliSimili <= 15) return 'ALTA';
  return 'MOLTO_ALTA';
}

/**
 * Calcola il prezzo consigliato in base alla competitività
 */
function calcolaPrezzoConsigliato(valoreTotale: number, livello: string): number {
  switch (livello) {
    case 'BASSA':
      return Math.round(valoreTotale * 1.05); // +5%
    case 'MEDIA':
      return Math.round(valoreTotale);
    case 'ALTA':
      return Math.round(valoreTotale * 0.95); // -5%
    case 'MOLTO_ALTA':
      return Math.round(valoreTotale * 0.90); // -10%
    default:
      return Math.round(valoreTotale);
  }
}

/**
 * Genera consigli personalizzati
 */
function generaConsigli(
  dati: DatiImmobile,
  valorizzazioni: any,
  svalutazioni: any
): { puntiForza: string[]; miglioramenti: string[]; strategiaVendita: string[] } {
  const puntiForza: string[] = [];
  const miglioramenti: string[] = [];
  const strategiaVendita: string[] = [];

  // Punti di forza
  if (valorizzazioni.vistaMare) {
    puntiForza.push('Vista mare di pregio');
  }
  if (valorizzazioni.distanzaMare) {
    puntiForza.push('Vicinanza al mare');
  }
  if (valorizzazioni.statoManutenzione) {
    puntiForza.push('Stato di manutenzione ottimo');
  }
  if (dati.hasGiardino) {
    puntiForza.push('Giardino privato');
  }
  if (dati.hasPostoAuto) {
    puntiForza.push(dati.tipoPostoAuto === 'coperto' ? 'Box auto coperto' : 'Posto auto');
  }

  // Miglioramenti
  if (svalutazioni.statoManutenzione) {
    miglioramenti.push('Ristrutturazione completa (+€' + Math.round(svalutazioni.statoManutenzione * 1.5).toLocaleString() + ')');
  }
  if (!dati.servizi?.includes('aria_condizionata')) {
    miglioramenti.push('Installare aria condizionata (+€14.000)');
  }
  if (!dati.servizi?.includes('fotovoltaico')) {
    miglioramenti.push('Installare pannelli solari (+€18.000)');
  }
  if (dati.classeEnergetica && !['A4', 'A3', 'A2', 'A1', 'A', 'B'].includes(dati.classeEnergetica)) {
    miglioramenti.push('Migliorare classe energetica (+€10.000)');
  }

  // Strategia vendita - personalizzata e con CTA
  strategiaVendita.push('Contattaci per ricevere la strategia di vendita personalizzata per il tuo immobile');
  if (puntiForza.length > 0) {
    strategiaVendita.push('Enfatizzare: ' + puntiForza.slice(0, 2).join(' e '));
  }
  strategiaVendita.push('Fotografie professionali con vista mare');
  strategiaVendita.push('Virtual tour 360° per massimizzare visibilità');

  return { puntiForza, miglioramenti, strategiaVendita };
}
