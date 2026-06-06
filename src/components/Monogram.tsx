import { monogramColor, monogramText } from "@/lib/site";

export function Monogram({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={`monogram ${className ?? ""}`}
      style={{ background: monogramColor(name) }}
      aria-hidden
    >
      {monogramText(name)}
    </span>
  );
}
