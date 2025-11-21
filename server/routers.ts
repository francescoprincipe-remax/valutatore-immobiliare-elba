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

        // Se richiesto e utente autenticato, salva nel database
        if (input.salva && ctx.user) {
          await saveValutazione({
            userId: ctx.user.id,
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

        return risultato;
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
