import { Router } from "express";
import { menuService } from "../services/menuService.js";
import { ApiError } from "../utils/ApiError.js";

export const menuRouter = Router();

// GET /api/menu - list all available menu items
menuRouter.get("/", (_req, res) => {
  res.json({ data: menuService.listAvailable() });
});

// GET /api/menu/:id - fetch a single menu item
menuRouter.get("/:id", (req, res, next) => {
  const item = menuService.getById(req.params.id);
  if (!item) {
    next(ApiError.notFound(`Menu item not found: ${req.params.id}`));
    return;
  }
  res.json({ data: item });
});
