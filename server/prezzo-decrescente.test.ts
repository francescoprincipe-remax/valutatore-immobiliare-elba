import { describe, expect, it } from "vitest";
import { calcolaValutazione } from "./valutazione-engine";

describe("Prezzo/mq decrescente con superficie", () => {
  it("dovrebbe applicare sconto progressivo per superfici oltre 60mq", () => {
    // Test 1: Appartamento 50mq (sotto soglia) - nessuno sconto
    const dati50mq = {
      comune: "Portoferraio",
      localita: "Centro",
      tipologia: "appartamento" as const,
      superficie: 50,
      locali: 2,
      bagni: 1,
      statoManutenzione: "buono" as const,
      piano: "2",
      ascensore: false,
      annoCostruzione: 1990,
      vistaMare: false,
      esposizione: "sud" as const,
      balcone: true,
      terrazzo: false,
      giardino: false,
      garage: false,
      cantina: false,
      arredato: false,
      classeEnergetica: "E" as const,
      riscaldamento: "autonomo" as const,
      condizionamento: false,
      allarme: false,
      videosorveglianza: false,
      portaBlindata: false,
      inferriate: false,
      piscina: false,
      ascensorePrivato: false,
      portineria: false,
      parquet: false,
      marmo: false,
      serviziVicini: false,
      vicinanzaMare: "500-1000m" as const,
      vicinanzaCentro: "centro" as const,
      vicinanzaServizi: "vicini" as const,
      posizioneStrategica: false,
      zonaResidenziale: true,
      zonaCommerciale: false,
      vistaMonti: false,
      vistaCampagna: false,
      silenzioso: true,
      luminoso: true,
    };

    // Test 2: Appartamento 80mq (oltre soglia) - sconto 5%
    const dati80mq = { ...dati50mq, superficie: 80 };

    // Test 3: Appartamento 120mq (oltre soglia) - sconto 10%
    const dati120mq = { ...dati50mq, superficie: 120 };

    // Test 4: Appartamento 180mq (oltre soglia) - sconto 15%
    const dati180mq = { ...dati50mq, superficie: 180 };

    const risultato50 = calcolaValutazione(dati50mq);
    const risultato80 = calcolaValutazione(dati80mq);
    const risultato120 = calcolaValutazione(dati120mq);
    const risultato180 = calcolaValutazione(dati180mq);

    // Verifica che il prezzo/mq diminuisca all'aumentare della superficie
    const prezzoMq50 = risultato50.valoreBase / 50;
    const prezzoMq80 = risultato80.valoreBase / 80;
    const prezzoMq120 = risultato120.valoreBase / 120;
    const prezzoMq180 = risultato180.valoreBase / 180;

    console.log("Prezzo/mq 50mq:", prezzoMq50.toFixed(2));
    console.log("Prezzo/mq 80mq:", prezzoMq80.toFixed(2));
    console.log("Prezzo/mq 120mq:", prezzoMq120.toFixed(2));
    console.log("Prezzo/mq 180mq:", prezzoMq180.toFixed(2));

    // Verifica che il prezzo/mq diminuisca progressivamente
    expect(prezzoMq80).toBeLessThan(prezzoMq50);
    expect(prezzoMq120).toBeLessThan(prezzoMq80);
    expect(prezzoMq180).toBeLessThan(prezzoMq120);

    // Verifica che lo sconto sia applicato correttamente
    // 80mq: sconto ~5%
    const scontoAtteso80 = prezzoMq50 * 0.95;
    expect(prezzoMq80).toBeCloseTo(scontoAtteso80, 0);

    // 120mq: sconto ~10%
    const scontoAtteso120 = prezzoMq50 * 0.90;
    expect(prezzoMq120).toBeCloseTo(scontoAtteso120, 0);

    // 180mq: sconto ~15%
    const scontoAtteso180 = prezzoMq50 * 0.85;
    expect(prezzoMq180).toBeCloseTo(scontoAtteso180, 0);
  });

  it("dovrebbe mantenere prezzo/mq costante per superfici sotto 60mq", () => {
    const dati30mq = {
      comune: "Porto Azzurro",
      localita: "Centro",
      tipologia: "appartamento" as const,
      superficie: 30,
      locali: 1,
      bagni: 1,
      statoManutenzione: "buono" as const,
      piano: "1",
      ascensore: false,
      annoCostruzione: 2000,
      vistaMare: false,
      esposizione: "sud" as const,
      balcone: true,
      terrazzo: false,
      giardino: false,
      garage: false,
      cantina: false,
      arredato: false,
      classeEnergetica: "D" as const,
      riscaldamento: "autonomo" as const,
      condizionamento: false,
      allarme: false,
      videosorveglianza: false,
      portaBlindata: false,
      inferriate: false,
      piscina: false,
      ascensorePrivato: false,
      portineria: false,
      parquet: false,
      marmo: false,
      serviziVicini: false,
      vicinanzaMare: "500-1000m" as const,
      vicinanzaCentro: "centro" as const,
      vicinanzaServizi: "vicini" as const,
      posizioneStrategica: false,
      zonaResidenziale: true,
      zonaCommerciale: false,
      vistaMonti: false,
      vistaCampagna: false,
      silenzioso: true,
      luminoso: true,
    };

    const dati50mq = { ...dati30mq, superficie: 50 };

    const risultato30 = calcolaValutazione(dati30mq);
    const risultato50 = calcolaValutazione(dati50mq);

    const prezzoMq30 = risultato30.valoreBase / 30;
    const prezzoMq50 = risultato50.valoreBase / 50;

    console.log("Prezzo/mq 30mq:", prezzoMq30.toFixed(2));
    console.log("Prezzo/mq 50mq:", prezzoMq50.toFixed(2));

    // Sotto 60mq, il prezzo/mq dovrebbe essere uguale (€3.200 per Porto Azzurro Centro)
    expect(prezzoMq30).toBe(3200);
    expect(prezzoMq50).toBe(3200);
  });
});
