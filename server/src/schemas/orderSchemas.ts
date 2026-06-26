import { z } from "zod";
import { ORDER_STATUS_SEQUENCE } from "../types/index.js";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1, "menuItemId is required"),
        quantity: z
          .number()
          .int("quantity must be a whole number")
          .positive("quantity must be greater than 0")
          .max(50, "quantity per item cannot exceed 50"),
      })
    )
    .min(1, "Order must contain at least one item"),
  delivery: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    address: z
      .string()
      .trim()
      .min(5, "Address must be at least 5 characters")
      .max(250, "Address is too long"),
    phone: z
      .string()
      .trim()
      .regex(
        /^\+?[0-9\s\-()]{7,20}$/,
        "Phone number must be 7-20 digits, optionally with +, spaces, hyphens, or parentheses"
      ),
  }),
});

export type CreateOrderBody = z.infer<typeof createOrderSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(
    ORDER_STATUS_SEQUENCE as [string, ...string[]],
    {
      errorMap: () => ({
        message: `status must be one of: ${ORDER_STATUS_SEQUENCE.join(", ")}`,
      }),
    }
  ),
});

export type UpdateStatusBody = z.infer<typeof updateStatusSchema>;
