import { useState, useEffect } from "react";
import type { FieldDef } from "../../lib/fieldSchema";
import { formatRawFromUserInput } from "../../lib/fieldFormatters";

interface EditableCellProps {
  fieldDef: FieldDef;
  rawValue: string;
  onCommit: (newRaw: string) => void;
}

export function EditableCell({ fieldDef, rawValue, onCommit }: EditableCellProps) {
  const [localVal, setLocalVal] = useState(rawValue);

  useEffect(() => {
    setLocalVal(rawValue);
  }, [rawValue]);

  const handleCommit = () => {
    if (localVal !== rawValue) {
      const formatted = formatRawFromUserInput(fieldDef, localVal);
      onCommit(formatted);
    }
  };

  const isReadOnly = fieldDef.readOnly === true;

  return (
    <input
      type="text"
      aria-label={`Editar ${fieldDef.friendlyLabel}`}
      readOnly={isReadOnly}
      className={`w-full min-w-[100px] rounded px-1.5 py-0.5 font-mono text-xs outline-none transition-all
        ${isReadOnly
          ? "bg-transparent text-slate-400 cursor-not-allowed"
          : "bg-blue-50/30 border border-transparent hover:border-blue-300 focus:border-blue-500 focus:bg-white text-blue-700"
        }`}
      maxLength={fieldDef.len}
      value={localVal}
      onChange={(e) => !isReadOnly && setLocalVal(e.target.value)}
      onBlur={handleCommit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setLocalVal(rawValue);
          e.currentTarget.blur();
        }
      }}
    />
  );
}
