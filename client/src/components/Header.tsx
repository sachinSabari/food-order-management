import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export function Header() {
  const { itemCount, openDrawer } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-char text-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 focus-ring rounded">
          <span className="font-mono text-lg font-bold tracking-tight">
            ORDER<span className="text-chili">UP</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={openDrawer}
          aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          className="focus-ring relative flex items-center gap-2 rounded-full border border-steel/40 px-4 py-2 text-sm font-medium transition hover:border-chili hover:text-chili"
        >
          <CartIcon />
          Cart
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-chili px-1 font-mono text-xs font-bold text-paper">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
