import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("GET /api/menu", () => {
  it("returns the list of available menu items", async () => {
    const res = await request(app).get("/api/menu");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const item = res.body.data[0];
    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("name");
    expect(item).toHaveProperty("description");
    expect(item).toHaveProperty("price");
    expect(item).toHaveProperty("image");
  });

  it("only returns items marked as available", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.body.data.every((item: { available: boolean }) => item.available)).toBe(true);
  });
});

describe("GET /api/menu/:id", () => {
  it("returns a single menu item by id", async () => {
    const list = await request(app).get("/api/menu");
    const knownId = list.body.data[0].id;

    const res = await request(app).get(`/api/menu/${knownId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(knownId);
  });

  it("returns 404 for an unknown menu item id", async () => {
    const res = await request(app).get("/api/menu/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error.message).toMatch(/not found/i);
  });
});
