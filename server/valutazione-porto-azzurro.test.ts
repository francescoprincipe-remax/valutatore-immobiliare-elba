import { describe, expect, it } from "vitest";
import { calcolaValutazione } from "./valutazione-engine";

describe("Valutazione Porto Azzurro - Fix Bug Valore €0", () => {
  it("calcola correttamente il valore totale per appartamento 49mq a Porto Azzurro Centro", () => {
    const datiTest = {
      comune: 'Porto Azzurro',
      localita: 'Centro',
      tipologia: 'Appartamento',
      superficieAbitabile: 49,
      statoManutenzione: 'Buono',
    };

    const risultato = calcolaValutazione(datiTest);

    // Verifica prezzo mq zona
    expect(risultato.prezzoMqZona).toBe(3200);

    // Verifica valore base
    expect(risultato.valoreBase).toBe(156800); // 49 * 3200

    // Verifica che valoreTotale NON sia 0 (bug fix)
    expect(risultato.valoreTotale).toBeGreaterThan(0);
    expect(risultato.valoreTotale).toBe(156800); // Senza valorizzazioni/svalutazioni

    // Verifica range
    expect(risultato.valoreMin).toBe(Math.round(156800 * 0.9)); // 141120
    expect(risultato.valoreMax).toBe(Math.round(156800 * 1.1)); // 172480

    // Verifica che il risultato sia un numero valido
    expect(typeof risultato.valoreTotale).toBe('number');
    expect(Number.isNaN(risultato.valoreTotale)).toBe(false);
  });

  it("calcola correttamente con valorizzazioni (vista mare, servizi)", () => {
    const datiTest = {
      comune: 'Porto Azzurro',
      localita: 'Centro',
      tipologia: 'Appartamento',
      superficieAbitabile: 49,
      statoManutenzione: 'Ottimo',
      vistaMare: 'totale',
      servizi: ['aria_condizionata', 'fotovoltaico'],
      distanzaMare: 100,
    };

    const risultato = calcolaValutazione(datiTest);

    // Verifica che ci siano valorizzazioni
    expect(risultato.valoreValorizzazioni).toBeGreaterThan(0);

    // Verifica che valoreTotale sia maggiore del valore base
    expect(risultato.valoreTotale).toBeGreaterThan(risultato.valoreBase);

    // Verifica che valoreTotale NON sia 0
    expect(risultato.valoreTotale).toBeGreaterThan(0);
  });

  it("verifica prezzo Porto Azzurro aggiornato a €3.200/mq", () => {
    const datiTest = {
      comune: 'Porto Azzurro',
      localita: 'Centro',
      tipologia: 'Appartamento',
      superficieAbitabile: 100,
    };

    const risultato = calcolaValutazione(datiTest);

    // Verifica che il prezzo sia €3.200/mq (non più €4.180)
    expect(risultato.prezzoMqZona).toBe(3200);
    expect(risultato.valoreBase).toBe(320000); // 100 * 3200
  });

  it("calcola correttamente con svalutazioni", () => {
    const datiTest = {
      comune: 'Porto Azzurro',
      localita: 'Centro',
      tipologia: 'Appartamento',
      superficieAbitabile: 49,
      statoManutenzione: 'Da ristrutturare',
      distanzaMare: 3000, // Oltre 2km
    };

    const risultato = calcolaValutazione(datiTest);

    // Verifica che ci siano svalutazioni
    expect(risultato.valoreSvalutazioni).toBeGreaterThan(0);

    // Verifica che valoreTotale sia minore del valore base
    expect(risultato.valoreTotale).toBeLessThan(risultato.valoreBase);

    // Verifica che valoreTotale NON sia 0 o negativo
    expect(risultato.valoreTotale).toBeGreaterThan(0);
  });
});
