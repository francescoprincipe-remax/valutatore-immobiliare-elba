import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const adminUser: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user: adminUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

function createUserContext(): { ctx: TrpcContext } {
  const regularUser: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user: regularUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Lead tRPC Procedures", () => {
  it("should create a lead successfully", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: {} as any,
    });

    const result = await caller.lead.create({
      nome: "Test",
      cognome: "Lead",
      email: "test.lead@example.com",
      telefono: "+39 333 1234567",
      gdprConsent: true,
      comune: "Portoferraio",
      tipologia: "Appartamento",
      superficie: 80,
      valoreTotale: 300000,
    });

    expect(result).toEqual({ success: true });
  });

  it("should reject lead creation without GDPR consent", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: {} as any,
    });

    await expect(
      caller.lead.create({
        nome: "Test",
        cognome: "NoGDPR",
        email: "nogdpr@example.com",
        telefono: "+39 333 0000000",
        gdprConsent: false,
      })
    ).rejects.toThrow("Consenso GDPR richiesto");
  });

  it("should allow admin to get all leads", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const leads = await caller.lead.getAll();

    expect(Array.isArray(leads)).toBe(true);
    // Dovrebbe includere almeno il lead creato nel test precedente
    expect(leads.length).toBeGreaterThanOrEqual(1);
  });

  it("should prevent non-admin from accessing leads", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.lead.getAll()).rejects.toThrow(
      "Solo gli amministratori possono accedere ai lead"
    );
  });

  it("should allow admin to get lead statistics", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.lead.getStats();

    expect(stats).toHaveProperty("totalLeads");
    expect(stats).toHaveProperty("leadsByComune");
    expect(stats).toHaveProperty("leadsByMonth");
    expect(typeof stats.totalLeads).toBe("number");
    expect(Array.isArray(stats.leadsByComune)).toBe(true);
    expect(Array.isArray(stats.leadsByMonth)).toBe(true);
  });

  it("should filter leads by comune", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const leads = await caller.lead.getAll({
      comune: "Portoferraio",
    });

    expect(Array.isArray(leads)).toBe(true);
    // Tutti i lead dovrebbero essere di Portoferraio
    leads.forEach((lead) => {
      if (lead.comune) {
        expect(lead.comune).toBe("Portoferraio");
      }
    });
  });
});
