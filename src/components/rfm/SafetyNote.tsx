import { Icon } from "./brand";
import { helplineFor } from "@/lib/helplines";

export function SafetyNote({ zone }: { zone?: string }) {
  const line = helplineFor(zone);
  return (
    <aside className="mt-8 flex gap-4 rounded-[22px] bg-sunk p-6 text-[16px] leading-[25px]">
      <Icon name="helplines" size={24} className="mt-0.5" />
      <div>
        <p><strong>Room for Mama is friendly support, not medical care.</strong> If you feel low most days, please talk to your doctor or a helpline. If you have thoughts of harming yourself or your baby, call a helpline or your local emergency number now.</p>
        <p className="mt-3 font-semibold">{line}</p>
      </div>
    </aside>
  );
}
