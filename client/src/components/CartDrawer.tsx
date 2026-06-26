import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { CartItemRow } from "./CartItemRow";

export function CartDrawer() {
  const { lines, subtotal, isDrawerOpen, closeDrawer } = useCart();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  function handleCheckout() {
    closeDrawer();
    navigate("/checkout");
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeDrawer}
        className="absolute inset-0 bg-char/50"
      />

      <aside className="relative flex h-full w-full max-w-md flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-steel/20 px-5 py-4">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-ink">
            Your Cart
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="focus-ring text-steel hover:text-chili"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {lines.length === 0 ? (
            <p className="py-12 text-center text-sm text-steel">
              Your cart is empty. Add something tasty from the menu.
            </p>
          ) : (
            lines.map((line) => <CartItemRow key={line.menuItem.id} line={line} />)
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-dashed border-steel/30 px-5 py-4">
            <div className="flex items-center justify-between font-mono text-sm">
              <span className="text-steel">Subtotal</span>
              <span className="font-semibold text-ink">${subtotal.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="focus-ring mt-4 w-full rounded-full bg-chili py-3 text-sm font-semibold text-paper transition hover:bg-ink"
            >
              Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
