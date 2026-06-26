import { nanoid } from "nanoid";
import { orderStore } from "../data/store.js";
import { menuService } from "./menuService.js";
import { orderEventBus } from "./sseService.js";
import { ApiError } from "../utils/ApiError.js";
import {
  ORDER_STATUS_SEQUENCE,
  type CreateOrderInput,
  type Order,
  type OrderLineItem,
  type OrderStatus,
} from "../types/index.js";

/** Milliseconds between each automatic status advance. Overridable for tests/demos. */
const STATUS_STEP_DELAY_MS = Number(
  process.env.STATUS_STEP_DELAY_MS ?? 5000
);

/**
 * Auto-progression is disabled when NODE_ENV=test so API integration tests
 * stay fast and deterministic. The progression logic itself is still fully
 * covered by dedicated unit tests using fake timers (see orderService.test.ts).
 */
const AUTO_PROGRESSION_ENABLED = process.env.NODE_ENV !== "test";

function buildLineItems(
  items: CreateOrderInput["items"]
): OrderLineItem[] {
  return items.map(({ menuItemId, quantity }) => {
    const menuItem = menuService.getById(menuItemId);
    if (!menuItem) {
      throw ApiError.badRequest(`Unknown menu item: ${menuItemId}`);
    }
    if (!menuItem.available) {
      throw ApiError.badRequest(`Menu item is currently unavailable: ${menuItem.name}`);
    }
    const lineTotal = Math.round(menuItem.price * quantity * 100) / 100;
    return {
      menuItemId,
      name: menuItem.name,
      unitPrice: menuItem.price,
      quantity,
      lineTotal,
    };
  });
}

function calculateTotal(lineItems: OrderLineItem[]): number {
  const total = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  return Math.round(total * 100) / 100;
}

function nextStatus(current: OrderStatus): OrderStatus | undefined {
  const index = ORDER_STATUS_SEQUENCE.indexOf(current);
  return ORDER_STATUS_SEQUENCE[index + 1];
}

export const orderService = {
  /** Computes a price quote without persisting anything (used by createOrder + can back a future "cart preview" endpoint). */
  buildLineItems,
  calculateTotal,

  createOrder(input: CreateOrderInput): Order {
    // Prices are always recomputed from the menu server-side -- the client
    // never gets to dictate a price, which closes off a tampering vector.
    const lineItems = buildLineItems(input.items);
    const now = new Date().toISOString();

    const order: Order = {
      id: `order_${nanoid(10)}`,
      items: lineItems,
      delivery: input.delivery,
      status: "Order Received",
      totalAmount: calculateTotal(lineItems),
      createdAt: now,
      updatedAt: now,
    };

    orderStore.insert(order);

    if (AUTO_PROGRESSION_ENABLED) {
      orderService.scheduleStatusProgression(order.id);
    }

    return order;
  },

  getOrder(id: string): Order {
    const order = orderStore.findById(id);
    if (!order) {
      throw ApiError.notFound(`Order not found: ${id}`);
    }
    return order;
  },

  listOrders(): Order[] {
    return orderStore.findAll();
  },

  /** Manually move an order to a given status (rejects moving backwards in the sequence). */
  setStatus(id: string, status: OrderStatus): Order {
    const order = orderService.getOrder(id);
    const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(order.status);
    const targetIndex = ORDER_STATUS_SEQUENCE.indexOf(status);

    if (targetIndex < currentIndex) {
      throw ApiError.badRequest(
        `Cannot move status backwards from "${order.status}" to "${status}"`
      );
    }

    const updated = orderStore.update(id, { status })!;
    orderEventBus.publish(updated);
    return updated;
  },

  /** Schedules the order to automatically walk through the remaining statuses, publishing each change over SSE. */
  scheduleStatusProgression(
    orderId: string,
    delayMs: number = STATUS_STEP_DELAY_MS
  ): void {
    const step = () => {
      const order = orderStore.findById(orderId);
      if (!order) return; // order may have been removed; nothing to do

      const upcoming = nextStatus(order.status);
      if (!upcoming) return; // already at the final status

      const updated = orderStore.update(orderId, { status: upcoming })!;
      orderEventBus.publish(updated);

      if (nextStatus(upcoming)) {
        setTimeout(step, delayMs);
      }
    };

    setTimeout(step, delayMs);
  },
};
