export type OrderStatus =
  | "Order Received"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered";

/** The fixed sequence a simulated order progresses through. */
export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "Order Received",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // USD, stored as a number with 2 decimal precision
  image: string; // URL
  category: "Pizza" | "Burgers" | "Sides" | "Drinks" | "Desserts";
  available: boolean;
}

export interface DeliveryDetails {
  name: string;
  address: string;
  phone: string;
}

export interface OrderLineItem {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  items: OrderLineItem[];
  delivery: DeliveryDetails;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

/** Shape of the payload clients send to create an order. */
export interface CreateOrderInput {
  items: Array<{ menuItemId: string; quantity: number }>;
  delivery: DeliveryDetails;
}
