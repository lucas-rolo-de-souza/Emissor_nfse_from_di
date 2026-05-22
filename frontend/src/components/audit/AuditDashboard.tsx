import { useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { AuditLineCard } from "./AuditLineCard";
import type { LayoutVersion } from "../../lib/fieldSchema";

interface AuditDashboardProps {
  content: string;
  originalContent?: string;
  onUpdate: (newContent: string) => void;
  globalShowRaw: boolean;
  detectedLayout: LayoutVersion;
}

export function AuditDashboard({
  content,
  originalContent,
  onUpdate,
  globalShowRaw,
  detectedLayout,
}: AuditDashboardProps) {
  const lines = useMemo(() => content.split(/\r\n|\n|\r/), [content]);
  const originalLines = useMemo(
    () => (originalContent ? originalContent.split(/\r\n|\n|\r/) : []),
    [originalContent],
  );

  const handleLineUpdate = (rowIndex: number, newLine: string) => {
    const newLines = [...lines];
    newLines[rowIndex] = newLine;
    onUpdate(newLines.join("\r\n"));
  };

  const activeLines = lines
    .map((line, idx) => ({ line, idx }))
    .filter(({ line }) => line.trim().length > 0);

  let itemCounter = 0;

  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs flex items-start gap-2">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Modo Auditoria</span> — Expanda cada linha para inspecionar e editar campos. O campo "Editar" sempre mostra os bytes raw. O campo "Valor" alterna entre formato amigável e raw.
          {detectedLayout === "v1" && (
            <span className="ml-1">
              Campos marcados com <span className="font-bold text-violet-700">novo v2</span> não existem no arquivo original — preencha-os para salvar em formato v2.
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {activeLines.map(({ line, idx }) => {
          const lineType = line.charAt(0);
          let lineIndex = 0;
          if (lineType === "2") {
            itemCounter += 1;
            lineIndex = itemCounter;
          }

          return (
            <AuditLineCard
              key={idx}
              line={line}
              originalLine={originalLines[idx]}
              lineIndex={lineIndex}
              globalShowRaw={globalShowRaw}
              detectedLayout={detectedLayout}
              onLineUpdate={(newLine) => handleLineUpdate(idx, newLine)}
            />
          );
        })}
      </div>
    </div>
  );
}
