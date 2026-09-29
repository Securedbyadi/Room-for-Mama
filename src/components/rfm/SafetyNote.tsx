import { ANYWHERE_ELSE, SAFETY_NOTE, helplinesFor } from "../../lib/helplines";

/** Goes on every booking screen, every email and the footer. */
export function SafetyNote({ zone }: { zone?: string }) {
  const lines = zone ? helplinesFor(zone) : [];
  return (
    <aside className="rounded-2xl bg-sunk p-4 text-[13px] leading-[19px] text-ink-muted">
      <p>{SAFETY_NOTE}</p>
      {lines.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {lines.map((l) => (
            <li key={l.name}>
              <span className="font-semibold text-ink">{l.name}</span> {l.number}
              {l.hours ? ` (${l.hours})` : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2">{ANYWHERE_ELSE}</p>
      )}
    </aside>
  );
}
