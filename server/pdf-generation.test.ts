import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Test per il flusso completo di generazione PDF:
 * 1. Calcola valutazione (salva nel DB e restituisce valutazioneId)
 * 2. Genera PDF usando valutazioneId
 */

function createAnonymousContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null, // Utente anonimo
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("PDF Generation Flow", () => {
  it("calcola valutazione e genera PDF per utente anonimo", async () => {
    const ctx = createAnonymousContext();
    const caller = appRouter.createCaller(ctx);

    // Step 1: Calcola valutazione
    console.log("[TEST] Step 1: Calcolo valutazione...");
    const valutazioneResult = await caller.valutazione.calcola({
      comune: "Capoliveri",
      localita: "Centro",
      tipologia: "Appartamento",
      superficieAbitabile: 53,
      statoManutenzione: "Buono",
      piano: "2",
      vistaMare: "Sì",
      distanzaMare: 300,
      hasGiardino: false,
      hasTerrazzo: true,
      superficieTerrazzo: 15,
      hasPostoAuto: false,
    });

    console.log("[TEST] Risultato valutazione:", {
      valoreTotale: valutazioneResult.valoreTotale,
      valutazioneId: valutazioneResult.valutazioneId,
    });

    // Verifica che valutazioneId sia stato salvato
    expect(valutazioneResult.valutazioneId).toBeDefined();
    expect(valutazioneResult.valutazioneId).toBeGreaterThan(0);

    // Step 2: Genera PDF
    console.log("[TEST] Step 2: Generazione PDF...");
    const pdfResult = await caller.valutazione.generatePDF({
      valutazioneId: String(valutazioneResult.valutazioneId),
      leadData: {
        nome: "Mario",
        cognome: "Rossi",
        email: "mario.rossi@test.com",
        telefono: "+39 333 1234567",
        gdprConsent: true,
      },
    });

    console.log("[TEST] Risultato PDF:", {
      success: pdfResult.success,
      filename: pdfResult.filename,
      pdfSize: pdfResult.pdfBase64.length,
    });

    // Verifica che il PDF sia stato generato
    expect(pdfResult.success).toBe(true);
    expect(pdfResult.pdfBase64).toBeDefined();
    expect(pdfResult.pdfBase64.length).toBeGreaterThan(0);
    expect(pdfResult.filename).toBe("stima-immobiliare-elba.pdf");

    console.log("[TEST] ✅ Test completato con successo!");
  }, 60000); // Timeout 60 secondi per generazione PDF
});
