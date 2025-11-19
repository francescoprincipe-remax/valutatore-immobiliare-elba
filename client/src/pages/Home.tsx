import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calculator, TrendingUp, FileText, Shield, MapPin, Home as HomeIcon } from "lucide-react";
import { Link } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="RE/MAX" className="h-12 w-auto" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">{APP_TITLE}</h1>
              <p className="text-xs text-muted-foreground">Valutazione Professionale</p>
            </div>
          </div>
          <Link href="/valuta">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Valuta Ora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/elba-hero.jpg)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-blue-600/85" />
        </div>

        {/* Content */}
        <div className="relative container py-20 md:py-32">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              Scopri il Valore del Tuo Immobile all'Isola d'Elba
            </h2>
            <p className="text-xl md:text-2xl text-white/95 mb-8 leading-relaxed">
              Valutazione professionale basata su dati di mercato reali. 
              Algoritmo avanzato con oltre 50 parametri analizzati.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/valuta">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto">
                  <Calculator className="mr-2 h-5 w-5" />
                  Inizia la Valutazione
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto"
                onClick={() => document.getElementById('come-funziona')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <FileText className="mr-2 h-5 w-5" />
                Scopri Come Funziona
              </Button>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Vantaggi Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Perché Scegliere il Nostro Valutatore
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tecnologia avanzata e dati di mercato aggiornati per una valutazione precisa e affidabile
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Vantaggio 1 */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">Dati Reali di Mercato</h4>
                <p className="text-muted-foreground">
                  Algoritmo basato su prezzi effettivi di vendita e quotazioni OMI aggiornate per ogni comune dell'Elba
                </p>
              </CardContent>
            </Card>

            {/* Vantaggio 2 */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Calculator className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">Calcolo Dettagliato</h4>
                <p className="text-muted-foreground">
                  Oltre 50 parametri analizzati: vista mare, distanza dalla spiaggia, pertinenze, stato, servizi e molto altro
                </p>
              </CardContent>
            </Card>

            {/* Vantaggio 3 */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">Report Professionale</h4>
                <p className="text-muted-foreground">
                  Report PDF scaricabile con breakdown completo del calcolo, analisi competitività e consigli personalizzati
                </p>
              </CardContent>
            </Card>

            {/* Vantaggio 4 */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">Affidabilità RE/MAX</h4>
                <p className="text-muted-foreground">
                  Sviluppato con la competenza del network immobiliare leader mondiale, presente in oltre 110 paesi
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Come Funziona Section */}
      <section id="come-funziona" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Come Funziona
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Processo semplice in 3 passaggi per ottenere la tua valutazione professionale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h4 className="text-xl font-bold mb-3 text-foreground">Inserisci i Dati</h4>
              <p className="text-muted-foreground">
                Compila il form guidato con le caratteristiche del tuo immobile: posizione, superficie, pertinenze e servizi
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h4 className="text-xl font-bold mb-3 text-foreground">Analisi Automatica</h4>
              <p className="text-muted-foreground">
                Il nostro algoritmo elabora i dati confrontandoli con il mercato locale e calcola il valore preciso
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h4 className="text-xl font-bold mb-3 text-foreground">Ricevi il Report</h4>
              <p className="text-muted-foreground">
                Ottieni subito la valutazione dettagliata con range di prezzo, analisi e consigli per la vendita
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Isola d'Elba Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Mercato Immobiliare Isola d'Elba
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                L'Isola d'Elba è una delle destinazioni più ambite del Mediterraneo, con un mercato immobiliare dinamico e in crescita costante.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h5 className="font-semibold text-foreground mb-1">8 Comuni Analizzati</h5>
                    <p className="text-muted-foreground text-sm">
                      Dati specifici per Portoferraio, Campo nell'Elba, Capoliveri, Marciana Marina, Porto Azzurro, Marciana, Rio e tutte le località
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <HomeIcon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h5 className="font-semibold text-foreground mb-1">1.586 Annunci Attivi</h5>
                    <p className="text-muted-foreground text-sm">
                      Database aggiornato con immobili in vendita e prezzi di mercato reali
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h5 className="font-semibold text-foreground mb-1">Trend Positivo +4%</h5>
                    <p className="text-muted-foreground text-sm">
                      Crescita media annuale del mercato immobiliare elbano
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/elba-beach.jpg" 
                alt="Isola d'Elba" 
                className="rounded-lg shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary text-white p-6 rounded-lg shadow-xl">
                <div className="text-3xl font-bold">€3.878</div>
                <div className="text-sm opacity-90">Prezzo medio al mq</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="container text-center">
          <h3 className="text-3xl md:text-5xl font-bold mb-6">
            Pronto a Scoprire il Valore del Tuo Immobile?
          </h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-95">
            Valutazione gratuita, immediata e senza impegno. Inizia ora e ricevi il tuo report professionale in pochi minuti.
          </p>
          <Link href="/valuta">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-10 py-7 h-auto">
              <Calculator className="mr-2 h-6 w-6" />
              Valuta Gratuitamente
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <img src={APP_LOGO} alt="RE/MAX" className="h-10 w-auto mb-4 brightness-0 invert" />
              <p className="text-sm text-white/70">
                Valutatore Immobiliare Professionale per l'Isola d'Elba
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Link Utili</h5>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#come-funziona" className="hover:text-white transition">Come Funziona</a></li>
                <li><a href="/faq" className="hover:text-white transition">Domande Frequenti (FAQ)</a></li>
                <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contatti</h5>
              <p className="text-sm text-white/70 mb-3">
                Per maggiori informazioni e consulenze personalizzate:
              </p>
              <a 
                href="https://wa.me/message/4K6JSOQWVOTRL1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Contattami su WhatsApp
              </a>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8">
            <p className="text-center text-sm text-white/70 mb-4 font-semibold">
              © 2025 Francesco Principe - Agente Immobiliare RE/MAX. Tutti i diritti riservati.
            </p>
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-xs text-white/50 leading-relaxed">
                Il presente strumento di valutazione immobiliare, comprensivo di tutti i contenuti, algoritmi, metodologie di calcolo, 
                interfaccia grafica, codice sorgente e database, costituisce opera dell'ingegno di esclusiva proprietà di <strong className="text-white/70">Francesco Principe</strong>.
              </p>
              <p className="text-center text-xs text-white/50 leading-relaxed mt-2">
                È fatto espresso divieto di riproduzione, anche parziale, distribuzione, condivisione, reverse engineering, 
                o qualsivoglia forma di utilizzo non autorizzato del presente strumento, senza previo consenso scritto del proprietario. 
                Ogni violazione sarà perseguita nelle competenti sedi civili e penali ai sensi della normativa vigente in materia di tutela del diritto d'autore e della proprietà intellettuale.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
