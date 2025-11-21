import { describe, expect, it } from "vitest";
import { sendLeadNotification } from "./_core/email";

describe("SendGrid Email Integration", () => {
  it("should send lead notification email successfully", async () => {
    const testLeadData = {
      nome: "Mario",
      cognome: "Rossi",
      email: "mario.rossi@example.com",
      telefono: "+39 333 1234567",
      comune: "Capoliveri",
      tipologia: "Appartamento",
      superficie: 75,
      valoreTotale: 250000,
    };

    const result = await sendLeadNotification(testLeadData);

    // Se le credenziali SendGrid sono corrette, l'invio dovrebbe avere successo
    expect(result).toBe(true);
  }, 15000); // Timeout 15s per chiamata API SendGrid

  it("should handle missing API key gracefully", async () => {
    // Salva API key originale
    const originalApiKey = process.env.SENDGRID_API_KEY;
    
    // Rimuovi temporaneamente API key
    process.env.SENDGRID_API_KEY = '';

    const testLeadData = {
      nome: "Test",
      cognome: "User",
      email: "test@example.com",
      telefono: "+39 333 0000000",
    };

    const result = await sendLeadNotification(testLeadData);

    // Senza API key, dovrebbe restituire false ma non crashare
    expect(result).toBe(false);

    // Ripristina API key
    process.env.SENDGRID_API_KEY = originalApiKey;
  });
});
