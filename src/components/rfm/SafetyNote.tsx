import { ANYWHERE_ELSE, SAFETY_NOTE, helplinesFor, type Helpline } from "../../lib/helplines";
import { Icon } from "./brand";

/** Goes on every booking screen, every email and the footer. Pass `lines` from the helplines table when loaded. */
export function SafetyNote({ zone, lines: given }: { zone?: string | undefined; lines?: Helpline[] | undefined }) {
  const lines = given ?? (zone ? helplinesFor(zone) : []);
  return (
    <aside className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-[22px] bg-sunk p-5 text-[13px] leading-[19px] text-ink-muted">
      <Icon name="icon-helplines" size={28} className="mt-0.5" />
      <div>
      <p>{SAFETY_NOTE}</p>
      {lines.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {lines.map((l) => (
            <li key={l.name + l.number}>
              <span className="font-semibold text-ink">{l.name}</span> {l.number}
              {l.hours ? ` (${l.hours})` : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2">{ANYWHERE_ELSE}</p>
      )}
      </div>
    </aside>
  );
}
