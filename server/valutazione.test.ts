import { describe, expect, it } from "vitest";
import { calcolaValutazione, type DatiImmobile } from "./valutazione-engine";

describe("Algoritmo di Valutazione Immobiliare", () => {
  it("calcola correttamente il valore base di un appartamento", () => {
    const datiImmobile: DatiImmobile = {
      comune: "Portoferraio",
      tipologia: "appartamento",
      superficieAbitabile: 80,
      statoManutenzione: "buono",
    };

    const risultato = calcolaValutazione(datiImmobile);

    expect(risultato.valoreBase).toBeGreaterThan(0);
    expect(risultato.prezzoMqZona).toBeGreaterThan(0);
    expect(risultato.valoreTotale).toBe(risultato.valoreBase);
  });

  it("applica correttamente il bonus vista mare", () => {
    const datiBase: DatiImmobile = {
      comune: "Capoliveri",
      tipologia: "villa",
      superficieAbitabile: 150,
      statoManutenzione: "ottimo",
    };

    const risultatoSenzaVista = calcolaValutazione(datiBase);

    const datiConVista: DatiImmobile = {
      ...datiBase,
      vistaMare: "panoramica",
    };

    const risultatoConVista = calcolaValutazione(datiConVista);

    expect(risultatoConVista.valoreTotale).toBeGreaterThan(risultatoSenzaVista.valoreTotale);
    expect(risultatoConVista.valoreValorizzazioni).toBeGreaterThan(0);
    expect(risultatoConVista.dettaglioValorizzazioni.vistaMare).toBeDefined();
  });

  it("calcola correttamente il valore delle pertinenze", () => {
    const datiImmobile: DatiImmobile = {
      comune: "Campo nell'Elba",
      tipologia: "villa",
      superficieAbitabile: 120,
      statoManutenzione: "buono",
      hasGiardino: true,
      superficieGiardino: 200,
      tipoGiardino: "villa",
      hasPiscina: true,
      hasPostoAuto: true,
      tipoPostoAuto: "coperto",
      numeroPostiAuto: 2,
    };

    const risultato = calcolaValutazione(datiImmobile);

    expect(risultato.valorePertinenze).toBeGreaterThan(0);
    expect(risultato.dettaglioPertinenze.giardino).toBeGreaterThan(0);
    expect(risultato.dettaglioPertinenze.postoAuto).toBeGreaterThan(0);
  });

  it("applica correttamente le svalutazioni", () => {
    const datiImmobile: DatiImmobile = {
      comune: "Marciana Marina",
      tipologia: "appartamento",
      superficieAbitabile: 70,
      statoManutenzione: "ristrutturare",
      distanzaMare: 2500,
    };

    const risultato = calcolaValutazione(datiImmobile);

    expect(risultato.valoreSvalutazioni).toBeGreaterThan(0);
    expect(risultato.dettaglioSvalutazioni.statoManutenzione).toBeGreaterThan(0);
    expect(risultato.dettaglioSvalutazioni.distanzaMare).toBeGreaterThan(0);
  });

  it("calcola range di prezzo corretto (±10%)", () => {
    const datiImmobile: DatiImmobile = {
      comune: "Porto Azzurro",
      tipologia: "appartamento",
      superficieAbitabile: 90,
      statoManutenzione: "buono",
    };

    const risultato = calcolaValutazione(datiImmobile);

    const rangeMin = risultato.valoreTotale * 0.9;
    const rangeMax = risultato.valoreTotale * 1.1;

    expect(risultato.valoreMin).toBeCloseTo(rangeMin, 0);
    expect(risultato.valoreMax).toBeCloseTo(rangeMax, 0);
  });

  it("genera consigli personalizzati", () => {
    const datiImmobile: DatiImmobile = {
      comune: "Capoliveri",
      localita: "Lacona",
      tipologia: "villa",
      superficieAbitabile: 180,
      statoManutenzione: "ottimo",
      vistaMare: "frontale",
      hasGiardino: true,
      superficieGiardino: 300,
      tipoGiardino: "villa",
      hasPiscina: true,
      servizi: ["aria_condizionata", "fotovoltaico"],
    };

    const risultato = calcolaValutazione(datiImmobile);

    expect(risultato.consigli.puntiForza.length).toBeGreaterThan(0);
    expect(risultato.consigli.strategiaVendita.length).toBeGreaterThan(0);
  });

  it("determina correttamente il livello di competitività", () => {
    const datiImmobile: DatiImmobile = {
      comune: "Marciana",
      tipologia: "rustico",
      superficieAbitabile: 100,
      statoManutenzione: "buono",
    };

    const risultato = calcolaValutazione(datiImmobile);

    expect(['BASSA', 'MEDIA', 'ALTA', 'MOLTO_ALTA']).toContain(risultato.livelloCompetitivita);
    expect(risultato.immobiliSimiliZona).toBeGreaterThan(0);
    expect(risultato.prezzoConsigliato).toBeGreaterThan(0);
  });

  it("gestisce località premium con prezzi più alti", () => {
    const datiBase: DatiImmobile = {
      comune: "Campo nell'Elba",
      tipologia: "appartamento",
      superficieAbitabile: 80,
      statoManutenzione: "buono",
    };

    const risultatoBase = calcolaValutazione(datiBase);

    const datiPremium: DatiImmobile = {
      ...datiBase,
      localita: "Cavoli",
    };

    const risultatoPremium = calcolaValutazione(datiPremium);

    expect(risultatoPremium.prezzoMqZona).toBeGreaterThan(risultatoBase.prezzoMqZona);
  });

  it("calcola correttamente immobile complesso con tutte le caratteristiche", () => {
    const datiCompleti: DatiImmobile = {
      comune: "Portoferraio",
      localita: "Biodola",
      tipologia: "villa",
      superficieAbitabile: 250,
      numeroCamere: 5,
      numeroBagni: 3,
      statoManutenzione: "nuovo",
      classeEnergetica: "A3",
      hasGiardino: true,
      superficieGiardino: 500,
      tipoGiardino: "villa",
      hasPiscina: true,
      hasTerrazzo: true,
      superficieTerrazzo: 40,
      tipoTerrazzo: "coperto",
      hasPostoAuto: true,
      tipoPostoAuto: "coperto",
      numeroPostiAuto: 3,
      vistaMare: "panoramica",
      esposizione: ["Sud", "Ovest"],
      tipoPosizione: "panoramica",
      accessoMare: "diretto",
      distanzaMare: 50,
      servizi: ["aria_condizionata", "fotovoltaico", "pompa_calore", "allarme", "domotica"],
      finiture: ["parquet", "marmo", "cucina_arredata"],
    };

    const risultato = calcolaValutazione(datiCompleti);

    // Verifica che tutti i componenti siano presenti
    expect(risultato.valoreBase).toBeGreaterThan(0);
    expect(risultato.valorePertinenze).toBeGreaterThan(0);
    expect(risultato.valoreValorizzazioni).toBeGreaterThan(0);
    
    // Verifica dettagli pertinenze
    expect(risultato.dettaglioPertinenze.giardino).toBeGreaterThan(0);
    expect(risultato.dettaglioPertinenze.terrazzo).toBeGreaterThan(0);
    expect(risultato.dettaglioPertinenze.postoAuto).toBeGreaterThan(0);

    // Verifica dettagli valorizzazioni
    expect(risultato.dettaglioValorizzazioni.vistaMare).toBeGreaterThan(0);
    expect(risultato.dettaglioValorizzazioni.distanzaMare).toBeGreaterThan(0);
    expect(risultato.dettaglioValorizzazioni.statoManutenzione).toBeGreaterThan(0);
    expect(risultato.dettaglioValorizzazioni.classeEnergetica).toBeGreaterThan(0);
    expect(risultato.dettaglioValorizzazioni.servizi).toBeGreaterThan(0);
    expect(risultato.dettaglioValorizzazioni.accessoMare).toBeGreaterThan(0);

    // Verifica che il totale sia la somma corretta
    const totaleCalcolato = risultato.valoreBase + 
                           risultato.valorePertinenze + 
                           risultato.valoreValorizzazioni - 
                           risultato.valoreSvalutazioni;
    
    expect(risultato.valoreTotale).toBeCloseTo(totaleCalcolato, 0);

    // Verifica consigli
    expect(risultato.consigli.puntiForza.length).toBeGreaterThan(3);
    expect(risultato.consigli.strategiaVendita.length).toBeGreaterThan(0);
  });
});
