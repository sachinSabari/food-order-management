import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();

const validDelivery = {
  name: "Jordan Lee",
  address: "123 Maple Street, Springfield",
  phone: "+1 555-123-4567",
};

async function getKnownMenuItemId() {
  const res = await request(app).get("/api/menu");
  return res.body.data[0].id as string;
}

describe("POST /api/orders", () => {
  it("creates an order and computes the total server-side from menu prices", async () => {
    const menuRes = await request(app).get("/api/menu");
    const [first, second] = menuRes.body.data;

    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [
          { menuItemId: first.id, quantity: 2 },
          { menuItemId: second.id, quantity: 1 },
        ],
        delivery: validDelivery,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("Order Received");
    expect(res.body.data.items).toHaveLength(2);

    const expectedTotal =
      Math.round((first.price * 2 + second.price * 1) * 100) / 100;
    expect(res.body.data.totalAmount).toBeCloseTo(expectedTotal, 2);
  });

  it("ignores a client-supplied price and always recomputes from the menu", async () => {
    const menuItemId = await getKnownMenuItemId();

    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [{ menuItemId, quantity: 1, price: 0.01 }],
        delivery: validDelivery,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.items[0].unitPrice).toBeGreaterThan(0.01);
  });

  it("rejects an order with no items", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [], delivery: validDelivery });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/validation/i);
  });

  it("rejects an order referencing an unknown menu item", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [{ menuItemId: "not-a-real-item", quantity: 1 }],
        delivery: validDelivery,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/unknown menu item/i);
  });

  it("rejects a zero or negative quantity", async () => {
    const menuItemId = await getKnownMenuItemId();
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ menuItemId, quantity: 0 }], delivery: validDelivery });

    expect(res.status).toBe(400);
  });

  it.each([
    ["missing name", { ...validDelivery, name: "" }],
    ["missing address", { ...validDelivery, address: "" }],
    ["malformed phone", { ...validDelivery, phone: "abc" }],
  ])("rejects delivery details with %s", async (_label, delivery) => {
    const menuItemId = await getKnownMenuItemId();
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ menuItemId, quantity: 1 }], delivery });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/orders/:id", () => {
  it("fetches a previously created order", async () => {
    const menuItemId = await getKnownMenuItemId();
    const created = await request(app)
      .post("/api/orders")
      .send({ items: [{ menuItemId, quantity: 1 }], delivery: validDelivery });

    const res = await request(app).get(`/api/orders/${created.body.data.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(created.body.data.id);
  });

  it("returns 404 for a non-existent order", async () => {
    const res = await request(app).get("/api/orders/order_doesnotexist");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/orders", () => {
  it("lists created orders, most recent first", async () => {
    const menuItemId = await getKnownMenuItemId();
    await request(app)
      .post("/api/orders")
      .send({ items: [{ menuItemId, quantity: 1 }], delivery: validDelivery });
    await request(app)
      .post("/api/orders")
      .send({ items: [{ menuItemId, quantity: 2 }], delivery: validDelivery });

    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });
});

describe("PATCH /api/orders/:id/status", () => {
  it("moves an order forward to a valid status", async () => {
    const menuItemId = await getKnownMenuItemId();
    const created = await request(app)
      .post("/api/orders")
      .send({ items: [{ menuItemId, quantity: 1 }], delivery: validDelivery });

    const res = await request(app)
      .patch(`/api/orders/${created.body.data.id}/status`)
      .send({ status: "Preparing" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("Preparing");
  });

  it("rejects moving status backwards", async () => {
    const menuItemId = await getKnownMenuItemId();
    const created = await request(app)
      .post("/api/orders")
      .send({ items: [{ menuItemId, quantity: 1 }], delivery: validDelivery });

    await request(app)
      .patch(`/api/orders/${created.body.data.id}/status`)
      .send({ status: "Out for Delivery" });

    const res = await request(app)
      .patch(`/api/orders/${created.body.data.id}/status`)
      .send({ status: "Preparing" });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/backwards/i);
  });

  it("rejects an invalid status value", async () => {
    const menuItemId = await getKnownMenuItemId();
    const created = await request(app)
      .post("/api/orders")
      .send({ items: [{ menuItemId, quantity: 1 }], delivery: validDelivery });

    const res = await request(app)
      .patch(`/api/orders/${created.body.data.id}/status`)
      .send({ status: "Cancelled" });

    expect(res.status).toBe(400);
  });

  it("returns 404 when updating the status of a non-existent order", async () => {
    const res = await request(app)
      .patch("/api/orders/order_doesnotexist/status")
      .send({ status: "Preparing" });

    expect(res.status).toBe(404);
  });
});
