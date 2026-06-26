import { useEffect, useState } from "react";
import { menuApi } from "../api/menu";
import { ApiClientError } from "../api/client";
import type { MenuItem } from "../types";
import { MenuItemCard } from "./MenuItemCard";

export function MenuList() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    menuApi
      .list()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(
          err instanceof ApiClientError ? err.message : "Could not load the menu."
        );
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <p className="py-12 text-center text-steel" role="status">
        Loading menu…
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-chili/30 bg-chili/5 p-6 text-center">
        <p className="font-semibold text-chili">Couldn't load the menu</p>
        <p className="mt-1 text-sm text-steel">{errorMessage}</p>
      </div>
    );
  }

  const categories = Array.from(new Set(items.map((item) => item.category)));

  return (
    <div className="space-y-10">
      {categories.map((category) => (
        <section key={category} aria-labelledby={`category-${category}`}>
          <h2
            id={`category-${category}`}
            className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-steel"
          >
            {category}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items
              .filter((item) => item.category === category)
              .map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
