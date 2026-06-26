import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCart } from "../../context/CartContext";
import { MenuItemCard } from "../MenuItemCard";
import type { MenuItem } from "../../types";

const burger: MenuItem = {
  id: "item_burger",
  name: "Test Burger",
  description: "A tasty test burger.",
  price: 8.5,
  image: "https://example.com/burger.jpg",
  category: "Burgers",
  available: true,
};

function CartCount() {
  const { itemCount } = useCart();
  return <p data-testid="global-count">{itemCount}</p>;
}

function renderCard() {
  return render(
    <CartProvider>
      <CartCount />
      <MenuItemCard item={burger} />
    </CartProvider>
  );
}

describe("MenuItemCard", () => {
  it("renders the item name, description, and price", () => {
    renderCard();
    expect(screen.getByText("Test Burger")).toBeInTheDocument();
    expect(screen.getByText("A tasty test burger.")).toBeInTheDocument();
    expect(screen.getByText("$8.50")).toBeInTheDocument();
  });

  it("lets the user adjust quantity before adding to cart", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByLabelText("Increase quantity"));
    await user.click(screen.getByLabelText("Increase quantity"));
    // quantity display should now read 3
    expect(screen.getByText("3")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(screen.getByTestId("global-count")).toHaveTextContent("3");
  });

  it("does not let quantity drop below 1", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByLabelText("Decrease quantity"));
    await user.click(screen.getByLabelText("Decrease quantity"));
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
