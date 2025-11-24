import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { calcolaValutazione, type DatiImmobile } from "./valutazione-engine";
import { saveValutazione, getValutazioneById, getUserValutazioni, getDatiMercatoByLocation, saveLead, getAllLeads, getLeadStats } from "./db";
import { TRPCError } from "@trpc/server";
import { sendLeadNotification } from "./_core/email";

export const appRouter = router({
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
    /**
     * Calcola la valutazione di un immobile
     */
    calcola: publicProcedure
      .input(
        z.object({
          // Localizzazione
          comune: z.string(),
          localita: z.string().optional(),
          indirizzo: z.string().optional(),
          distanzaMare: z.number().optional(),

          // Tipologia e caratteristiche
          tipologia: z.string(),
          categoriaCatastale: z.string().optional(),
          superficieAbitabile: z.number(),
          numeroCamere: z.number().optional(),
          numeroBagni: z.number().optional(),
          piano: z.string().optional(),
          statoManutenzione: z.string(),
          annoCostruzione: z.number().optional(),
          classeEnergetica: z.string().optional(),

          // Pertinenze
          hasGiardino: z.boolean().optional(),
          superficieGiardino: z.number().optional(),
          tipoGiardino: z.string().optional(),
          statoGiardino: z.string().optional(),
          hasPiscina: z.boolean().optional(),

          hasTerrazzo: z.boolean().optional(),
          superficieTerrazzo: z.number().optional(),
          tipoTerrazzo: z.string().optional(),

          hasCortile: z.boolean().optional(),
          superficieCortile: z.number().optional(),

          hasCantina: z.boolean().optional(),
          superficieCantina: z.number().optional(),

          hasPostoAuto: z.boolean().optional(),
          tipoPostoAuto: z.string().optional(),
          numeroPostiAuto: z.number().optional(),

          // Vista e posizione
          vistaMare: z.string().optional(),
          esposizione: z.array(z.string()).optional(),
          tipoPosizione: z.string().optional(),
          accessoMare: z.string().optional(),

          // Servizi e comfort
          servizi: z.array(z.string()).optional(),
          finiture: z.array(z.string()).optional(),

          // Opzionale: salva valutazione se utente autenticato
          salva: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Calcola la valutazione
        const risultato = calcolaValutazione(input as DatiImmobile);

        // Salva SEMPRE la valutazione nel database (anche per utenti anonimi)
        // Questo è necessario per generare il PDF successivamente
        let valutazioneId: number | undefined;
        // Se utente autenticato, associa la valutazione all'utente
        // Altrimenti salva come valutazione anonima (userId = null)
        if (true) { // Salva sempre
          valutazioneId = await saveValutazione({
            userId: ctx.user?.id || null,
            comune: input.comune,
            localita: input.localita || null,
            indirizzo: input.indirizzo || null,
            distanzaMare: input.distanzaMare || null,
            tipologia: input.tipologia,
            categoriaCatastale: input.categoriaCatastale || null,
            superficieAbitabile: input.superficieAbitabile,
            numeroCamere: input.numeroCamere || null,
            numeroBagni: input.numeroBagni || null,
            piano: input.piano || null,
            statoManutenzione: input.statoManutenzione,
            annoCostruzione: input.annoCostruzione || null,
            classeEnergetica: input.classeEnergetica || null,
            hasGiardino: input.hasGiardino || false,
            superficieGiardino: input.superficieGiardino || null,
            tipoGiardino: input.tipoGiardino || null,
            hasTerrazzo: input.hasTerrazzo || false,
            superficieTerrazzo: input.superficieTerrazzo || null,
            tipoTerrazzo: input.tipoTerrazzo || null,
            hasCortile: input.hasCortile || false,
            superficieCortile: input.superficieCortile || null,
            hasCantina: input.hasCantina || false,
            superficieCantina: input.superficieCantina || null,
            hasPostoAuto: input.hasPostoAuto || false,
            tipoPostoAuto: input.tipoPostoAuto || null,
            numeroPostiAuto: input.numeroPostiAuto || null,
            vistaMare: input.vistaMare || null,
            esposizione: input.esposizione?.join(',') || null,
            tipoPosizione: input.tipoPosizione || null,
            accessoMare: input.accessoMare || null,
            servizi: input.servizi || null,
            finiture: input.finiture || null,
            valoreBase: risultato.valoreBase,
            valorePertinenze: risultato.valorePertinenze,
            valoreValorizzazioni: risultato.valoreValorizzazioni,
            valoreSvalutazioni: risultato.valoreSvalutazioni,
            valoreTotale: risultato.valoreTotale,
            valoreMin: risultato.valoreMin,
            valoreMax: risultato.valoreMax,
            prezzoMqZona: risultato.prezzoMqZona,
            immobiliSimiliZona: risultato.immobiliSimiliZona,
            livelloCompetitivita: risultato.livelloCompetitivita,
            breakdownCalcolo: {
              pertinenze: risultato.dettaglioPertinenze,
              valorizzazioni: risultato.dettaglioValorizzazioni,
              svalutazioni: risultato.dettaglioSvalutazioni,
            },
            consigli: [
              ...risultato.consigli.puntiForza,
              ...risultato.consigli.miglioramenti,
              ...risultato.consigli.strategiaVendita,
            ],
          });
        } else {
          // Anche se non salva, crea una valutazione temporanea per generare il PDF
          valutazioneId = await saveValutazione({
            userId: null,
            comune: input.comune,
            localita: input.localita || null,
            indirizzo: input.indirizzo || null,
            distanzaMare: input.distanzaMare || null,
            tipologia: input.tipologia,
            categoriaCatastale: input.categoriaCatastale || null,
            superficieAbitabile: input.superficieAbitabile,
            numeroCamere: input.numeroCamere || null,
            numeroBagni: input.numeroBagni || null,
            piano: input.piano || null,
            statoManutenzione: input.statoManutenzione,
            annoCostruzione: input.annoCostruzione || null,
            classeEnergetica: input.classeEnergetica || null,
            hasGiardino: input.hasGiardino || false,
            superficieGiardino: input.superficieGiardino || null,
            tipoGiardino: input.tipoGiardino || null,
            hasTerrazzo: input.hasTerrazzo || false,
            superficieTerrazzo: input.superficieTerrazzo || null,
            tipoTerrazzo: input.tipoTerrazzo || null,
            hasCortile: input.hasCortile || false,
            superficieCortile: input.superficieCortile || null,
            hasCantina: input.hasCantina || false,
            superficieCantina: input.superficieCantina || null,
            hasPostoAuto: input.hasPostoAuto || false,
            tipoPostoAuto: input.tipoPostoAuto || null,
            numeroPostiAuto: input.numeroPostiAuto || null,
            vistaMare: input.vistaMare || null,
            esposizione: input.esposizione?.join(',') || null,
            tipoPosizione: input.tipoPosizione || null,
            accessoMare: input.accessoMare || null,
            servizi: input.servizi || null,
            finiture: input.finiture || null,
            valoreBase: risultato.valoreBase,
            valorePertinenze: risultato.valorePertinenze,
            valoreValorizzazioni: risultato.valoreValorizzazioni,
            valoreSvalutazioni: risultato.valoreSvalutazioni,
            valoreTotale: risultato.valoreTotale,
            valoreMin: risultato.valoreMin,
            valoreMax: risultato.valoreMax,
            prezzoMqZona: risultato.prezzoMqZona,
            immobiliSimiliZona: risultato.immobiliSimiliZona,
            livelloCompetitivita: risultato.livelloCompetitivita,
            breakdownCalcolo: {
              pertinenze: risultato.dettaglioPertinenze,
              valorizzazioni: risultato.dettaglioValorizzazioni,
              svalutazioni: risultato.dettaglioSvalutazioni,
            },
            consigli: [
              ...risultato.consigli.puntiForza,
              ...risultato.consigli.miglioramenti,
              ...risultato.consigli.strategiaVendita,
            ],
          });
        }

        return {
          ...risultato,
          valutazioneId,
        };
      }),

    /**
     * Ottiene una valutazione salvata per ID
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getValutazioneById(input.id);
      }),

    /**
     * Ottiene tutte le valutazioni dell'utente
     */
    getMie: protectedProcedure.query(async ({ ctx }) => {
      return await getUserValutazioni(ctx.user.id);
    }),

    /**
     * Genera PDF da template PowerPoint
     */
    generatePDF: publicProcedure
      .input(
        z.object({
          valutazioneId: z.string(),
          leadData: z.object({
            nome: z.string(),
            cognome: z.string(),
            email: z.string().email(),
            telefono: z.string(),
            gdprConsent: z.boolean(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        const { valutazioneId, leadData } = input;
        
        // Recupera la valutazione dal database
        const valutazione = await getValutazioneById(parseInt(valutazioneId));
        if (!valutazione) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Valutazione non trovata',
          });
        }

        // Salva il lead
        await saveLead({
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

        // Invia notifica email
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

        // Genera PDF usando lo script Python
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        const path = await import('path');
        const fs = await import('fs');

        // Prepara i dati per il template
        const templateData = {
          COMUNE: valutazione.comune,
          LOCALITA: valutazione.localita || '',
          VALORE_TOTALE: valutazione.valoreTotale.toLocaleString('it-IT'),
          VALORE_MINIMO: valutazione.valoreMin.toLocaleString('it-IT'),
          VALORE_MASSIMO: valutazione.valoreMax.toLocaleString('it-IT'),
          PREZZO_MQ: Math.round(valutazione.valoreTotale / valutazione.superficieAbitabile).toLocaleString('it-IT'),
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
          // Punti di forza dinamici
          ICONA_1: '🌊',
          PUNTO_FORZA_1_TITOLO: 'Vista Mare di Pregio',
          PUNTO_FORZA_1_TESTO: 'Panorama esclusivo sul mare che rappresenta uno dei principali driver di valore.',
          ICONA_2: '🏖️',
          PUNTO_FORZA_2_TITOLO: `Vicinanza al Mare (${valutazione.distanzaMare || 500}m)`,
          PUNTO_FORZA_2_TESTO: 'Posizione strategica a pochi metri dalla costa, ideale per il lifestyle balneare.',
          ICONA_3: '✨',
          PUNTO_FORZA_3_TITOLO: `Stato Immobile: ${valutazione.statoManutenzione}`,
          PUNTO_FORZA_3_TESTO: 'Immobile ben conservato che non richiede interventi strutturali immediati.',
          ICONA_4: '🌳',
          PUNTO_FORZA_4_TITOLO: 'Giardino Privato',
          PUNTO_FORZA_4_TESTO: 'Spazio esterno esclusivo che aumenta l\'attrattività per famiglie.',
        };

        // Salva i dati in un file temporaneo JSON
        const tempDir = path.join(process.cwd(), 'server', 'temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        const tempJsonPath = path.join(tempDir, `valutazione-${valutazioneId}.json`);
        const tempPdfPath = path.join(tempDir, `stima-${valutazioneId}.pdf`);
        
        fs.writeFileSync(tempJsonPath, JSON.stringify(templateData, null, 2));

        // Esegui lo script Python
        const scriptPath = path.join(process.cwd(), 'server', 'pptx-generator.py');
        console.log('[PDF] Esecuzione script Python:', scriptPath);
        console.log('[PDF] Input JSON:', tempJsonPath);
        console.log('[PDF] Output PDF:', tempPdfPath);
        
        try {
          const { stdout, stderr } = await execAsync(`python3 ${scriptPath} ${tempJsonPath} ${tempPdfPath}`);
          console.log('[PDF] Script Python completato');
          if (stdout) console.log('[PDF] stdout:', stdout);
          if (stderr) console.error('[PDF] stderr:', stderr);
        } catch (error: any) {
          console.error('[PDF] Errore esecuzione script Python:', error);
          console.error('[PDF] stderr:', error.stderr);
          console.error('[PDF] stdout:', error.stdout);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Errore durante la generazione del PDF: ${error.message}`,
          });
        }

        // Verifica che il PDF sia stato generato
        if (!fs.existsSync(tempPdfPath)) {
          console.error('[PDF] File PDF non trovato:', tempPdfPath);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'PDF non generato - file non trovato',
          });
        }

        // Leggi il PDF generato e convertilo in base64
        console.log('[PDF] Lettura file PDF...');
        const pdfBuffer = fs.readFileSync(tempPdfPath);
        const pdfBase64 = pdfBuffer.toString('base64');
        console.log('[PDF] PDF convertito in base64, dimensione:', pdfBuffer.length, 'bytes');

        // Pulisci i file temporanei
        try {
          fs.unlinkSync(tempJsonPath);
          fs.unlinkSync(tempPdfPath);
          console.log('[PDF] File temporanei eliminati');
        } catch (cleanupError) {
          console.warn('[PDF] Errore pulizia file temporanei:', cleanupError);
        }

        return {
          success: true,
          pdfBase64,
          filename: `stima-immobiliare-elba.pdf`,
        };
      }),
  }),

  mercato: router({
    /**
     * Ottiene i dati di mercato per una località
     */
    getDatiZona: publicProcedure
      .input(
        z.object({
          comune: z.string(),
          localita: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getDatiMercatoByLocation(input.comune, input.localita);
      }),
  }),

  lead: router({
    /**
     * Salva un nuovo lead (pubblico - dal form PDF)
     */
    create: publicProcedure
      .input(
        z.object({
          nome: z.string(),
          cognome: z.string(),
          email: z.string().email(),
          telefono: z.string(),
          gdprConsent: z.boolean(),
          comune: z.string().optional(),
          tipologia: z.string().optional(),
          superficie: z.number().optional(),
          valoreTotale: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        if (!input.gdprConsent) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Consenso GDPR richiesto',
          });
        }

        await saveLead({
          nome: input.nome,
          cognome: input.cognome,
          email: input.email,
          telefono: input.telefono,
          gdprConsent: input.gdprConsent,
          comune: input.comune || null,
          tipologia: input.tipologia || null,
          superficie: input.superficie || null,
          valoreTotale: input.valoreTotale || null,
        });

        // Invia notifica email al proprietario
        await sendLeadNotification({
          nome: input.nome,
          cognome: input.cognome,
          email: input.email,
          telefono: input.telefono,
          comune: input.comune,
          tipologia: input.tipologia,
          superficie: input.superficie,
          valoreTotale: input.valoreTotale,
        });

        return { success: true };
      }),

    /**
     * Ottiene tutti i lead con filtri (solo admin)
     */
    getAll: protectedProcedure
      .input(
        z.object({
          dateFrom: z.date().optional(),
          dateTo: z.date().optional(),
          comune: z.string().optional(),
          prezzoMin: z.number().optional(),
          prezzoMax: z.number().optional(),
        }).optional()
      )
      .query(async ({ ctx, input }) => {
        // Verifica che l'utente sia admin
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Solo gli amministratori possono accedere ai lead',
          });
        }

        return await getAllLeads(input);
      }),

    /**
     * Ottiene statistiche lead (solo admin)
     */
    getStats: protectedProcedure.query(async ({ ctx }) => {
      // Verifica che l'utente sia admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Solo gli amministratori possono accedere alle statistiche',
        });
      }

      return await getLeadStats();
    }),
  }),
});

export type AppRouter = typeof appRouter;
