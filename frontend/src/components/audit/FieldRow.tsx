import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { ExtractedField, LayoutVersion } from "../../lib/fieldSchema";
import { CATEGORY_STYLES } from "../../lib/fieldSchema";
import { formatFriendly } from "../../lib/fieldFormatters";
import { EditableCell } from "./EditableCell";

interface FieldRowProps {
  field: ExtractedField;
  fieldIndex: number;
  globalShowRaw: boolean;
  detectedLayout: LayoutVersion;
  onCommit: (newRaw: string) => void;
}

export function FieldRow({ field, fieldIndex, globalShowRaw, detectedLayout, onCommit }: FieldRowProps) {
  const [localShowRaw, setLocalShowRaw] = useState(false);
  const showRaw = localShowRaw || globalShowRaw;

  const { def, rawValue, originalRawValue, isModified } = field;
  const styles = CATEGORY_STYLES[def.category];
  const friendly = formatFriendly(def, rawValue);
  const isFiller = def.category === "filler";
  const isNewFieldOnOldFile = def.isNewInV2 === true && detectedLayout === "v1";

  const rowClass = [
    isModified
      ? "bg-amber-100/80 hover:bg-amber-200/60"
      : isNewFieldOnOldFile
        ? "bg-violet-50/50 hover:bg-violet-100/50"
        : `${styles.rowBg} ${styles.rowHoverBg}`,
    isNewFieldOnOldFile ? "border-l-2 border-violet-400" : styles.border,
    isFiller ? "opacity-50" : "",
    "transition-colors",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <tr className={rowClass}>
      <td className="px-2 py-1.5 text-slate-400 text-xs w-8">{fieldIndex + 1}</td>
      <td className="px-2 py-1.5 w-40">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-xs text-slate-700">{def.friendlyLabel}</span>
          {isNewFieldOnOldFile && (
            <span
              title="Campo novo no layout v2 — não presente no arquivo original. Preencha para salvar em formato v2."
              className="inline-block px-1 py-0.5 rounded text-[9px] font-bold bg-violet-100 text-violet-700 uppercase tracking-wide cursor-help"
            >
              novo v2
            </span>
          )}
        </div>
        {def.desc && (
          <p className="text-slate-400 text-[10px] leading-tight mt-0.5">{def.desc}</p>
        )}
      </td>
      <td className="px-2 py-1.5 text-right font-mono text-xs text-slate-400 w-20">
        {def.start}–{def.start + def.len - 1}
      </td>
      <td className="px-2 py-1.5 text-right font-mono text-xs text-slate-400 w-10">
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
          <span className="font-mono text-xs text-slate-600 break-all select-all">
            {isNewFieldOnOldFile && !rawValue ? <span className="text-slate-300 italic">vazio</span> : rawValue}
          </span>
        ) : (
          <div>
            <span className={`text-xs font-medium ${isNewFieldOnOldFile && !rawValue ? "text-slate-300 italic" : (styles.badgeText || "text-slate-700")}`}>
              {isNewFieldOnOldFile && !rawValue ? "não preenchido" : friendly}
            </span>
            {!isFiller && rawValue && (
              <p className="font-mono text-[10px] text-slate-400 mt-0.5 leading-tight break-all">
                {rawValue}
              </p>
            )}
          </div>
        )}
      </td>

      {/* Original value for comparison */}
      <td className="px-2 py-1.5 w-40">
        {isNewFieldOnOldFile ? (
          <span className="text-violet-300 text-[10px] italic">ausente no v1</span>
        ) : originalRawValue !== undefined ? (
          <span className={`font-mono text-xs break-all select-all ${isModified ? "text-amber-600 line-through" : "text-slate-400"}`}>
            {isModified ? originalRawValue : "—"}
          </span>
        ) : (
          <span className="text-slate-300 text-xs">—</span>
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
            className="p-1 rounded text-slate-300 hover:text-slate-500 transition-colors"
          >
            {localShowRaw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        )}
      </td>
    </tr>
  );
}
