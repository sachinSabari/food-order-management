import { useState } from "react";
import { useCart } from "../context/CartContext";
import type { MenuItem } from "../types";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { addItem, openDrawer } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addItem(item, quantity);
    setQuantity(1);
    setJustAdded(true);
    openDrawer();
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-steel/20 bg-white/60 shadow-sm transition hover:shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden bg-steel/10">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug text-ink">{item.name}</h3>
          <span className="whitespace-nowrap font-mono text-sm font-semibold text-chili">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="flex-1 text-sm text-steel">{item.description}</p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div
            className="flex items-center gap-2 rounded-full border border-steel/30"
            role="group"
            aria-label={`Quantity for ${item.name}`}
          >
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="focus-ring h-8 w-8 rounded-full text-lg leading-none text-ink hover:text-chili"
              aria-label="Decrease quantity"
            >
              –
            </button>
            <span className="w-4 text-center font-mono text-sm">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              className="focus-ring h-8 w-8 rounded-full text-lg leading-none text-ink hover:text-chili"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="focus-ring rounded-full bg-char px-4 py-2 text-sm font-semibold text-paper transition hover:bg-chili"
          >
            {justAdded ? "Added ✓" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
