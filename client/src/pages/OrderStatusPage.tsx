import { Link, useParams } from "react-router-dom";
import { useOrderStream } from "../hooks/useOrderStream";
import { TicketStub } from "../components/TicketStub";

export function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { order, connectionState } = useOrderStream(orderId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 text-center text-2xl font-bold text-ink sm:text-3xl">
        Thanks — your order is in!
      </h1>
      <p className="mb-8 text-center text-sm text-steel">
        {connectionState === "open"
          ? "Tracking your order live."
          : "Connecting to live tracking…"}
      </p>

      {order ? (
        <TicketStub order={order} />
      ) : (
        <p className="text-center text-steel" role="status">
          Loading order…
        </p>
      )}

      <div className="mt-8 text-center">
        <Link to="/" className="focus-ring text-sm font-medium text-chili hover:underline">
          ← Order something else
        </Link>
      </div>
    </main>
  );
}
