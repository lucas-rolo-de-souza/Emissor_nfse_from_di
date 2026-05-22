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

  const identityTiles: TileProps[] = [
    { label: "Nota", value: f("numero_nota"), colorClass: "bg-indigo-50 text-indigo-900", isModified: isModified("numero_nota") },
    { label: "DI", value: f("numero_di"), colorClass: "bg-indigo-50 text-indigo-900", isModified: isModified("numero_di") },
    { label: "CFOP", value: f("cfop"), colorClass: "bg-indigo-50 text-indigo-900", isModified: isModified("cfop") },
    { label: "Emissão", value: f("data_emissao"), colorClass: "bg-purple-50 text-purple-900", isModified: isModified("data_emissao") },
    { label: "Entrada", value: f("data_entrada"), colorClass: "bg-purple-50 text-purple-900", isModified: isModified("data_entrada") },
    { label: "Itens", value: `${itemLines.length}`, colorClass: "bg-slate-100 text-slate-800" },
  ];

  const financialTiles: TileProps[] = [
    { label: "Total Mercadoria", value: f("valor_total_mercadoria"), colorClass: "bg-emerald-50 text-emerald-900", isModified: isModified("valor_total_mercadoria") },
    { label: "Total Nota", value: f("valor_total_nota"), colorClass: "bg-emerald-50 text-emerald-900", isModified: isModified("valor_total_nota") },
    { label: "Frete", value: f("valor_frete"), colorClass: "bg-emerald-50 text-emerald-900", isModified: isModified("valor_frete") },
    { label: "Seguro", value: f("valor_seguro"), colorClass: "bg-emerald-50 text-emerald-900", isModified: isModified("valor_seguro") },
  ];

  const exportador = f("nome_exportador");

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Dados da Nota Fiscal</h3>
        <div className="flex items-center gap-2">
          <span
            title={`Layout ${detectedLayout.toUpperCase()}: header ${LAYOUT_LENGTHS[detectedLayout].header} chars, item ${LAYOUT_LENGTHS[detectedLayout].item} chars`}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide cursor-help ${
              detectedLayout === "v2"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            Layout {detectedLayout.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400 font-mono">{filename}</span>
        </div>
      </div>

      {exportador !== "—" && (
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-600">Exportador: </span>{exportador}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {identityTiles.map((t) => (
          <SummaryTile key={t.label} {...t} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
        {financialTiles.map((t) => (
          <SummaryTile key={t.label} {...t} />
        ))}
      </div>
    </div>
  );
}
