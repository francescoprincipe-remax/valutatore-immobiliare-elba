import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// ========== Valutazioni Immobiliari ==========

import { valutazioni, datiMercato, InsertValutazione } from "../drizzle/schema";
import { desc, and } from "drizzle-orm";

export async function saveValutazione(data: InsertValutazione) {
  const db = await getDb();
  if (!db) throw new Error("Database non disponibile");

  const result = await db.insert(valutazioni).values(data);
  return result;
}

export async function getValutazioneById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(valutazioni).where(eq(valutazioni.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserValutazioni(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(valutazioni)
    .where(eq(valutazioni.userId, userId))
    .orderBy(desc(valutazioni.createdAt));
}

export async function getDatiMercatoByLocation(comune: string, localita?: string | null) {
  const db = await getDb();
  if (!db) return null;

  // Cerca prima la località specifica se fornita
  if (localita) {
    const result = await db
      .select()
      .from(datiMercato)
      .where(and(eq(datiMercato.comune, comune), eq(datiMercato.localita, localita)))
      .limit(1);
    
    if (result.length > 0) return result[0];
  }

  // Altrimenti cerca il comune
  const result = await db
    .select()
    .from(datiMercato)
    .where(eq(datiMercato.comune, comune))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}


// ========== Lead Management ==========

import { leads, InsertLead, type Lead } from "../drizzle/schema";
import { gte, lte, sql } from "drizzle-orm";

export async function saveLead(data: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database non disponibile");

  const result = await db.insert(leads).values(data);
  return result;
}

export async function getAllLeads(filters?: {
  dateFrom?: Date;
  dateTo?: Date;
  comune?: string;
  prezzoMin?: number;
  prezzoMax?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(leads);

  const conditions = [];
  
  if (filters?.dateFrom) {
    conditions.push(gte(leads.createdAt, filters.dateFrom));
  }
  
  if (filters?.dateTo) {
    conditions.push(lte(leads.createdAt, filters.dateTo));
  }
  
  if (filters?.comune) {
    conditions.push(eq(leads.comune, filters.comune));
  }
  
  if (filters?.prezzoMin && leads.valoreTotale) {
    conditions.push(gte(leads.valoreTotale, filters.prezzoMin));
  }
  
  if (filters?.prezzoMax && leads.valoreTotale) {
    conditions.push(lte(leads.valoreTotale, filters.prezzoMax));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return query.orderBy(desc(leads.createdAt));
}

export async function getLeadStats() {
  const db = await getDb();
  if (!db) return {
    totalLeads: 0,
    leadsByComune: [],
    leadsByMonth: [],
  };

  // Total leads
  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(leads);
  const totalLeads = totalResult[0]?.count || 0;

  // Leads by comune
  const leadsByComune = await db
    .select({
      comune: leads.comune,
      count: sql<number>`count(*)`,
    })
    .from(leads)
    .groupBy(leads.comune)
    .orderBy(desc(sql`count(*)`));

  // Leads by month (last 6 months)
  const leadsByMonth = await db
    .select({
      month: sql<string>`DATE_FORMAT(createdAt, '%Y-%m')`,
      count: sql<number>`count(*)`,
    })
    .from(leads)
    .where(gte(leads.createdAt, sql`DATE_SUB(NOW(), INTERVAL 6 MONTH)`))
    .groupBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`);

  return {
    totalLeads,
    leadsByComune,
    leadsByMonth,
  };
}
