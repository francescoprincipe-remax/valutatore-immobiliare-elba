import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";

/**
 * Privacy Policy e Disclaimer Legale
 */

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-3">
              <img src={APP_LOGO} alt="RE/MAX" className="h-10" />
              <span className="font-bold text-lg text-foreground">{APP_TITLE}</span>
            </a>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy e Note Legali</h1>

        {/* Disclaimer Proprietà */}
        <section className="mb-12 p-6 bg-red-50 dark:bg-red-950/20 border-2 border-red-500 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-red-700 dark:text-red-400">
            ⚠️ Disclaimer Proprietà e Diritti d'Autore
          </h2>
          <div className="prose dark:prose-invert max-w-none text-foreground">
            <p className="mb-4">
              Il presente sito web, inclusi tutti i contenuti, il design, il codice sorgente, gli algoritmi di valutazione, 
              i dati di mercato, le immagini, i loghi e qualsiasi altro materiale (di seguito "Contenuti") sono di esclusiva 
              proprietà del titolare e sono protetti dalle leggi italiane ed internazionali sul diritto d'autore e sulla proprietà intellettuale.
            </p>
            <p className="mb-4 font-bold">
              È SEVERAMENTE VIETATO:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Riprodurre, copiare, duplicare, vendere, rivendere o sfruttare per qualsiasi scopo commerciale qualsiasi parte dei Contenuti;</li>
              <li>Modificare, adattare, tradurre, decompilare, disassemblare o effettuare reverse engineering del codice sorgente;</li>
              <li>Distribuire, pubblicare, trasmettere, condividere o rendere disponibili i Contenuti a terzi senza espressa autorizzazione scritta;</li>
              <li>Utilizzare i dati, gli algoritmi o le metodologie di valutazione per creare servizi concorrenti o derivati;</li>
              <li>Rimuovere, oscurare o modificare qualsiasi avviso di copyright, marchio o altra indicazione di proprietà.</li>
            </ul>
            <p className="mb-4">
              Qualsiasi utilizzo non autorizzato dei Contenuti costituisce violazione delle leggi sul diritto d'autore e può comportare 
              azioni legali civili e penali, incluse richieste di risarcimento danni e inibitorie.
            </p>
            <p className="font-bold text-red-700 dark:text-red-400">
              Per richieste di autorizzazione all'utilizzo dei Contenuti, contattare il titolare tramite i recapiti indicati sul sito.
            </p>
          </div>
        </section>

        {/* Privacy Policy */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Privacy Policy</h2>
          <div className="prose dark:prose-invert max-w-none text-foreground">
            <p className="mb-4">
              Ai sensi del Regolamento (UE) 2016/679 (GDPR) e del D.Lgs. 196/2003 (Codice Privacy), 
              il presente documento descrive le modalità di gestione del sito in riferimento al trattamento dei dati personali degli utenti.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Titolare del Trattamento</h3>
            <p className="mb-4">
              Il Titolare del trattamento dei dati è identificabile tramite i contatti presenti sul sito.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Tipologie di Dati Raccolti</h3>
            <p className="mb-4">
              Il sito raccoglie i seguenti dati:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, sistema operativo, pagine visitate, durata della visita;</li>
              <li><strong>Dati forniti volontariamente:</strong> informazioni sull'immobile inserite nel form di valutazione (superficie, località, caratteristiche);</li>
              <li><strong>Cookie tecnici:</strong> necessari al funzionamento del sito (sessione, preferenze);</li>
              <li><strong>Cookie analitici:</strong> per analizzare il traffico e migliorare l'esperienza utente (anonimi).</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Finalità del Trattamento</h3>
            <p className="mb-4">
              I dati sono trattati per le seguenti finalità:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Fornire il servizio di valutazione immobiliare richiesto;</li>
              <li>Migliorare la qualità e l'accuratezza dell'algoritmo di valutazione;</li>
              <li>Analizzare le statistiche di utilizzo del sito;</li>
              <li>Rispondere a richieste di contatto e assistenza;</li>
              <li>Adempiere agli obblighi di legge.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Base Giuridica</h3>
            <p className="mb-4">
              Il trattamento si basa su:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Consenso dell'interessato (art. 6.1.a GDPR);</li>
              <li>Esecuzione di un contratto o misure precontrattuali (art. 6.1.b GDPR);</li>
              <li>Legittimo interesse del titolare (art. 6.1.f GDPR).</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Conservazione dei Dati</h3>
            <p className="mb-4">
              I dati sono conservati per il tempo strettamente necessario alle finalità per cui sono stati raccolti. 
              I dati di navigazione sono conservati per un massimo di 12 mesi. Le valutazioni immobiliari possono essere 
              conservate in forma anonima per migliorare l'algoritmo.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Diritti dell'Interessato</h3>
            <p className="mb-4">
              L'utente ha diritto di:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Accedere ai propri dati personali;</li>
              <li>Rettificare dati inesatti o incompleti;</li>
              <li>Cancellare i dati (diritto all'oblio);</li>
              <li>Limitare il trattamento;</li>
              <li>Opporsi al trattamento;</li>
              <li>Revocare il consenso in qualsiasi momento;</li>
              <li>Presentare reclamo all'Autorità Garante per la Protezione dei Dati Personali.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Cookie</h3>
            <p className="mb-4">
              Il sito utilizza:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Cookie tecnici:</strong> essenziali per il funzionamento (non richiedono consenso);</li>
              <li><strong>Cookie analitici:</strong> per statistiche anonime (richiedono consenso).</li>
            </ul>
            <p className="mb-4">
              L'utente può gestire le preferenze sui cookie tramite il banner visualizzato alla prima visita 
              o modificando le impostazioni del proprio browser.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Modifiche alla Privacy Policy</h3>
            <p className="mb-4">
              Il Titolare si riserva il diritto di modificare la presente Privacy Policy in qualsiasi momento. 
              Le modifiche saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento.
            </p>

            <p className="mt-8 text-sm text-muted-foreground">
              <strong>Ultimo aggiornamento:</strong> 19 Novembre 2025
            </p>
          </div>
        </section>

        {/* Limitazione Responsabilità */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Limitazione di Responsabilità</h2>
          <div className="prose dark:prose-invert max-w-none text-foreground">
            <p className="mb-4">
              Le valutazioni immobiliari fornite da questo sito sono stime indicative basate su algoritmi automatici 
              e dati di mercato aggregati. Tali valutazioni:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>NON costituiscono perizie ufficiali o certificazioni di valore;</li>
              <li>NON sostituiscono la valutazione professionale di un perito qualificato;</li>
              <li>Possono variare rispetto al valore di mercato reale dell'immobile;</li>
              <li>Sono fornite "così come sono" senza garanzie di accuratezza o completezza.</li>
            </ul>
            <p className="mb-4">
              Il titolare non assume alcuna responsabilità per decisioni prese sulla base delle valutazioni fornite. 
              Per valutazioni ufficiali, si raccomanda di consultare un professionista abilitato.
            </p>
          </div>
        </section>

        {/* CTA Contatto */}
        <section className="text-center p-8 bg-primary/10 rounded-lg border-2 border-primary">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Hai domande?</h2>
          <p className="text-muted-foreground mb-6">
            Per qualsiasi chiarimento sulla Privacy Policy o per esercitare i tuoi diritti, contattami.
          </p>
          <Link href="/">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Torna alla Home
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
