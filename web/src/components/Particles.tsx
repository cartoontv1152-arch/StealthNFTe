export function Particles() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-paper),var(--color-paper-soft))]" />
      <div className="grid-pattern absolute inset-0 opacity-80" />
      <div className="absolute inset-x-0 top-0 h-48 border-b border-[var(--color-rule)] bg-[var(--color-surface)]" />
    </div>
  );
}
