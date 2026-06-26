import type { MenuItem, Order } from "../types/index.js";
import { seedMenuItems } from "./menuData.js";

/**
 * In-memory persistence layer.
 *
 * The brief explicitly allows in-memory storage. Reads/writes are kept behind
 * this module's functions (rather than scattered across services/routes) so
 * that swapping in a real database later (Postgres, Mongo, etc.) only means
 * rewriting this one file -- nothing else in the app needs to change.
 */

const menuItems: Map<string, MenuItem> = new Map(
  seedMenuItems.map((item) => [item.id, item])
);

const orders: Map<string, Order> = new Map();

export const menuStore = {
  findAll(): MenuItem[] {
    return Array.from(menuItems.values());
  },
  findById(id: string): MenuItem | undefined {
    return menuItems.get(id);
  },
};

export const orderStore = {
  insert(order: Order): Order {
    orders.set(order.id, order);
    return order;
  },
  findById(id: string): Order | undefined {
    return orders.get(id);
  },
  findAll(): Order[] {
    return Array.from(orders.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  },
  update(id: string, updates: Partial<Order>): Order | undefined {
    const existing = orders.get(id);
    if (!existing) return undefined;
    const updated: Order = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    orders.set(id, updated);
    return updated;
  },
  /** Test-only helper to reset state between test files/cases. */
  _reset(): void {
    orders.clear();
  },
};
