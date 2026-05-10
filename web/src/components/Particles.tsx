export function Particles() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--paper)),rgb(238_244_241))]" />
      <div className="grid-pattern absolute inset-0 opacity-80" />
      <div className="absolute inset-x-0 top-0 h-48 border-b border-[rgb(var(--line)/0.75)] bg-[linear-gradient(90deg,rgb(var(--teal)/0.12),rgb(var(--gold)/0.12),rgb(var(--coral)/0.08))]" />
    </div>
  );
}
