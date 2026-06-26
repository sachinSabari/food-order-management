import { Router } from "express";
import { orderService } from "../services/orderService.js";
import { orderEventBus } from "../services/sseService.js";
import { validateBody } from "../middleware/validateBody.js";
import { createOrderSchema, updateStatusSchema } from "../schemas/orderSchemas.js";

export const orderRouter = Router();

// POST /api/orders - place a new order
orderRouter.post("/", validateBody(createOrderSchema), (req, res) => {
  const order = orderService.createOrder(req.body);
  res.status(201).json({ data: order });
});

// GET /api/orders - list all orders (most recent first)
orderRouter.get("/", (_req, res) => {
  res.json({ data: orderService.listOrders() });
});

// GET /api/orders/:id - fetch a single order
orderRouter.get("/:id", (req, res, next) => {
  try {
    const order = orderService.getOrder(req.params.id);
    res.json({ data: order });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status - manually move an order's status forward
orderRouter.patch(
  "/:id/status",
  validateBody(updateStatusSchema),
  (req, res, next) => {
    try {
      const updated = orderService.setStatus(req.params.id, req.body.status as never);
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/orders/:id/stream - Server-Sent-Events stream of live status updates
orderRouter.get("/:id/stream", (req, res, next) => {
  const orderId = req.params.id;

  let order;
  try {
    order = orderService.getOrder(orderId);
  } catch (err) {
    next(err);
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Send the current state immediately so the client doesn't wait for the
  // next transition to render something.
  res.write(`data: ${JSON.stringify(order)}\n\n`);

  orderEventBus.subscribe(orderId, res);

  req.on("close", () => {
    orderEventBus.unsubscribe(orderId, res);
  });
});
