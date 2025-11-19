
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { CONTATTI } from "@/data/contatti";

/**
 * CTA WhatsApp floating per conversione funnel
 * - Bottone fisso in basso a sinistra
 * - Popup con urgency dopo 10 secondi
 * - Chiudibile ma riappare dopo scroll
 */

export default function WhatsAppCTA() {

  const handleWhatsAppClick = () => {
    window.open(CONTATTI.whatsapp.url, '_blank');
  };



  return (
    <>
      {/* Bottone fisso floating */}
      <div className="fixed bottom-20 left-4 z-50">
        <Button
          onClick={handleWhatsAppClick}
          size="lg"
          className="rounded-full w-16 h-16 shadow-2xl bg-green-500 hover:bg-green-600 text-white animate-bounce"
        >
          <MessageCircle className="h-8 w-8" />
        </Button>
      </div>


    </>
  );
}
