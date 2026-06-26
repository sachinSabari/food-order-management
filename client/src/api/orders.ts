import { apiRequest, API_BASE_URL } from "./client";
import type { DeliveryDetails, Order } from "../types";

export interface PlaceOrderInput {
  items: Array<{ menuItemId: string; quantity: number }>;
  delivery: DeliveryDetails;
}

export const orderApi = {
  place(input: PlaceOrderInput): Promise<Order> {
    return apiRequest<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  get(orderId: string): Promise<Order> {
    return apiRequest<Order>(`/api/orders/${orderId}`);
  },

  /** Builds the SSE stream URL for live order-status updates. */
  streamUrl(orderId: string): string {
    return `${API_BASE_URL}/api/orders/${orderId}/stream`;
  },
};
