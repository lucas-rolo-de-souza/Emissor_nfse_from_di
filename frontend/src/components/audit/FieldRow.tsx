import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { ExtractedField, LayoutVersion } from "../../lib/fieldSchema";
import { CATEGORY_STYLES, LAYOUT_LENGTHS } from "../../lib/fieldSchema";
import { formatFriendly } from "../../lib/fieldFormatters";
import { EditableCell } from "./EditableCell";

interface FieldRowProps {
  field: ExtractedField;
  fieldIndex: number;
  globalShowRaw: boolean;
  detectedLayout: LayoutVersion;
  lineType: "header" | "item";
  onCommit: (newRaw: string) => void;
}

export function FieldRow({ field, fieldIndex, globalShowRaw, detectedLayout, lineType, onCommit }: FieldRowProps) {
  const [localShowRaw, setLocalShowRaw] = useState(false);
  const showRaw = localShowRaw || globalShowRaw;

  const { def, rawValue, originalRawValue, isModified } = field;
  const styles = CATEGORY_STYLES[def.category];
  const friendly = formatFriendly(def, rawValue);
  const isFiller = def.category === "filler";

  const targetLen = lineType === "header"
    ? LAYOUT_LENGTHS[detectedLayout].header
    : LAYOUT_LENGTHS[detectedLayout].item;

  const isFieldAbsent = (def.start + def.len - 1) > targetLen;
  const isDuimpOnly = def.isDUIMPOnly === true;

  const rowClass = [
    isModified
      ? "bg-amber-100/80 dark:bg-amber-950/20 hover:bg-amber-200/60 dark:hover:bg-amber-900/30"
      : isFieldAbsent
        ? "bg-violet-50/50 dark:bg-violet-950/20 hover:bg-violet-100/50 dark:hover:bg-violet-900/30"
        : `${styles.rowBg} ${styles.rowHoverBg}`,
    isFieldAbsent ? "border-l-2 border-violet-400 dark:border-violet-500" : styles.border,
    isFiller ? "opacity-50 dark:opacity-40" : "",
    "transition-colors",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <tr className={rowClass}>
      <td className="px-2 py-1.5 text-slate-400 dark:text-slate-500 text-xs w-8">{fieldIndex + 1}</td>
      <td className="px-2 py-1.5 w-40">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-xs text-slate-700 dark:text-slate-300">{def.friendlyLabel}</span>
          {isFieldAbsent && (
            <span
              title={
                isDuimpOnly
                  ? "Campo exclusivo do layout DUIMP. Ausente neste arquivo de formato DI."
                  : "Campo novo ausente na versão antiga do layout."
              }
              className="inline-block px-1 py-0.5 rounded text-[9px] font-bold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 uppercase tracking-wide cursor-help"
            >
              {isDuimpOnly ? "duimp" : "novo"}
            </span>
          )}
        </div>
        {def.desc && (
          <p className="text-slate-400 dark:text-slate-500 text-[10px] leading-tight mt-0.5">{def.desc}</p>
        )}
      </td>
      <td className="px-2 py-1.5 text-right font-mono text-xs text-slate-400 dark:text-slate-500 w-20">
        {def.start}–{def.start + def.len - 1}
      </td>
      <td className="px-2 py-1.5 text-right font-mono text-xs text-slate-400 dark:text-slate-500 w-10">
        {def.len}
      </td>
      <td className="px-2 py-1.5 w-10">
        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${styles.badgeBg} ${styles.badgeText}`}>
          {def.category}
        </span>
      </td>

      {/* Display column: friendly or raw */}
      <td className="px-2 py-1.5 w-48">
        {showRaw ? (
          <span className="font-mono text-xs text-slate-600 dark:text-slate-350 break-all select-all">
            {isFieldAbsent && !rawValue ? <span className="text-slate-300 dark:text-slate-600 italic">vazio</span> : rawValue}
          </span>
        ) : (
          <div>
            <span className={`text-xs font-medium ${isFieldAbsent && !rawValue ? "text-slate-300 dark:text-slate-600 italic" : (styles.badgeText || "text-slate-700 dark:text-slate-300")}`}>
              {isFieldAbsent && !rawValue ? "não preenchido" : friendly}
            </span>
            {!isFiller && rawValue && (
              <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight break-all">
                {rawValue}
              </p>
            )}
          </div>
        )}
      </td>

      {/* Original value for comparison */}
      <td className="px-2 py-1.5 w-40">
        {isFieldAbsent ? (
          <span className="text-violet-350 dark:text-violet-400 text-[10px] italic">
            {isDuimpOnly ? "ausente na DI" : "ausente no layout"}
          </span>
        ) : originalRawValue !== undefined ? (
          <span className={`font-mono text-xs break-all select-all ${isModified ? "text-amber-600 dark:text-amber-500 line-through" : "text-slate-400 dark:text-slate-500"}`}>
            {isModified ? originalRawValue : "—"}
          </span>
        ) : (
          <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
        )}
      </td>

      {/* Editable cell */}
      <td className="px-2 py-1.5 w-44">
        <EditableCell
          fieldDef={def}
          rawValue={rawValue}
          onCommit={onCommit}
        />
      </td>

      {/* Per-field raw toggle */}
      <td className="px-2 py-1.5 w-8">
        {!globalShowRaw && (
          <button
            onClick={() => setLocalShowRaw((v) => !v)}
            title={localShowRaw ? "Mostrar amigável" : "Mostrar raw"}
            className="p-1 rounded text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors"
          >
            {localShowRaw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        )}
      </td>
    </tr>
  );
}
