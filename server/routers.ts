import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { calcolaValutazione, type DatiImmobile } from "./valutazione-engine";
import { insertLead, getAllLeads } from "./db";
import { sendLeadNotification } from "./email";
import { TRPCError } from "@trpc/server";

const leadSchema = z.object({
  nome: z.string().min(1),
  cognome: z.string().min(1),
  email: z.string().email(),
  telefono: z.string().min(1),
  gdprConsent: z.boolean(),
});

const immobileSchema = z.object({
  comune: z.string(),
  localita: z.string().optional(),
  tipologia: z.string(),
  superficieAbitabile: z.number(),
  piano: z.string().optional(),
  statoManutenzione: z.string(),
  vistaMare: z.string().optional(),
  distanzaMare: z.number().optional(),
  hasGiardino: z.boolean().optional(),
  superficieGiardino: z.number().optional(),
  hasPiscina: z.boolean().optional(),
  hasTerrazzo: z.boolean().optional(),
  superficieTerrazzo: z.number().optional(),
  hasPostoAuto: z.boolean().optional(),
  tipoPostoAuto: z.string().optional(),
});

function generaPuntiDiForzaPDF(valutazione: any) {
  const punti: Array<{ icona: string; titolo: string; testo: string }> = [];
  if (valutazione.vistaMare && valutazione.vistaMare !== 'No') {
    punti.push({
      icona: '🌊',
      titolo: 'Vista Mare di Pregio',
      testo: 'Panorama esclusivo sul mare da più stanze, uno dei principali driver di valore nel mercato elbano e fonte di benessere quotidiano.'
    });
  }
  if (valutazione.distanzaMare && valutazione.distanzaMare < 300) {
    punti.push({
      icona: '🏖️',
      titolo: `Vicinanza al Mare (${valutazione.distanzaMare}m)`,
      testo: 'Posizione strategica a pochi metri dalla costa, ideale per non usare la macchina per andare a mare e non impazzire per il parcheggio.'
    });
  }
  if (valutazione.statoManutenzione === 'Ottimo stato' || valutazione.statoManutenzione === 'Nuovo/Ristrutturato') {
    punti.push({
      icona: '✨',
      titolo: `Stato: ${valutazione.statoManutenzione}`,
      testo: 'Immobile in condizioni eccellenti, perfettamente abitabile da subito senza necessità di interventi strutturali.'
    });
  }
  if (valutazione.hasPostoAuto) {
    const tipo = valutazione.tipoPostoAuto || 'Posto Auto';
    punti.push({
      icona: '🚗',
      titolo: tipo,
      testo: `${tipo} che protegge il veicolo dal sole e dalla salsedine, un vantaggio fondamentale all'Elba dove trovare parcheggio in estate è una sfida.`
    });
  }
  while (punti.length < 4) {
    punti.push({
      icona: '🏡',
      titolo: 'Posizione Strategica',
      testo: 'Immobile situato in una delle zone più ricercate dell\'Isola d\'Elba, con facile accesso ai servizi e alle spiagge.'
    });
  }
  return punti.slice(0, 4);
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  valutazione: router({
    calcola: publicProcedure
      .input(immobileSchema)
      .mutation(async ({ input }) => {
        const datiImmobile: DatiImmobile = input as any;
        const risultato = calcolaValutazione(datiImmobile);
        return { ...risultato, ...input };
      }),

    generatePDF: publicProcedure
      .input(z.object({ valutazione: z.any(), leadData: leadSchema }))
      .mutation(async ({ input }) => {
        const { valutazione, leadData } = input;
        await insertLead({
          nome: leadData.nome,
          cognome: leadData.cognome,
          email: leadData.email,
          telefono: leadData.telefono,
          gdprConsent: leadData.gdprConsent,
          comune: valutazione.comune,
          tipologia: valutazione.tipologia,
          superficie: valutazione.superficieAbitabile,
          valoreTotale: valutazione.valoreTotale,
        });
        await sendLeadNotification({
          nome: leadData.nome,
          cognome: leadData.cognome,
          email: leadData.email,
          telefono: leadData.telefono,
          comune: valutazione.comune,
          tipologia: valutazione.tipologia,
          superficie: valutazione.superficieAbitabile,
          valoreTotale: valutazione.valoreTotale,
        });
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        const path = await import('path');
        const fs = await import('fs');
        const puntiDiForza = generaPuntiDiForzaPDF(valutazione);
        const templateData = {
          COMUNE: valutazione.comune,
          LOCALITA: valutazione.localita || '',
          VALORE_TOTALE: valutazione.valoreTotale.toLocaleString('it-IT'),
          VALORE_MINIMO: valutazione.valoreMin.toLocaleString('it-IT'),
          VALORE_MASSIMO: valutazione.valoreMax.toLocaleString('it-IT'),
          PREZZO_MQ: Math.round(valutazione.valoreBase / valutazione.superficieAbitabile).toLocaleString('it-IT'),
          COMPETITIVITA: valutazione.livelloCompetitivita,
          PREZZO_CONSIGLIATO: Math.round(valutazione.valoreTotale * 0.92).toLocaleString('it-IT'),
          TIPOLOGIA: valutazione.tipologia,
          PIANO: valutazione.piano || '',
          STATO: valutazione.statoManutenzione,
          VISTA_MARE: valutazione.vistaMare || 'No',
          DISTANZA_MARE: valutazione.distanzaMare ? `${valutazione.distanzaMare} m` : '',
          SUPERFICIE: `${valutazione.superficieAbitabile} mq`,
          VALORE_BASE: valutazione.valoreBase.toLocaleString('it-IT'),
          VALORE_PERTINENZE: valutazione.valorePertinenze.toLocaleString('it-IT'),
          VALORE_VALORIZZAZIONI: valutazione.valoreValorizzazioni.toLocaleString('it-IT'),
          ICONA_1: puntiDiForza[0].icona,
          PUNTO_FORZA_1_TITOLO: puntiDiForza[0].titolo,
          PUNTO_FORZA_1_TESTO: puntiDiForza[0].testo,
          ICONA_2: puntiDiForza[1].icona,
          PUNTO_FORZA_2_TITOLO: puntiDiForza[1].titolo,
          PUNTO_FORZA_2_TESTO: puntiDiForza[1].testo,
          ICONA_3: puntiDiForza[2].icona,
          PUNTO_FORZA_3_TITOLO: puntiDiForza[2].titolo,
          PUNTO_FORZA_3_TESTO: puntiDiForza[2].testo,
          ICONA_4: puntiDiForza[3].icona,
          PUNTO_FORZA_4_TITOLO: puntiDiForza[3].titolo,
          PUNTO_FORZA_4_TESTO: puntiDiForza[3].testo,
        };
        const valutazioneId = Date.now();
        const tempDir = path.join(process.cwd(), 'server', 'temp');
        const tempJsonPath = path.join(tempDir, `valutazione-${valutazioneId}.json`);
        const tempPdfPath = path.join(tempDir, `stima-${valutazioneId}.pdf`);
        fs.writeFileSync(tempJsonPath, JSON.stringify(templateData, null, 2));
        const scriptPath = path.join(process.cwd(), 'server', 'pptx-generator.py');
        console.log('[PDF] Generazione PDF iniziata');
        console.log('[PDF] Script:', scriptPath);
        console.log('[PDF] JSON:', tempJsonPath);
        console.log('[PDF] Output:', tempPdfPath);
        console.log('[PDF] Template data:', JSON.stringify(templateData, null, 2));
        try {
          // Verifica che lo script esista
          if (!fs.existsSync(scriptPath)) {
            throw new Error(`Script Python non trovato: ${scriptPath}`);
          }
          // Verifica che il template esista
          const templatePath = path.join(process.cwd(), 'server', 'templates', 'template-stima.pptx');
          if (!fs.existsSync(templatePath)) {
            throw new Error(`Template PPTX non trovato: ${templatePath}`);
          }
          const env = { ...process.env };
          delete env.PYTHONPATH;
          delete env.VIRTUAL_ENV;
          delete env.UV_PYTHON;
          const command = `/usr/bin/python3.11 -I ${scriptPath} ${tempJsonPath} ${tempPdfPath}`;
          console.log('[PDF] Comando:', command);
          const result = await execAsync(command, { env, maxBuffer: 10 * 1024 * 1024 });
          console.log('[PDF] Stdout:', result.stdout);
          console.log('[PDF] Stderr:', result.stderr);
          console.log('[PDF] Generazione completata con successo');
        } catch (error: any) {
          console.error('[PDF] Errore completo:', error);
          console.error('[PDF] Stack:', error.stack);
          console.error('[PDF] Stdout:', error.stdout);
          console.error('[PDF] Stderr:', error.stderr);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Errore durante la generazione del PDF: ${error.message}` });
        }
        if (!fs.existsSync(tempPdfPath)) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'PDF non generato - file non trovato' });
        }
        const pdfBuffer = fs.readFileSync(tempPdfPath);
        const pdfBase64 = pdfBuffer.toString('base64');
        try {
          fs.unlinkSync(tempJsonPath);
          fs.unlinkSync(tempPdfPath);
        } catch (e) {}
        return { success: true, pdfBase64 };
      }),
  }),

  leads: router({
    list: publicProcedure.query(async () => {
      return await getAllLeads();
    }),
  }),
});

export type AppRouter = typeof appRouter;
