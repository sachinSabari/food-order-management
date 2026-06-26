import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { orderApi } from "../api/orders";
import { ApiClientError } from "../api/client";
import type { DeliveryDetails } from "../types";

type FieldErrors = Partial<Record<keyof DeliveryDetails, string>>;

function validate(delivery: DeliveryDetails): FieldErrors {
  const errors: FieldErrors = {};
  if (delivery.name.trim().length < 2) {
    errors.name = "Enter your full name.";
  }
  if (delivery.address.trim().length < 5) {
    errors.address = "Enter a delivery address.";
  }
  if (!/^\+?[0-9\s\-()]{7,20}$/.test(delivery.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }
  return errors;
}

export function CheckoutPage() {
  const { lines, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState<DeliveryDetails>({
    name: "",
    address: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-steel">Your cart is empty, so there's nothing to check out yet.</p>
        <Link
          to="/"
          className="focus-ring mt-4 inline-block rounded-full bg-char px-5 py-2.5 text-sm font-semibold text-paper hover:bg-chili"
        >
          Back to menu
        </Link>
      </main>
    );
  }

  function updateField<K extends keyof DeliveryDetails>(key: K, value: string) {
    setDelivery((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const fieldErrors = validate(delivery);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const order = await orderApi.place({
        items: lines.map((line) => ({
          menuItemId: line.menuItem.id,
          quantity: line.quantity,
        })),
        delivery,
      });
      clearCart();
      navigate(`/order/${order.id}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setSubmitError(err.message);
        if (err.details) {
          const serverFieldErrors: FieldErrors = {};
          for (const detail of err.details) {
            const field = detail.path.replace("delivery.", "") as keyof DeliveryDetails;
            serverFieldErrors[field] = detail.message;
          }
          setErrors((prev) => ({ ...prev, ...serverFieldErrors }));
        }
      } else {
        setSubmitError("Something went wrong placing your order. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Delivery details</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr]">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Field
            label="Full name"
            value={delivery.name}
            onChange={(v) => updateField("name", v)}
            error={errors.name}
            autoComplete="name"
          />
          <Field
            label="Delivery address"
            value={delivery.address}
            onChange={(v) => updateField("address", v)}
            error={errors.address}
            autoComplete="street-address"
          />
          <Field
            label="Phone number"
            value={delivery.phone}
            onChange={(v) => updateField("phone", v)}
            error={errors.phone}
            type="tel"
            autoComplete="tel"
          />

          {submitError && (
            <p role="alert" className="text-sm font-medium text-chili">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring w-full rounded-full bg-chili py-3 text-sm font-semibold text-paper transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Placing order…" : `Place order — $${subtotal.toFixed(2)}`}
          </button>
        </form>

        <aside className="rounded-2xl border border-steel/20 bg-white/60 p-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-steel">
            Order summary
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {lines.map((line) => (
              <li key={line.menuItem.id} className="flex justify-between">
                <span>
                  {line.quantity}× {line.menuItem.name}
                </span>
                <span className="font-mono">
                  ${(line.menuItem.price * line.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-dashed border-steel/30 pt-3 font-mono text-sm font-bold">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  const inputId = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`focus-ring w-full rounded-lg border bg-paper px-3 py-2.5 text-sm text-ink ${
          error ? "border-chili" : "border-steel/30"
        }`}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs font-medium text-chili">
          {error}
        </p>
      )}
    </div>
  );
}
