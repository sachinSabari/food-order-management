import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { orderService } from "../src/services/orderService.js";
import { orderStore, menuStore } from "../src/data/store.js";

describe("orderService.scheduleStatusProgression", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("walks an order through the full status sequence over time", () => {
    const menuItem = menuStore.findAll()[0];
    const order = orderService.createOrder({
      items: [{ menuItemId: menuItem.id, quantity: 1 }],
      delivery: {
        name: "Test User",
        address: "1 Test Way",
        phone: "555-000-1111",
      },
    });
    expect(order.status).toBe("Order Received");

    // createOrder in the test environment does not auto-schedule (NODE_ENV=test),
    // so we exercise the scheduler explicitly here.
    orderService.scheduleStatusProgression(order.id, 1000);

    vi.advanceTimersByTime(1000);
    expect(orderStore.findById(order.id)?.status).toBe("Preparing");

    vi.advanceTimersByTime(1000);
    expect(orderStore.findById(order.id)?.status).toBe("Out for Delivery");

    vi.advanceTimersByTime(1000);
    expect(orderStore.findById(order.id)?.status).toBe("Delivered");

    // No further transitions exist after "Delivered".
    vi.advanceTimersByTime(5000);
    expect(orderStore.findById(order.id)?.status).toBe("Delivered");
  });
});

describe("orderService.setStatus", () => {
  it("computes totals that match quantity * menu price", () => {
    const [a, b] = menuStore.findAll();
    const order = orderService.createOrder({
      items: [
        { menuItemId: a.id, quantity: 3 },
        { menuItemId: b.id, quantity: 2 },
      ],
      delivery: { name: "Test", address: "1 Test Way", phone: "5550001111" },
    });

    const expected = Math.round((a.price * 3 + b.price * 2) * 100) / 100;
    expect(order.totalAmount).toBeCloseTo(expected, 2);
  });
});
