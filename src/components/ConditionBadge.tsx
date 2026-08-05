import type { ConditionGrade } from "@/types";

const note: Record<ConditionGrade, string> = {
  "New with Tags": "Unworn, tags attached",
  "Photoshoot Sample": "Worn for one shoot only",
  "Worn Once": "A single outing",
  "Gently Used": "Loved, checked, disclosed",
};

export function ConditionBadge({
  condition,
  withNote = false,
}: {
  condition: ConditionGrade;
  withNote?: boolean;
}) {
  return (
    <span className="ink-tag" title={note[condition]}>
      {condition}
      {withNote && <span className="normal-case tracking-normal opacity-70">· {note[condition]}</span>}
    </span>
  );
}
