/**
 * Dati di contatto agente RE/MAX
 */

export const CONTATTI = {
  whatsapp: {
    url: "https://wa.me/message/4K6JSOQWVOTRL1",
    numero: "+39 XXX XXX XXXX", // Inserisci numero visibile
    messaggio: "Ciao! Ho appena fatto una valutazione sul sito e vorrei maggiori informazioni."
  },
  email: "info@remaxelba.it", // Aggiorna con email reale
  telefono: "+39 XXX XXX XXXX", // Aggiorna con telefono reale
  nome: "Agente RE/MAX Elba",
  agenzia: "RE/MAX Isola d'Elba"
};

// Funzione helper per creare link WhatsApp con messaggio personalizzato
export function getWhatsAppLink(messaggio?: string): string {
  const msg = encodeURIComponent(messaggio || CONTATTI.whatsapp.messaggio);
  return `${CONTATTI.whatsapp.url}?text=${msg}`;
}
