import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Share2,
  Home as HomeIcon,
  TrendingUp,
  TrendingDown,
  MapPin,
  Building2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import type { RisultatoValutazione } from "../../../server/valutazione-engine";
import { generatePDFReport } from "@/lib/pdf-generator";
import { trpc } from "@/lib/trpc";

export default function Risultato() {
  const [, setLocation] = useLocation();
  const [risultato, setRisultato] = useState<RisultatoValutazione | null>(null);
  const [datiImmobile, setDatiImmobile] = useState<any>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState({
    nome: '',
    cognome: '',
    telefono: '',
    email: '',
    gdprConsent: false
  });

  useEffect(() => {
    // Recupera i risultati dal sessionStorage
    const risultatoStr = sessionStorage.getItem('valutazione_risultato');
    const datiStr = sessionStorage.getItem('valutazione_dati');

    if (!risultatoStr || !datiStr) {
      // Nessun risultato disponibile, torna alla home
      setLocation('/');
      return;
    }

    try {
      const parsedRisultato = JSON.parse(risultatoStr);
      const parsedDati = JSON.parse(datiStr);
      console.log('=== DEBUG RISULTATO ===');
      console.log('Risultato:', parsedRisultato);
      console.log('Dati immobile:', parsedDati);
      setRisultato(parsedRisultato);
      setDatiImmobile(parsedDati);
    } catch (error) {
      console.error('Errore nel parsing dei dati:', error);
      setLocation('/');
    }
  }, [setLocation]);

  if (!risultato || !datiImmobile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento risultati...</p>
        </div>
      </div>
    );
  }

  const handleShareWhatsApp = () => {
    const text = `🏠 Valutazione Immobiliare - Isola d'Elba\n\n` +
      `📍 ${datiImmobile.comune}${datiImmobile.localita ? ' - ' + datiImmobile.localita : ''}\n` +
      `💰 Valore stimato: €${(risultato.valoreTotale || 0).toLocaleString()}\n` +
      `📊 Range: €${(risultato.valoreMin || 0).toLocaleString()} - €${(risultato.valoreMax || 0).toLocaleString()}\n\n` +
      `Valutazione professionale RE/MAX`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleDownloadPDF = () => {
    setShowLeadForm(true);
  };

  const createLeadMutation = trpc.lead.create.useMutation();

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!leadData.nome || !leadData.cognome || !leadData.telefono || !leadData.email) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    if (!leadData.gdprConsent) {
      alert('Devi accettare il consenso GDPR per scaricare il PDF');
      return;
    }
    
    try {
      // Salva lead nel database e invia notifica email
      await createLeadMutation.mutateAsync({
        nome: leadData.nome,
        cognome: leadData.cognome,
        email: leadData.email,
        telefono: leadData.telefono,
        gdprConsent: leadData.gdprConsent,
        comune: datiImmobile?.comune,
        tipologia: datiImmobile?.tipologia,
        superficie: datiImmobile?.superficieAbitabile,
        valoreTotale: risultato?.valoreTotale,
      });

      // Genera PDF con dati lead
      if (risultato && datiImmobile) {
        await generatePDFReport(risultato, datiImmobile);
        setShowLeadForm(false);
        // Reset form
        setLeadData({ nome: '', cognome: '', telefono: '', email: '', gdprConsent: false });
      }
    } catch (error) {
      console.error('Errore durante la generazione del PDF:', error);
      alert('Errore durante la generazione del PDF');
    }
  };

  // Calcola percentuali per i grafici
  const totaleValore = risultato.valoreBase + risultato.valorePertinenze + risultato.valoreValorizzazioni;
  const percBase = (risultato.valoreBase / totaleValore) * 100;
  const percPertinenze = (risultato.valorePertinenze / totaleValore) * 100;
  const percValorizzazioni = (risultato.valoreValorizzazioni / totaleValore) * 100;

  // Badge competitività
  const competitivitaColor = {
    'BASSA': 'bg-green-100 text-green-800',
    'MEDIA': 'bg-blue-100 text-blue-800',
    'ALTA': 'bg-orange-100 text-orange-800',
    'MOLTO_ALTA': 'bg-red-100 text-red-800'
  }[risultato.livelloCompetitivita];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src={APP_LOGO} alt="RE/MAX" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-foreground">Valutatore Immobiliare</h1>
                <p className="text-xs text-muted-foreground">Isola d'Elba</p>
              </div>
            </div>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShareWhatsApp}>
              <Share2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Condividi</span>
            </Button>
            <Button size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-6xl">
        {/* Alert Immobili Grandi >200mq */}
        {datiImmobile && datiImmobile.superficieAbitabile > 200 && (
          <Card className="mb-6 border-2 border-orange-500 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-orange-900 mb-2">
                    Immobile di Grandi Dimensioni
                  </h3>
                  <p className="text-orange-800 mb-4">
                    Per immobili oltre 200 mq, la stima automatica potrebbe non riflettere accuratamente il valore di mercato. 
                    <strong> Ti consigliamo una valutazione personalizzata</strong> con un nostro agente esperto per ottenere 
                    una quotazione precisa e strategie di vendita su misura.
                  </p>
                  <a
                    href="https://wa.me/393347917898?text=Ciao%2C%20ho%20un%20immobile%20di%20grandi%20dimensioni%20all%27Isola%20d%27Elba%20e%20vorrei%20una%20valutazione%20personalizzata."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Richiedi Valutazione Personalizzata
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hero Result Card */}
        <Card className="mb-8 border-2 border-primary/20 shadow-lg">
          <CardContent className="pt-8">
            <div className="text-center mb-6">
              <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                <HomeIcon className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {datiImmobile.tipologia} • {datiImmobile.superficieAbitabile} mq
              </h2>
              <p className="text-muted-foreground flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" />
                {datiImmobile.comune}{datiImmobile.localita ? ` - ${datiImmobile.localita}` : ''}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Valore Minimo</div>
                <div className="text-2xl font-bold text-foreground">
                  €{(risultato.valoreMin || 0).toLocaleString()}
                </div>
              </div>

              <div className="text-center p-6 bg-primary/10 rounded-lg border-2 border-primary">
                <div className="text-sm text-primary mb-1">Valore Stimato</div>
                <div className="text-3xl font-bold text-primary">
                  €{(risultato.valoreTotale || 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  €{risultato.prezzoMqZona}/mq
                </div>
              </div>

              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Valore Massimo</div>
                <div className="text-2xl font-bold text-foreground">
                  €{(risultato.valoreMax || 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm mb-6">
              <div className={`px-4 py-2 rounded-full font-semibold ${competitivitaColor}`}>
                Competitività: {risultato.livelloCompetitivita.replace('_', ' ')}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">Stima Automatica Indicativa</h3>
                  <p className="text-sm text-amber-800">
                    Questa è una <strong>stima automatica di mercato</strong> generata da un algoritmo basato su dati pubblici e statistiche. 
                    <strong className="block mt-1">Non sostituisce una valutazione professionale</strong> effettuata da un agente immobiliare abilitato. 
                    I valori indicati sono puramente orientativi e non vincolanti.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Composizione Valore */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Composizione del Valore
            </CardTitle>
            <CardDescription>
              Analisi dettagliata dei fattori che determinano la stima
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Valore Base */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-foreground">Valore Base</span>
                <span className="font-bold text-lg">€{(risultato.valoreBase || 0).toLocaleString()}</span>
              </div>
              <Progress value={percBase} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">
                {datiImmobile.superficieAbitabile} mq × €{risultato.prezzoMqZona}/mq
              </p>
            </div>

            {/* Pertinenze */}
            {risultato.valorePertinenze > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Pertinenze
                  </span>
                  <span className="font-bold text-lg text-green-600">
                    +€{(risultato.valorePertinenze || 0).toLocaleString()}
                  </span>
                </div>
                <Progress value={percPertinenze} className="h-3" />
              </div>
            )}

            {/* Valorizzazioni */}
            {risultato.valoreValorizzazioni > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Valorizzazioni
                  </span>
                  <span className="font-bold text-lg text-blue-600">
                    +€{(risultato.valoreValorizzazioni || 0).toLocaleString()}
                  </span>
                </div>
                <Progress value={percValorizzazioni} className="h-3" />
              </div>
            )}

            {/* Svalutazioni */}
            {risultato.valoreSvalutazioni > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Svalutazioni
                  </span>
                  <span className="font-bold text-lg text-red-600">
                    -€{(risultato.valoreSvalutazioni || 0).toLocaleString()}
                  </span>
                </div>

              </div>
            )}

            {/* Breakdown Dettagliato (Collapsible) */}
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => setShowBreakdown(!showBreakdown)}
              >
                <span className="font-semibold">Visualizza calcolo dettagliato</span>
                {showBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              
              {showBreakdown && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Valore base immobile</span>
                    <span className="font-mono">€{(risultato.valoreBase || 0).toLocaleString()}</span>
                  </div>
                  {risultato.valorePertinenze > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>+ Pertinenze</span>
                      <span className="font-mono">€{(risultato.valorePertinenze || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {risultato.valoreValorizzazioni > 0 && (
                    <div className="flex justify-between text-blue-700">
                      <span>+ Valorizzazioni</span>
                      <span className="font-mono">€{(risultato.valoreValorizzazioni || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {risultato.valoreSvalutazioni > 0 && (
                    <div className="flex justify-between text-red-700">
                      <span>- Svalutazioni</span>
                      <span className="font-mono">€{(risultato.valoreSvalutazioni || 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t-2 border-primary font-bold text-base">
                    <span>TOTALE</span>
                    <span className="font-mono text-primary">€{(risultato.valoreTotale || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consigli */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Punti di Forza */}
          {risultato.consigli.puntiForza.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-5 w-5" />
                  Punti di Forza
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {risultato.consigli.puntiForza.map((punto, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{punto}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Sezione Miglioramenti rimossa - suggerimenti sempre uguali */}
        </div>

        {/* Strategia Vendita */}
        {risultato.consigli.strategiaVendita.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Strategia di Vendita
              </CardTitle>
              <CardDescription>
                Consigli per massimizzare il valore e velocizzare la vendita
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {risultato.consigli.strategiaVendita.map((consiglio, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm">{consiglio}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Prezzo Consigliato */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-blue-600/10 border-primary/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Prezzo di Vendita Consigliato
              </h3>
              <div className="text-4xl font-bold text-primary mb-3">
                €{(risultato.prezzoConsigliato || 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                Basato sull'analisi di competitività e sulle condizioni attuali del mercato immobiliare dell'Isola d'Elba
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Finale */}
        <Card className="bg-primary text-white">
          <CardContent className="pt-6 text-center">
            <h3 className="text-2xl font-bold mb-4">
              🚀 Vuoi Vendere Più Velocemente?
            </h3>
            <p className="mb-6 opacity-90">
              Contattaci per ricevere una guida personalizzata su come vendere il tuo immobile all'Isola d'Elba. Strategie testate, consigli pratici e supporto professionale RE/MAX.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://wa.me/message/4K6JSOQWVOTRL1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-white/90 font-bold py-3 px-6 rounded-lg transition-colors text-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Guida Vendita Veloce
              </a>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-5 w-5" />
                Scarica Report PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Link Nuova Valutazione */}
        <div className="text-center mt-8">
          <Link href="/valuta">
            <Button variant="ghost" size="lg">
              Effettua una Nuova Valutazione
            </Button>
          </Link>
        </div>
      </div>

      {/* Modal Form Lead */}
      {showLeadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Scarica il Report Completo</h3>
            <p className="text-muted-foreground mb-6">
              Inserisci i tuoi dati per ricevere il report PDF dettagliato
            </p>
            
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={leadData.nome}
                  onChange={(e) => setLeadData({...leadData, nome: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Cognome *</label>
                <input
                  type="text"
                  required
                  value={leadData.cognome}
                  onChange={(e) => setLeadData({...leadData, cognome: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Telefono *</label>
                <input
                  type="tel"
                  required
                  value={leadData.telefono}
                  onChange={(e) => setLeadData({...leadData, telefono: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="+39 ..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={leadData.email}
                  onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="tua@email.com"
                />
              </div>
              
              <div className="flex items-start gap-2 mt-4 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="gdprConsent"
                  required
                  checked={leadData.gdprConsent}
                  onChange={(e) => setLeadData({...leadData, gdprConsent: e.target.checked})}
                  className="mt-1"
                />
                <label htmlFor="gdprConsent" className="text-sm text-gray-700">
                  Acconsento al trattamento dei miei dati personali secondo la normativa GDPR per ricevere il report PDF e comunicazioni relative alla valutazione immobiliare. *
                </label>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowLeadForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Scarica PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
