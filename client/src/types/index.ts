export type OrderStatus =
  | "Order Received"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered";

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
  price: number;
  image: string;
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

export interface CartLine {
  menuItem: MenuItem;
  quantity: number;
}

export interface ApiErrorBody {
  error: {
    message: string;
    details?: Array<{ path: string; message: string }>;
  };
}
