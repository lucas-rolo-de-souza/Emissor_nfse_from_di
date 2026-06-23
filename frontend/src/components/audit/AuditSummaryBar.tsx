import { extractFields, HEADER_SCHEMA, type LayoutVersion, LAYOUT_LENGTHS } from "../../lib/fieldSchema";
import { formatFriendly } from "../../lib/fieldFormatters";

interface AuditSummaryBarProps {
  lines: string[];
  filename: string;
  detectedLayout: LayoutVersion;
  modifiedLines?: string[];
}

interface TileProps {
  label: string;
  value: string;
  colorClass: string;
  isModified?: boolean;
}

function SummaryTile({ label, value, colorClass, isModified }: TileProps) {
  return (
    <div className={`relative rounded-lg px-3 py-2 min-w-[120px] ${colorClass}`}>
      {isModified && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" title="Campo modificado" />
      )}
      <p className="text-[10px] font-medium uppercase tracking-wide opacity-60">{label}</p>
      <p className="text-sm font-semibold mt-0.5 truncate" title={value}>{value}</p>
    </div>
  );
}

function pickField(fields: ReturnType<typeof extractFields>, name: string) {
  return fields.find((f) => f.def.name === name);
}

export function AuditSummaryBar({ lines, filename, detectedLayout, modifiedLines }: AuditSummaryBarProps) {
  const headerLine = lines.find((l) => l.charAt(0) === "1");
  const itemLines = lines.filter((l) => l.charAt(0) === "2");

  if (!headerLine) return null;

  const fields = extractFields(headerLine, HEADER_SCHEMA, modifiedLines?.find((l) => l.charAt(0) === "1"));

  const f = (name: string) => {
    const field = pickField(fields, name);
    return field ? formatFriendly(field.def, field.rawValue) : "—";
  };

  const isModified = (name: string) => pickField(fields, name)?.isModified ?? false;
  const isDuimp = detectedLayout === "v3_DUIMP";
  const docLabel = isDuimp ? "DUIMP" : "DI";
  const docValue = isDuimp ? f("numero_duimp") : f("numero_di");
  const docModified = isDuimp ? isModified("numero_duimp") : isModified("numero_di");

  const identityTiles: TileProps[] = [
    { label: "Nota", value: f("numero_nota"), colorClass: "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-300", isModified: isModified("numero_nota") },
    { label: docLabel, value: docValue, colorClass: "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-300", isModified: docModified },
    { label: "CFOP", value: f("cfop"), colorClass: "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-300", isModified: isModified("cfop") },
    { label: "Emissão", value: f("data_emissao"), colorClass: "bg-purple-50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300", isModified: isModified("data_emissao") },
    { label: "Entrada", value: f("data_entrada"), colorClass: "bg-purple-50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300", isModified: isModified("data_entrada") },
    { label: "Itens", value: `${itemLines.length}`, colorClass: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-350" },
  ];

  const financialTiles: TileProps[] = [
    { label: "Total Mercadoria", value: f("valor_total_mercadoria"), colorClass: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300", isModified: isModified("valor_total_mercadoria") },
    { label: "Total Nota", value: f("valor_total_nota"), colorClass: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300", isModified: isModified("valor_total_nota") },
    { label: "Frete", value: f("valor_frete"), colorClass: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-950/20 text-emerald-900 dark:text-emerald-300", isModified: isModified("valor_frete") },
    { label: "Seguro", value: f("valor_seguro"), colorClass: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300", isModified: isModified("valor_seguro") },
  ];

  const exportador = f("nome_exportador");

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dados da Nota Fiscal</h3>
        <div className="flex items-center gap-2">
          <span
            title={`Layout ${detectedLayout.toUpperCase()}: header ${LAYOUT_LENGTHS[detectedLayout].header} chars, item ${LAYOUT_LENGTHS[detectedLayout].item} chars`}
            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide cursor-help bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
          >
            {detectedLayout === "v3_DUIMP" ? "DUIMP (Layout 399/717)" : "DI (Layout 380/717)"}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{filename}</span>
        </div>
      </div>

      {exportador !== "—" && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-600 dark:text-slate-350">Exportador: </span>{exportador}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {identityTiles.map((t) => (
          <SummaryTile key={t.label} {...t} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        {financialTiles.map((t) => (
          <SummaryTile key={t.label} {...t} />
        ))}
      </div>
    </div>
  );
}
