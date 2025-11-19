import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock del context tRPC
function createMockContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      clearCookie: () => {},
    } as any,
  };
}

describe("tRPC valutazione.calcola", () => {
  it("dovrebbe restituire valoreTotale corretto per Portoferraio 90mq", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      // Località
      comune: "Portoferraio",
      localita: "Centro",
      
      // Caratteristiche immobile
      tipologia: "appartamento" as const,
      superficieAbitabile: 90,
      numeroCamere: 2,
      numeroBagni: 1,
      piano: "1",
      
      // Stato
      statoManutenzione: "buono" as const,
      classeEnergetica: "E" as const,
      
      // Pertinenze
      pertinenze: {},
      
      // Vista e posizione
      esposizione: ["sud"],
      vistaMare: "no" as const,
      tipoPostizione: "centrale" as const,
      accessoMare: "no" as const,
      
      // Servizi
      servizi: [],
      
      // Parcheggio
      parcheggio: "no" as const,
    };

    console.log("\n=== TEST tRPC valutazione.calcola ===");
    console.log("Input:", JSON.stringify(input, null, 2));

    const risultato = await caller.valutazione.calcola(input);

    console.log("\n=== RISPOSTA tRPC ===");
    console.log("valoreTotale:", risultato.valoreTotale);
    console.log("valoreBase:", risultato.valoreBase);
    console.log("valorePertinenze:", risultato.valorePertinenze);
    console.log("valoreValorizzazioni:", risultato.valoreValorizzazioni);
    console.log("valoreSvalutazioni:", risultato.valoreSvalutazioni);
    console.log("\nRisultato completo:", JSON.stringify(risultato, null, 2));

    // Verifica che valoreTotale non sia 0
    expect(risultato.valoreTotale).toBeGreaterThan(0);
    
    // Verifica che il calcolo sia corretto
    const calcoloManuale = 
      risultato.valoreBase + 
      risultato.valorePertinenze + 
      risultato.valoreValorizzazioni - 
      risultato.valoreSvalutazioni;
    
    expect(risultato.valoreTotale).toBe(Math.round(calcoloManuale));
    
    console.log("\n✅ Test passato: valoreTotale =", risultato.valoreTotale);
  });
});
