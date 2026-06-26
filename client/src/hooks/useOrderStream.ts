import { useEffect, useState } from "react";
import { orderApi } from "../api/orders";
import type { Order } from "../types";

export type StreamConnectionState = "connecting" | "open" | "closed";

interface UseOrderStreamResult {
  order: Order | undefined;
  connectionState: StreamConnectionState;
}

/**
 * Subscribes to the backend's Server-Sent-Events stream for one order and
 * keeps local state in sync as the status advances. Falls back gracefully
 * (just stays on the last known state) if the connection drops -- it does
 * not need to recover, since the browser's EventSource auto-reconnects.
 */
export function useOrderStream(orderId: string | undefined): UseOrderStreamResult {
  const [order, setOrder] = useState<Order>();
  const [connectionState, setConnectionState] = useState<StreamConnectionState>("connecting");

  useEffect(() => {
    if (!orderId) return;

    setConnectionState("connecting");
    const source = new EventSource(orderApi.streamUrl(orderId));

    source.onopen = () => setConnectionState("open");

    source.onmessage = (event) => {
      try {
        const updated = JSON.parse(event.data) as Order;
        setOrder(updated);
      } catch {
        // ignore malformed events rather than crashing the page
      }
    };

    source.onerror = () => {
      setConnectionState("closed");
    };

    return () => {
      source.close();
    };
  }, [orderId]);

  return { order, connectionState };
}
