import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCart } from "../CartContext";
import type { MenuItem } from "../../types";

const pizza: MenuItem = {
  id: "item_pizza",
  name: "Test Pizza",
  description: "desc",
  price: 10,
  image: "https://example.com/pizza.jpg",
  category: "Pizza",
  available: true,
};

function CartHarness() {
  const { lines, addItem, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  return (
    <div>
      <p data-testid="count">{itemCount}</p>
      <p data-testid="subtotal">{subtotal.toFixed(2)}</p>
      <button onClick={() => addItem(pizza, 2)}>add</button>
      <button onClick={() => updateQuantity(pizza.id, 5)}>set-five</button>
      <button onClick={() => removeItem(pizza.id)}>remove</button>
      <p data-testid="lines">{lines.length}</p>
    </div>
  );
}

describe("CartContext", () => {
  it("adds items, accumulates quantity, and computes subtotal", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    await user.click(screen.getByText("add"));
    expect(screen.getByTestId("count")).toHaveTextContent("2");
    expect(screen.getByTestId("subtotal")).toHaveTextContent("20.00");

    // Adding the same item again accumulates rather than duplicating a line.
    await user.click(screen.getByText("add"));
    expect(screen.getByTestId("lines")).toHaveTextContent("1");
    expect(screen.getByTestId("count")).toHaveTextContent("4");
  });

  it("updates quantity directly and removes the line when set to zero", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    await user.click(screen.getByText("add"));
    await user.click(screen.getByText("set-five"));
    expect(screen.getByTestId("count")).toHaveTextContent("5");

    await user.click(screen.getByText("remove"));
    expect(screen.getByTestId("lines")).toHaveTextContent("0");
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});
