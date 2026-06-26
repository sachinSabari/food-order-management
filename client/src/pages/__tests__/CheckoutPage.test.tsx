import { useEffect, type ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { CartProvider, useCart } from "../../context/CartContext";
import { CheckoutPage } from "../CheckoutPage";
import { orderApi } from "../../api/orders";
import type { MenuItem, Order } from "../../types";

vi.mock("../../api/orders", () => ({
  orderApi: {
    place: vi.fn(),
  },
}));

const item: MenuItem = {
  id: "item_test",
  name: "Test Item",
  description: "desc",
  price: 5,
  image: "https://example.com/x.jpg",
  category: "Sides",
  available: true,
};

function Seed({ children }: { children: ReactNode }) {
  const { addItem } = useCart();
  useEffect(() => {
    addItem(item, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}

function renderCheckout({ seeded = true } = {}) {
  const body = (
    <MemoryRouter initialEntries={["/checkout"]}>
      <Routes>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/:orderId" element={<p>Order confirmed</p>} />
      </Routes>
    </MemoryRouter>
  );

  return render(
    <CartProvider>{seeded ? <Seed>{body}</Seed> : body}</CartProvider>
  );
}

describe("CheckoutPage", () => {
  beforeEach(() => {
    vi.mocked(orderApi.place).mockReset();
  });

  it("shows a message instead of a form when the cart is empty", () => {
    renderCheckout({ seeded: false });
    expect(screen.getByText(/cart is empty/i)).toBeInTheDocument();
  });

  it("blocks submission and shows field errors when required fields are missing", async () => {
    const user = userEvent.setup();
    renderCheckout();

    await user.click(screen.getByRole("button", { name: /place order/i }));

    expect(await screen.findByText(/enter your full name/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a delivery address/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a valid phone number/i)).toBeInTheDocument();
    expect(orderApi.place).not.toHaveBeenCalled();
  });

  it("submits valid details, places the order, and navigates to the confirmation page", async () => {
    const user = userEvent.setup();
    const fakeOrder: Order = {
      id: "order_abc123",
      items: [
        { menuItemId: item.id, name: item.name, unitPrice: item.price, quantity: 1, lineTotal: 5 },
      ],
      delivery: { name: "Jordan Lee", address: "123 Maple St", phone: "5551234567" },
      status: "Order Received",
      totalAmount: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    vi.mocked(orderApi.place).mockResolvedValueOnce(fakeOrder);

    renderCheckout();

    await user.type(screen.getByLabelText(/full name/i), "Jordan Lee");
    await user.type(screen.getByLabelText(/delivery address/i), "123 Maple St");
    await user.type(screen.getByLabelText(/phone number/i), "5551234567");

    await user.click(screen.getByRole("button", { name: /place order/i }));

    await waitFor(() => {
      expect(orderApi.place).toHaveBeenCalledWith({
        items: [{ menuItemId: item.id, quantity: 1 }],
        delivery: { name: "Jordan Lee", address: "123 Maple St", phone: "5551234567" },
      });
    });

    expect(await screen.findByText(/order confirmed/i)).toBeInTheDocument();
  });
});
