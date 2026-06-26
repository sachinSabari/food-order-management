import { useCart } from "../context/CartContext";
import type { CartLine } from "../types";

export function CartItemRow({ line }: { line: CartLine }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center gap-3 border-b border-dashed border-steel/30 py-3">
      <img
        src={line.menuItem.image}
        alt={line.menuItem.name}
        className="h-12 w-12 rounded-lg object-cover"
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{line.menuItem.name}</p>
        <p className="font-mono text-xs text-steel">
          ${line.menuItem.price.toFixed(2)} each
        </p>
      </div>

      <div className="flex items-center gap-1.5" role="group" aria-label={`Quantity for ${line.menuItem.name}`}>
        <button
          type="button"
          onClick={() => updateQuantity(line.menuItem.id, line.quantity - 1)}
          className="focus-ring h-7 w-7 rounded-full border border-steel/30 text-sm leading-none hover:border-chili hover:text-chili"
          aria-label="Decrease quantity"
        >
          –
        </button>
        <span className="w-5 text-center font-mono text-sm">{line.quantity}</span>
        <button
          type="button"
          onClick={() => updateQuantity(line.menuItem.id, line.quantity + 1)}
          className="focus-ring h-7 w-7 rounded-full border border-steel/30 text-sm leading-none hover:border-chili hover:text-chili"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <span className="w-16 text-right font-mono text-sm font-semibold">
        ${(line.menuItem.price * line.quantity).toFixed(2)}
      </span>

      <button
        type="button"
        onClick={() => removeItem(line.menuItem.id)}
        aria-label={`Remove ${line.menuItem.name} from cart`}
        className="focus-ring ml-1 text-steel hover:text-chili"
      >
        ✕
      </button>
    </div>
  );
}
