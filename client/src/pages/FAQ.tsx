import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { ChevronLeft, HelpCircle } from "lucide-react";
import RemaxWatermark from "@/components/RemaxWatermark";

export default function FAQ() {
  const faqs = [
    {
      question: "Come funziona il valutatore immobiliare?",
      answer: "Il nostro valutatore utilizza un algoritmo avanzato che analizza oltre 50 parametri del mercato immobiliare dell'Isola d'Elba. Considera la località, le caratteristiche dell'immobile, lo stato di manutenzione, le pertinenze e le valorizzazioni per fornire una stima accurata e professionale del valore di mercato."
    },
    {
      question: "La valutazione è gratuita?",
      answer: "Sì, la valutazione online è completamente gratuita e senza impegno. Puoi ottenere una stima professionale del valore del tuo immobile in pochi minuti, con la possibilità di scaricare un report PDF dettagliato."
    },
    {
      question: "Quanto è accurata la valutazione?",
      answer: "La valutazione si basa su dati reali di mercato aggiornati e quotazioni OMI (Osservatorio del Mercato Immobiliare). L'algoritmo considera le specificità del mercato dell'Isola d'Elba e fornisce un range di valutazione (minimo-massimo) per tenere conto delle variabili di mercato. Per una valutazione ancora più precisa, contattaci per un sopralluogo professionale."
    },
    {
      question: "Quali dati vengono analizzati?",
      answer: "Il sistema analizza: località e comune, tipologia immobile, superficie abitabile, numero di locali, stato di manutenzione, piano, presenza di ascensore, vista mare, esposizione, classe energetica, pertinenze (garage, cantina, giardino), servizi nelle vicinanze e molto altro."
    },
    {
      question: "Perché il prezzo al mq diminuisce con superfici maggiori?",
      answer: "È un principio economico standard del mercato immobiliare: immobili più grandi hanno un prezzo al metro quadro inferiore perché il mercato di acquirenti per superfici ampie è più ristretto. Il nostro algoritmo applica uno sconto progressivo (5-15%) per superfici oltre i 60mq, riflettendo la realtà del mercato."
    },
    {
      question: "Come vengono calcolate le valorizzazioni?",
      answer: "Le valorizzazioni (vista mare, servizi, posizione strategica) sono calcolate come percentuali del valore base, basate su analisi statistiche del mercato locale. Ad esempio, la vista mare può aggiungere fino al 15% del valore, mentre la vicinanza ai servizi fino al 10%."
    },
    {
      question: "Posso usare questa valutazione per vendere?",
      answer: "La valutazione fornita è un'ottima base di partenza per determinare il prezzo di vendita. Tuttavia, per una vendita professionale ti consigliamo di contattarci per: una valutazione con sopralluogo, analisi della concorrenza locale, strategia di marketing personalizzata e supporto nella trattativa."
    },
    {
      question: "I miei dati sono al sicuro?",
      answer: "Sì, trattiamo i tuoi dati con la massima riservatezza secondo il GDPR. I dati inseriti vengono utilizzati esclusivamente per generare la valutazione e, se richiesto, per inviarti il report PDF. Non condividiamo mai i tuoi dati con terze parti senza il tuo consenso esplicito."
    },
    {
      question: "Quanto tempo ci vuole per ottenere la valutazione?",
      answer: "La valutazione è istantanea! Dopo aver compilato il form (richiede circa 2-3 minuti), il sistema calcola immediatamente il valore e ti mostra i risultati dettagliati con grafici, range di prezzo e consigli personalizzati."
    },
    {
      question: "Posso valutare qualsiasi tipo di immobile?",
      answer: "Il valutatore è ottimizzato per appartamenti, ville, villette a schiera e case indipendenti nell'Isola d'Elba. Per immobili commerciali, terreni o proprietà particolari, ti consigliamo di contattarci direttamente per una valutazione personalizzata."
    },
    {
      question: "Come posso ottenere il report PDF?",
      answer: "Dopo aver visualizzato i risultati della valutazione, clicca sul pulsante 'Scarica Report PDF'. Ti verrà chiesto di inserire nome, cognome e telefono per ricevere il report completo con tutti i dettagli della valutazione, grafici e consigli strategici."
    },
    {
      question: "Cosa include la 'Guida Vendita Veloce'?",
      answer: "Contattandoci tramite WhatsApp riceverai una guida personalizzata con: timing ottimale per la vendita, strategie di pricing, consigli per preparare l'immobile, tecniche di marketing efficaci, gestione delle trattative e supporto nella documentazione necessaria."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <RemaxWatermark />
      
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img src={APP_LOGO} alt="RE/MAX" className="h-12 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground">{APP_TITLE}</h1>
                <p className="text-xs text-muted-foreground">Valutazione Professionale</p>
              </div>
            </div>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Torna alla Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Domande Frequenti</h1>
            <p className="text-lg text-muted-foreground">
              Tutto quello che devi sapere sul Valutatore Immobiliare per l'Isola d'Elba
            </p>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {index + 1}
                    </span>
                    <span>{faq.question}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed pl-11">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <Card className="mt-12 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="py-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Hai altre domande?</h3>
              <p className="text-muted-foreground mb-6">
                Contattaci direttamente su WhatsApp per ricevere assistenza personalizzata
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://wa.me/message/4K6JSOQWVOTRL1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Contattaci su WhatsApp
                </a>
                <Link href="/valuta">
                  <Button size="lg" variant="outline">
                    Valuta il Tuo Immobile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-white py-8 mt-12">
        <div className="container">
          <div className="text-center">
            <p className="text-sm text-white/70 mb-2">
              © 2025 Francesco Principe - Agente Immobiliare RE/MAX. Tutti i diritti riservati.
            </p>
            <p className="text-xs text-white/50">
              Valutatore Immobiliare Professionale per l'Isola d'Elba
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
