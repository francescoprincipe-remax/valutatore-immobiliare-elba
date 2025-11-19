import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

/**
 * Banner GDPR conforme normativa EU
 * - Cookie consent
 * - Privacy policy
 * - Salvataggio preferenze localStorage
 */

export default function GDPRBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Controlla se l'utente ha già accettato
    const consent = localStorage.getItem('gdpr_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('gdpr_consent', 'accepted');
    localStorage.setItem('gdpr_consent_date', new Date().toISOString());
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem('gdpr_consent', 'rejected');
    localStorage.setItem('gdpr_consent_date', new Date().toISOString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t-2 border-primary shadow-2xl">
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2 text-foreground">
              🍪 Informativa Cookie e Privacy
            </h3>
            <p className="text-sm text-muted-foreground">
              Questo sito utilizza cookie tecnici necessari al funzionamento e cookie analitici per migliorare l'esperienza utente. 
              Proseguendo la navigazione accetti l'utilizzo dei cookie. 
              Per maggiori informazioni consulta la nostra{" "}
              <a href="/privacy" className="underline text-primary hover:text-primary/80">
                Privacy Policy
              </a>.
            </p>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <Button
              onClick={handleReject}
              variant="outline"
              size="sm"
            >
              Rifiuta
            </Button>
            <Button
              onClick={handleAccept}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              Accetta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
