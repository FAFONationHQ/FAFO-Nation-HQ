import type { PrismaClient } from "@prisma/client";
import type { PersistedCart, PersistedTransaction } from "./foundation/commerce/persistence.ts";

/** FAFO PostgreSQL adapter; Commerce domain/application code imports only persistence ports. */
export class PrismaCommerceAdapter {
  constructor(private readonly client: PrismaClient) {}

  async getCart(id: string): Promise<PersistedCart | null> {
    const cart = await this.client.commerceCart.findUnique({ where: { id } });
    return cart ? { id: cart.id, version: cart.version, snapshot: cart.snapshot as Record<string, unknown> } : null;
  }

  async saveTransaction(record: PersistedTransaction): Promise<void> {
    const snapshot = JSON.parse(JSON.stringify(record.snapshot));
    await this.client.commerceOrder.upsert({
      where: { id: record.id },
      create: { id: record.id, checkoutId: "pending", cartVersion: 0, orderState: "SUBMITTED", paymentState: "PENDING", fulfillmentState: "NOT_REQUESTED", productionState: "NOT_REQUIRED", shipmentState: "NOT_REQUIRED", subtotalMinor: 0, currency: "XXX", snapshot, createdAt: new Date(), updatedAt: new Date() },
      update: { snapshot, updatedAt: new Date() },
    });
  }
}
