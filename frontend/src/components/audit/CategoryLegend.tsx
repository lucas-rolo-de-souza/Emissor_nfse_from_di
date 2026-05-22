import { CATEGORY_STYLES, type FieldCategory } from "../../lib/fieldSchema";

const VISIBLE_CATEGORIES: FieldCategory[] = [
  "id",
  "tax",
  "value",
  "quantity",
  "date",
  "text",
  "meta",
  "filler",
];

export function CategoryLegend() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {VISIBLE_CATEGORIES.map((cat) => {
        const s = CATEGORY_STYLES[cat];
        return (
          <span
            key={cat}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.badgeBg} ${s.badgeText}`}
          >
            {s.label}
          </span>
        );
      })}
    </div>
  );
}
