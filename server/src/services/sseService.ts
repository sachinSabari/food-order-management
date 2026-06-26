import type { Response } from "express";
import type { Order } from "../types/index.js";

/**
 * Tracks open Server-Sent-Events connections, keyed by order id, and lets
 * the order service push status updates to any client currently watching
 * that order. This is what powers the "real-time" status updates -- a
 * lighter-weight alternative to WebSockets that's a great fit here because
 * updates only ever flow server -> client (the client never needs to send
 * messages back over the same channel).
 */
class OrderEventBus {
  private subscribers = new Map<string, Set<Response>>();

  subscribe(orderId: string, res: Response): void {
    if (!this.subscribers.has(orderId)) {
      this.subscribers.set(orderId, new Set());
    }
    this.subscribers.get(orderId)!.add(res);
  }

  unsubscribe(orderId: string, res: Response): void {
    this.subscribers.get(orderId)?.delete(res);
    if (this.subscribers.get(orderId)?.size === 0) {
      this.subscribers.delete(orderId);
    }
  }

  publish(order: Order): void {
    const clients = this.subscribers.get(order.id);
    if (!clients || clients.size === 0) return;

    const payload = `data: ${JSON.stringify(order)}\n\n`;
    for (const client of clients) {
      client.write(payload);
    }
  }
}

export const orderEventBus = new OrderEventBus();
