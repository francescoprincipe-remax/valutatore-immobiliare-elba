import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Check, MapPin, Home as HomeIcon, Trees, Waves, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

import { COMUNI_ELBA, LOCALITA_PER_COMUNE } from "@/data/localita";

interface FormData {
  // Step 1: Localizzazione
  comune: string;
  localita: string;
  indirizzo: string;
  distanzaMare?: number;

  // Step 2: Tipologia
  tipologia: string;
  superficieAbitabile: number;
  numeroCamere: number;
  numeroBagni: number;
  piano: string;
  statoManutenzione: string;
  classeEnergetica: string;

  // Step 3: Pertinenze
  hasGiardino: boolean;
  superficieGiardino?: number;
  tipoGiardino?: string;
  hasPiscina: boolean;
  hasTerrazzo: boolean;
  superficieTerrazzo?: number;
  tipoTerrazzo?: string;
  hasCortile: boolean;
  superficieCortile?: number;
  hasCantina: boolean;
  superficieCantina?: number;
  hasPostoAuto: boolean;
  tipoPostoAuto?: string;
  numeroPostiAuto?: number;

  // Step 4: Vista e Posizione
  vistaMare: string;
  esposizione: string[];
  tipoPosizione: string;
  accessoMare: string;

  // Step 5: Servizi
  servizi: string[];
  finiture: string[];
}

const initialFormData: FormData = {
  comune: "",
  localita: "",
  indirizzo: "",
  tipologia: "",
  superficieAbitabile: 0,
  numeroCamere: 0,
  numeroBagni: 0,
  piano: "",
  statoManutenzione: "",
  classeEnergetica: "",
  hasGiardino: false,
  hasPiscina: false,
  hasTerrazzo: false,
  hasCortile: false,
  hasCantina: false,
  hasPostoAuto: false,
  vistaMare: "",
  esposizione: [],
  tipoPosizione: "",
  accessoMare: "",
  servizi: [],
  finiture: []
};

export default function Valuta() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const calcolaMutation = trpc.valutazione.calcola.useMutation({
    onSuccess: (data) => {
      // Salva i risultati e naviga alla pagina risultati
      sessionStorage.setItem('valutazione_risultato', JSON.stringify(data));
      sessionStorage.setItem('valutazione_dati', JSON.stringify(formData));
      
      // Salva anche l'ID valutazione per generare il PDF
      if (data.valutazioneId) {
        sessionStorage.setItem('valutazione_id', String(data.valutazioneId));
      }
      
      setLocation('/risultato');
    },
    onError: (error) => {
      toast.error("Errore nel calcolo della stima: " + error.message);
    }
  });

  const totalSteps = 6;

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    // Validazione base
    if (!formData.comune || !formData.tipologia || formData.superficieAbitabile <= 0) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    // Invia al backend
    calcolaMutation.mutate({
      ...formData,
      superficieGiardino: formData.hasGiardino ? formData.superficieGiardino : undefined,
      superficieTerrazzo: formData.hasTerrazzo ? formData.superficieTerrazzo : undefined,
      superficieCortile: formData.hasCortile ? formData.superficieCortile : undefined,
      superficieCantina: formData.hasCantina ? formData.superficieCantina : undefined,
      numeroPostiAuto: formData.hasPostoAuto ? formData.numeroPostiAuto : undefined,
    });
  };

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
          <div className="text-sm text-muted-foreground">
            Step {currentStep} di {totalSteps}
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step < currentStep
                      ? "bg-primary text-white"
                      : step === currentStep
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step < currentStep ? <Check className="h-5 w-5" /> : step}
                </div>
                {step < 6 && (
                  <div
                    className={`h-1 w-12 md:w-20 transition-all ${
                      step < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <><MapPin className="h-6 w-6 text-primary" /> Localizzazione</>}
              {currentStep === 2 && <><HomeIcon className="h-6 w-6 text-primary" /> Tipologia e Caratteristiche</>}
              {currentStep === 3 && <><Trees className="h-6 w-6 text-primary" /> Pertinenze e Spazi Esterni</>}
              {currentStep === 4 && <><Waves className="h-6 w-6 text-primary" /> Vista e Posizione</>}
              {currentStep === 5 && <><Sparkles className="h-6 w-6 text-primary" /> Servizi e Comfort</>}
              {currentStep === 6 && <><Check className="h-6 w-6 text-primary" /> Riepilogo</>}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Dove si trova il tuo immobile?"}
              {currentStep === 2 && "Descrivi le caratteristiche principali"}
              {currentStep === 3 && "Indica gli spazi esterni e le pertinenze"}
              {currentStep === 4 && "Dettagli su vista mare e posizione"}
              {currentStep === 5 && "Servizi e finiture presenti"}
              {currentStep === 6 && "Verifica i dati inseriti prima di procedere"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Localizzazione */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="comune">Comune *</Label>
                  <Select value={formData.comune} onValueChange={(value) => updateFormData("comune", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona il comune" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMUNI_ELBA.map((comune) => (
                        <SelectItem key={comune} value={comune}>
                          {comune}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.comune && (
                  <div>
                    <Label htmlFor="localita">Località</Label>
                    <Select value={formData.localita} onValueChange={(value) => updateFormData("localita", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona la località" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCALITA_PER_COMUNE[formData.comune]?.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="indirizzo">Indirizzo (opzionale)</Label>
                  <Input
                    id="indirizzo"
                    value={formData.indirizzo}
                    onChange={(e) => updateFormData("indirizzo", e.target.value)}
                    placeholder="Via, numero civico"
                  />
                </div>

                <div>
                  <Label htmlFor="distanzaMare">Distanza dal mare (metri)</Label>
                  <Input
                    id="distanzaMare"
                    type="number"
                    value={formData.distanzaMare || ""}
                    onChange={(e) => updateFormData("distanzaMare", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="es. 500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Distanza stradale effettiva (non in linea d'aria)
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Tipologia */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tipologia">Tipologia *</Label>
                  <Select value={formData.tipologia} onValueChange={(value) => updateFormData("tipologia", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona la tipologia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appartamento">Appartamento</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="villetta">Villetta a schiera</SelectItem>
                      <SelectItem value="rustico">Rustico/Casale</SelectItem>
                      <SelectItem value="attico">Attico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="superficieAbitabile">Superficie abitabile (mq) *</Label>
                    <Input
                      id="superficieAbitabile"
                      type="number"
                      value={formData.superficieAbitabile || ""}
                      onChange={(e) => updateFormData("superficieAbitabile", e.target.value ? Number(e.target.value) : 0)}
                      placeholder="es. 80"
                    />
                  </div>

                  <div>
                    <Label htmlFor="numeroCamere">Numero camere</Label>
                    <Input
                      id="numeroCamere"
                      type="number"
                      value={formData.numeroCamere || ""}
                      onChange={(e) => updateFormData("numeroCamere", e.target.value ? Number(e.target.value) : 0)}
                      placeholder="es. 2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numeroBagni">Numero bagni</Label>
                    <Input
                      id="numeroBagni"
                      type="number"
                      value={formData.numeroBagni || ""}
                      onChange={(e) => updateFormData("numeroBagni", e.target.value ? Number(e.target.value) : 0)}
                      placeholder="es. 1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="piano">Piano</Label>
                    <Select value={formData.piano} onValueChange={(value) => updateFormData("piano", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="terra">Piano terra</SelectItem>
                        <SelectItem value="rialzato">Piano rialzato</SelectItem>
                        <SelectItem value="primo">Primo piano</SelectItem>
                        <SelectItem value="secondo">Secondo piano</SelectItem>
                        <SelectItem value="terzo">Terzo piano o superiore</SelectItem>
                        <SelectItem value="attico">Attico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="statoManutenzione">Stato di manutenzione *</Label>
                  <Select value={formData.statoManutenzione} onValueChange={(value) => updateFormData("statoManutenzione", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona lo stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nuovo">Nuovo/Mai abitato</SelectItem>
                      <SelectItem value="ottimo">Ottimo stato</SelectItem>
                      <SelectItem value="ristrutturato">Ristrutturato</SelectItem>
                      <SelectItem value="buono">Buono</SelectItem>
                      <SelectItem value="abitabile">Abitabile</SelectItem>
                      <SelectItem value="ristrutturare">Da ristrutturare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="classeEnergetica">Classe energetica</Label>
                  <Select value={formData.classeEnergetica} onValueChange={(value) => updateFormData("classeEnergetica", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona la classe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                      <SelectItem value="A1">A1</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                      <SelectItem value="E">E</SelectItem>
                      <SelectItem value="F">F</SelectItem>
                      <SelectItem value="G">G</SelectItem>
                      <SelectItem value="non_disponibile">Non disponibile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Pertinenze */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Giardino */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasGiardino"
                      checked={formData.hasGiardino}
                      onCheckedChange={(checked) => updateFormData("hasGiardino", checked)}
                    />
                    <Label htmlFor="hasGiardino" className="font-semibold">Giardino</Label>
                  </div>
                  {formData.hasGiardino && (
                    <div className="grid md:grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label htmlFor="superficieGiardino">Superficie (mq)</Label>
                        <Input
                          id="superficieGiardino"
                          type="number"
                          value={formData.superficieGiardino || ""}
                          onChange={(e) => updateFormData("superficieGiardino", e.target.value ? Number(e.target.value) : 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipoGiardino">Tipo</Label>
                        <Select value={formData.tipoGiardino} onValueChange={(value) => updateFormData("tipoGiardino", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="villa">Giardino villa (privato)</SelectItem>
                            <SelectItem value="appartamento">Giardino appartamento</SelectItem>
                            <SelectItem value="condominiale">Condominiale</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasPiscina"
                          checked={formData.hasPiscina}
                          onCheckedChange={(checked) => updateFormData("hasPiscina", checked)}
                        />
                        <Label htmlFor="hasPiscina">Con piscina</Label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Terrazzo */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasTerrazzo"
                      checked={formData.hasTerrazzo}
                      onCheckedChange={(checked) => updateFormData("hasTerrazzo", checked)}
                    />
                    <Label htmlFor="hasTerrazzo" className="font-semibold">Terrazzo/Balcone</Label>
                  </div>
                  {formData.hasTerrazzo && (
                    <div className="grid md:grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label htmlFor="superficieTerrazzo">Superficie (mq)</Label>
                        <Input
                          id="superficieTerrazzo"
                          type="number"
                          value={formData.superficieTerrazzo || ""}
                          onChange={(e) => updateFormData("superficieTerrazzo", e.target.value ? Number(e.target.value) : 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipoTerrazzo">Tipo</Label>
                        <Select value={formData.tipoTerrazzo} onValueChange={(value) => updateFormData("tipoTerrazzo", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scoperto">Scoperto</SelectItem>
                            <SelectItem value="coperto">Coperto</SelectItem>
                            <SelectItem value="veranda">Veranda chiusa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cortile */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasCortile"
                      checked={formData.hasCortile}
                      onCheckedChange={(checked) => updateFormData("hasCortile", checked)}
                    />
                    <Label htmlFor="hasCortile" className="font-semibold">Cortile</Label>
                  </div>
                  {formData.hasCortile && (
                    <div className="ml-6">
                      <Label htmlFor="superficieCortile">Superficie (mq)</Label>
                      <Input
                        id="superficieCortile"
                        type="number"
                        value={formData.superficieCortile || ""}
                        onChange={(e) => updateFormData("superficieCortile", e.target.value ? Number(e.target.value) : 0)}
                      />
                    </div>
                  )}
                </div>

                {/* Cantina */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasCantina"
                      checked={formData.hasCantina}
                      onCheckedChange={(checked) => updateFormData("hasCantina", checked)}
                    />
                    <Label htmlFor="hasCantina" className="font-semibold">Cantina/Magazzino</Label>
                  </div>
                  {formData.hasCantina && (
                    <div className="ml-6">
                      <Label htmlFor="superficieCantina">Superficie (mq)</Label>
                      <Input
                        id="superficieCantina"
                        type="number"
                        value={formData.superficieCantina || ""}
                        onChange={(e) => updateFormData("superficieCantina", e.target.value ? Number(e.target.value) : 0)}
                      />
                    </div>
                  )}
                </div>

                {/* Posto Auto */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasPostoAuto"
                      checked={formData.hasPostoAuto}
                      onCheckedChange={(checked) => updateFormData("hasPostoAuto", checked)}
                    />
                    <Label htmlFor="hasPostoAuto" className="font-semibold">Posto Auto/Box</Label>
                  </div>
                  {formData.hasPostoAuto && (
                    <div className="grid md:grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label htmlFor="tipoPostoAuto">Tipo</Label>
                        <Select value={formData.tipoPostoAuto} onValueChange={(value) => updateFormData("tipoPostoAuto", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="coperto">Box coperto</SelectItem>
                            <SelectItem value="scoperto">Posto auto scoperto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="numeroPostiAuto">Numero posti</Label>
                        <Input
                          id="numeroPostiAuto"
                          type="number"
                          value={formData.numeroPostiAuto || ""}
                          onChange={(e) => updateFormData("numeroPostiAuto", e.target.value ? Number(e.target.value) : 1)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Vista e Posizione */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vistaMare">Vista mare</Label>
                  <Select value={formData.vistaMare} onValueChange={(value) => updateFormData("vistaMare", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nessuna">Nessuna vista mare</SelectItem>
                      <SelectItem value="parziale">Vista mare parziale</SelectItem>
                      <SelectItem value="alcune stanze">Vista mare da alcune stanze</SelectItem>
                      <SelectItem value="frontale">Vista mare frontale</SelectItem>
                      <SelectItem value="panoramica">Vista mare panoramica 180°</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Esposizione</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {["Nord", "Sud", "Est", "Ovest"].map((exp) => (
                      <div key={exp} className="flex items-center space-x-2">
                        <Checkbox
                          id={`esp-${exp}`}
                          checked={formData.esposizione.includes(exp)}
                          onCheckedChange={() => toggleArrayItem("esposizione", exp)}
                        />
                        <Label htmlFor={`esp-${exp}`}>{exp}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="tipoPosizione">Tipo di posizione</Label>
                  <Select value={formData.tipoPosizione} onValueChange={(value) => updateFormData("tipoPosizione", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tranquilla">Zona tranquilla</SelectItem>
                      <SelectItem value="centrale">Centro paese</SelectItem>
                      <SelectItem value="panoramica">Posizione panoramica</SelectItem>
                      <SelectItem value="rumorosa">Zona rumorosa/trafficata</SelectItem>
                      <SelectItem value="isolata">Isolata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="accessoMare">Accesso al mare</Label>
                  <Select value={formData.accessoMare} onValueChange={(value) => updateFormData("accessoMare", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nessuno">Nessun accesso diretto</SelectItem>
                      <SelectItem value="diretto">Accesso diretto al mare</SelectItem>
                      <SelectItem value="spiaggia_privata">Spiaggia privata</SelectItem>
                      <SelectItem value="vicino">Vicino a spiaggia pubblica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 5: Servizi */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Servizi presenti</Label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { value: "aria_condizionata", label: "Aria condizionata" },
                      { value: "riscaldamento", label: "Riscaldamento autonomo" },
                      { value: "fotovoltaico", label: "Pannelli fotovoltaici" },
                      { value: "pompa_calore", label: "Pompa di calore" },
                      { value: "allarme", label: "Sistema di allarme" },
                      { value: "domotica", label: "Domotica" },
                      { value: "videocitofono", label: "Videocitofono" },
                      { value: "internet", label: "Fibra ottica/Internet veloce" }
                    ].map((servizio) => (
                      <div key={servizio.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`serv-${servizio.value}`}
                          checked={formData.servizi.includes(servizio.value)}
                          onCheckedChange={() => toggleArrayItem("servizi", servizio.value)}
                        />
                        <Label htmlFor={`serv-${servizio.value}`}>{servizio.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">Finiture</Label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { value: "parquet", label: "Parquet" },
                      { value: "marmo", label: "Pavimenti in marmo" },
                      { value: "gres", label: "Gres porcellanato" },
                      { value: "cucina_arredata", label: "Cucina arredata" },
                      { value: "armadi_muro", label: "Armadi a muro" },
                      { value: "infissi_nuovi", label: "Infissi nuovi" },
                      { value: "doppi_vetri", label: "Doppi vetri" },
                      { value: "bagno_ristrutturato", label: "Bagno ristrutturato" }
                    ].map((finitura) => (
                      <div key={finitura.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`fin-${finitura.value}`}
                          checked={formData.finiture.includes(finitura.value)}
                          onCheckedChange={() => toggleArrayItem("finiture", finitura.value)}
                        />
                        <Label htmlFor={`fin-${finitura.value}`}>{finitura.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Riepilogo */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">LOCALIZZAZIONE</h4>
                    <p className="text-foreground">
                      {formData.comune}{formData.localita ? ` - ${formData.localita}` : ""}
                      {formData.distanzaMare ? ` (${formData.distanzaMare}m dal mare)` : ""}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">IMMOBILE</h4>
                    <p className="text-foreground">
                      {formData.tipologia} • {formData.superficieAbitabile} mq
                      {formData.numeroCamere > 0 && ` • ${formData.numeroCamere} camere`}
                      {formData.numeroBagni > 0 && ` • ${formData.numeroBagni} bagni`}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Stato: {formData.statoManutenzione}
                      {formData.classeEnergetica && ` • Classe energetica: ${formData.classeEnergetica}`}
                    </p>
                  </div>

                  {(formData.hasGiardino || formData.hasTerrazzo || formData.hasPostoAuto) && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">PERTINENZE</h4>
                      <ul className="text-sm text-foreground space-y-1">
                        {formData.hasGiardino && (
                          <li>• Giardino {formData.superficieGiardino}mq{formData.hasPiscina && " con piscina"}</li>
                        )}
                        {formData.hasTerrazzo && (
                          <li>• Terrazzo {formData.superficieTerrazzo}mq</li>
                        )}
                        {formData.hasPostoAuto && (
                          <li>• {formData.tipoPostoAuto === "coperto" ? "Box coperto" : "Posto auto"}</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {formData.vistaMare && formData.vistaMare !== "nessuna" && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">VISTA E POSIZIONE</h4>
                      <p className="text-foreground">{formData.vistaMare}</p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    ℹ️ Verifica che tutti i dati siano corretti. La stima sarà calcolata in base alle informazioni fornite.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            size="lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Indietro
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={nextStep} size="lg">
              Avanti
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              size="lg" 
              disabled={calcolaMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {calcolaMutation.isPending ? "Calcolo in corso..." : "Calcola Stima"}
              <Check className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
