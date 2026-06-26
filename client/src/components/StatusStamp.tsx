import type { OrderStatus } from "../types";

const STAMP_STYLES: Record<OrderStatus, string> = {
  "Order Received": "border-steel text-steel",
  Preparing: "border-chili text-chili",
  "Out for Delivery": "border-chili text-chili",
  Delivered: "border-herb text-herb",
};

export function StatusStamp({ status }: { status: OrderStatus }) {
  return (
    <div
      className={`inline-flex -rotate-3 select-none items-center rounded-md border-[3px] px-4 py-1.5 font-mono text-sm font-bold uppercase tracking-wider ${STAMP_STYLES[status]}`}
      role="status"
      aria-live="polite"
    >
      {status}
    </div>
  );
}
