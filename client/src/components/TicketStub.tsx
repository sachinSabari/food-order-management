import { ORDER_STATUS_SEQUENCE } from "../types";
import type { Order } from "../types";
import { StatusStamp } from "./StatusStamp";

export function TicketStub({ order }: { order: Order }) {
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(order.status);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-t-lg bg-paper shadow-lg">
        <div className="perf-edge" aria-hidden="true" />
      </div>

      <div className="bg-paper px-6 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-steel">
              Order
            </p>
            <p className="font-mono text-lg font-bold text-ink">
              #{order.id.replace("order_", "").toUpperCase()}
            </p>
          </div>
          <StatusStamp status={order.status} />
        </div>

        <ol className="mt-6 space-y-2 border-t border-dashed border-steel/30 pt-4" aria-label="Order progress">
          {ORDER_STATUS_SEQUENCE.map((step, index) => {
            const done = index <= currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <li
                key={step}
                className={`flex items-center gap-2 font-mono text-sm ${
                  done ? "text-ink" : "text-steel/60"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                    done
                      ? "border-herb bg-herb text-paper"
                      : "border-steel/40 text-steel/40"
                  }`}
                >
                  {done ? "✓" : index + 1}
                </span>
                {step}
                {isCurrent && order.status !== "Delivered" && (
                  <span className="ml-1 inline-block animate-pulse text-chili">●</span>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-6 border-t border-dashed border-steel/30 pt-4">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-steel">
            Items
          </p>
          <ul className="space-y-1 text-sm">
            {order.items.map((item) => (
              <li key={item.menuItemId} className="flex justify-between">
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span className="font-mono">${item.lineTotal.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-steel/20 pt-2 font-mono text-sm font-bold">
            <span>Total</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-6 border-t border-dashed border-steel/30 pt-4 text-sm text-steel">
          <p className="font-mono text-xs uppercase tracking-widest text-steel">
            Deliver to
          </p>
          <p className="mt-1 text-ink">{order.delivery.name}</p>
          <p>{order.delivery.address}</p>
          <p>{order.delivery.phone}</p>
        </div>
      </div>

      <div className="rounded-b-lg bg-paper shadow-lg">
        <div className="perf-edge rotate-180" aria-hidden="true" />
      </div>
    </div>
  );
}
