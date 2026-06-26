import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TicketStub } from "../TicketStub";
import type { Order } from "../../types";

function makeOrder(status: Order["status"]): Order {
  return {
    id: "order_xyz789",
    items: [
      { menuItemId: "item_1", name: "Test Pizza", unitPrice: 10, quantity: 2, lineTotal: 20 },
    ],
    delivery: { name: "Sam Rivera", address: "9 Oak Ave", phone: "5559876543" },
    status,
    totalAmount: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("TicketStub", () => {
  it("renders the order id, items, total, and delivery details", () => {
    render(<TicketStub order={makeOrder("Order Received")} />);

    expect(screen.getByText("#XYZ789")).toBeInTheDocument();
    expect(screen.getByText(/2× Test Pizza/)).toBeInTheDocument();
    expect(screen.getAllByText("$20.00")).toHaveLength(2); // line total + order total
    expect(screen.getByText("Sam Rivera")).toBeInTheDocument();
  });

  it("marks earlier statuses as complete and leaves later ones pending", () => {
    render(<TicketStub order={makeOrder("Preparing")} />);

    const list = screen.getByRole("list", { name: "Order progress" });
    const items = Array.from(list.querySelectorAll("li"));

    // Order Received (done), Preparing (current/done), Out for Delivery (pending), Delivered (pending)
    expect(items[0]).toHaveTextContent("Order Received");
    expect(items[0].querySelector("span")).toHaveTextContent("✓");

    expect(items[2]).toHaveTextContent("Out for Delivery");
    expect(items[2].querySelector("span")).toHaveTextContent("3");
  });

  it("marks every step complete once the order is Delivered", () => {
    render(<TicketStub order={makeOrder("Delivered")} />);
    expect(screen.getAllByText("✓")).toHaveLength(4);
  });
});
