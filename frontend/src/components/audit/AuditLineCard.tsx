import { useState } from "react";
import { ChevronDown, ChevronRight, Filter } from "lucide-react";
import { CategoryLegend } from "./CategoryLegend";
import { FieldRow } from "./FieldRow";
import { getSchemaForLine, extractFields, type LayoutVersion } from "../../lib/fieldSchema";
import { formatRawFromUserInput } from "../../lib/fieldFormatters";

interface AuditLineCardProps {
  line: string;
  originalLine?: string;
  lineIndex: number;
  globalShowRaw: boolean;
  detectedLayout: LayoutVersion;
  onLineUpdate: (newLine: string) => void;
}

export function AuditLineCard({
  line,
  originalLine,
  lineIndex,
  globalShowRaw,
  detectedLayout,
  onLineUpdate,
}: AuditLineCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hideFiller, setHideFiller] = useState(true);

  const schema = getSchemaForLine(line);
  const lineType = line.charAt(0) === "1" ? "header" : "item";

  const fields = extractFields(line, schema, originalLine);
  const modifiedCount = fields.filter((f) => f.isModified).length;
  const visibleFields = hideFiller
    ? fields.filter((f) => f.def.category !== "filler")
    : fields;

  const handleCommit = (fieldIndex: number, newRaw: string) => {
    const field = fields[fieldIndex];
    const formatted = formatRawFromUserInput(field.def, newRaw);
    const startIdx = field.def.start - 1;
    const endIdx = startIdx + field.def.len;
    const newLine = line.slice(0, startIdx) + formatted + line.slice(endIdx);
    onLineUpdate(newLine);
  };

  const headerBg = lineType === "header" ? "bg-indigo-50/60" : "bg-white";
  const typeBadge =
    lineType === "header"
      ? "bg-indigo-100 text-indigo-700"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors ${headerBg}`}
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        )}

        <span className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 ${typeBadge}`}>
          {lineType === "header" ? "HEADER" : `ITEM #${lineIndex}`}
        </span>

        {modifiedCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 shrink-0">
            {modifiedCount} alterado{modifiedCount !== 1 ? "s" : ""}
          </span>
        )}

        <span className="font-mono text-xs text-slate-400 truncate flex-1 opacity-60">
          {line.substring(0, 80)}
          {line.length > 80 ? "…" : ""}
        </span>

        <span className="text-xs text-slate-400 shrink-0">{line.length} chars</span>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100">
          <div className="px-4 py-2 bg-slate-50/60 flex items-center justify-between gap-4 flex-wrap">
            <CategoryLegend />
            <button
              onClick={() => setHideFiller((v) => !v)}
              className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors ${
                hideFiller
                  ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-3 h-3" />
              {hideFiller ? "Filler oculto" : "Mostrar filler"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200 bg-slate-50/80 text-left">
                  <th className="px-2 py-1.5 font-medium w-8">#</th>
                  <th className="px-2 py-1.5 font-medium w-40">Campo</th>
                  <th className="px-2 py-1.5 font-medium text-right w-20">Posição</th>
                  <th className="px-2 py-1.5 font-medium text-right w-10">Tam</th>
                  <th className="px-2 py-1.5 font-medium w-10">Tipo</th>
                  <th className="px-2 py-1.5 font-medium w-48">Valor</th>
                  <th className="px-2 py-1.5 font-medium w-40 text-slate-400">Original</th>
                  <th className="px-2 py-1.5 font-medium w-44">Editar (raw)</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {visibleFields.map((field) => {
                  const globalIdx = fields.indexOf(field);
                  return (
                    <FieldRow
                      key={field.def.name}
                      field={field}
                      fieldIndex={globalIdx}
                      globalShowRaw={globalShowRaw}
                      detectedLayout={detectedLayout}
                      onCommit={(newRaw) => handleCommit(globalIdx, newRaw)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
