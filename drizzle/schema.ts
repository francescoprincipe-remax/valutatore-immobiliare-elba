import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabella per salvare le valutazioni immobiliari
 */
export const valutazioni = mysqlTable("valutazioni", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  
  // Localizzazione
  comune: varchar("comune", { length: 100 }).notNull(),
  localita: varchar("localita", { length: 200 }),
  indirizzo: text("indirizzo"),
  distanzaMare: int("distanzaMare"), // in metri
  
  // Tipologia e caratteristiche
  tipologia: varchar("tipologia", { length: 50 }).notNull(),
  categoriaCatastale: varchar("categoriaCatastale", { length: 10 }),
  superficieAbitabile: int("superficieAbitabile").notNull(),
  numeroCamere: int("numeroCamere"),
  numeroBagni: int("numeroBagni"),
  piano: varchar("piano", { length: 50 }),
  statoManutenzione: varchar("statoManutenzione", { length: 50 }),
  annoCostruzione: int("annoCostruzione"),
  classeEnergetica: varchar("classeEnergetica", { length: 10 }),
  
  // Pertinenze
  hasGiardino: boolean("hasGiardino").default(false),
  superficieGiardino: int("superficieGiardino"),
  tipoGiardino: varchar("tipoGiardino", { length: 50 }),
  
  hasTerrazzo: boolean("hasTerrazzo").default(false),
  superficieTerrazzo: int("superficieTerrazzo"),
  tipoTerrazzo: varchar("tipoTerrazzo", { length: 50 }),
  
  hasCortile: boolean("hasCortile").default(false),
  superficieCortile: int("superficieCortile"),
  
  hasCantina: boolean("hasCantina").default(false),
  superficieCantina: int("superficieCantina"),
  
  hasPostoAuto: boolean("hasPostoAuto").default(false),
  tipoPostoAuto: varchar("tipoPostoAuto", { length: 50 }),
  numeroPostiAuto: int("numeroPostiAuto"),
  
  // Vista e posizione
  vistaMare: varchar("vistaMare", { length: 100 }),
  esposizione: varchar("esposizione", { length: 50 }),
  tipoPosizione: varchar("tipoPosizione", { length: 100 }),
  accessoMare: varchar("accessoMare", { length: 100 }),
  
  // Servizi e comfort
  servizi: json("servizi").$type<string[]>(),
  finiture: json("finiture").$type<string[]>(),
  
  // Risultati valutazione
  valoreBase: int("valoreBase").notNull(),
  valorePertinenze: int("valorePertinenze").notNull(),
  valoreValorizzazioni: int("valoreValorizzazioni").notNull(),
  valoreSvalutazioni: int("valoreSvalutazioni").notNull(),
  valoreTotale: int("valoreTotale").notNull(),
  valoreMin: int("valoreMin").notNull(),
  valoreMax: int("valoreMax").notNull(),
  prezzoMqZona: int("prezzoMqZona").notNull(),
  
  // Analisi competitività
  immobiliSimiliZona: int("immobiliSimiliZona"),
  livelloCompetitivita: varchar("livelloCompetitivita", { length: 50 }),
  
  // Metadata
  breakdownCalcolo: json("breakdownCalcolo").$type<any>(),
  consigli: json("consigli").$type<string[]>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Valutazione = typeof valutazioni.$inferSelect;
export type InsertValutazione = typeof valutazioni.$inferInsert;

/**
 * Tabella per dati di mercato (prezzi per zona)
 */
export const datiMercato = mysqlTable("datiMercato", {
  id: int("id").autoincrement().primaryKey(),
  comune: varchar("comune", { length: 100 }).notNull(),
  localita: varchar("localita", { length: 200 }),
  prezzoMedioMq: int("prezzoMedioMq").notNull(),
  prezzoMinMq: int("prezzoMinMq"),
  prezzoMaxMq: int("prezzoMaxMq"),
  trendAnnuale: varchar("trendAnnuale", { length: 20 }),
  numeroAnnunci: int("numeroAnnunci"),
  caratteristiche: text("caratteristiche"),
  ultimoAggiornamento: timestamp("ultimoAggiornamento").defaultNow().notNull(),
});

export type DatoMercato = typeof datiMercato.$inferSelect;
export type InsertDatoMercato = typeof datiMercato.$inferInsert;

/**
 * Tabella per i lead generati dal form PDF
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  valutazioneId: int("valutazioneId").references(() => valutazioni.id),
  
  // Dati contatto (obbligatori)
  nome: varchar("nome", { length: 100 }).notNull(),
  cognome: varchar("cognome", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  telefono: varchar("telefono", { length: 50 }).notNull(),
  
  // GDPR
  gdprConsent: boolean("gdprConsent").notNull().default(false),
  gdprConsentDate: timestamp("gdprConsentDate").defaultNow(),
  
  // Dati immobile (per riferimento)
  comune: varchar("comune", { length: 100 }),
  tipologia: varchar("tipologia", { length: 50 }),
  superficie: int("superficie"),
  valoreTotale: int("valoreTotale"),
  
  // Metadata
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  source: varchar("source", { length: 100 }).default("valutatore_web"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
