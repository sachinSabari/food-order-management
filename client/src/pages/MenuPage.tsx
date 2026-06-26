import { MenuList } from "../components/MenuList";

export function MenuPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-chili">
          Today's menu
        </p>
        <h1 className="mt-1 text-3xl font-bold text-ink sm:text-4xl">
          What are you hungry for?
        </h1>
      </div>
      <MenuList />
    </main>
  );
}
