import React, { useMemo } from "react";
import { Card } from "./ui/Card";
import { ChevronDown, ChevronRight, AlertCircle } from "lucide-react";

interface FieldDef {
  name: string;
  start: number; // 1-based start index
  len: number;
  desc?: string;
  type?: "N" | "A";
  decimals?: number;
}

const HEADER_SCHEMA: FieldDef[] = [
  { name: "OBS", start: 1, len: 1, desc: "Identificador Capa (Fixed 1)" },
  { name: "Empresa", start: 2, len: 2, desc: "Código Empresa" },
  { name: "Filial", start: 4, len: 2, desc: "Código Filial" },
  { name: "Nota", start: 6, len: 9, desc: "Número da Nota" },
  { name: "Filler", start: 15, len: 6 },
  {
    name: "Aliq ICMS",
    start: 21,
    len: 7,
    desc: "Alíquota ICMS",
    type: "N",
    decimals: 2,
  },
  { name: "CFOP", start: 28, len: 6, desc: "CFOP" },
  { name: "CFP", start: 34, len: 5 },
  { name: "CGC Emitente", start: 39, len: 14, desc: "CNPJ/CPF Emitente" },
  { name: "Cod IPI", start: 53, len: 3 },
  { name: "Processo", start: 56, len: 17, desc: "Num. Processo/Desemb." },
  { name: "Qtd Itens", start: 73, len: 2 },
  { name: "Data Ref", start: 75, len: 6, desc: "MMAAAA" },
  { name: "Data Emissao", start: 81, len: 8, desc: "DDMMAAAA" },
  { name: "Data Entrada", start: 89, len: 8, desc: "DDMMAAAA" },
  { name: "Filler", start: 97, len: 6 },
  { name: "Data DI", start: 103, len: 8, desc: "DDMMAAAA" },
  { name: "Filler", start: 111, len: 2 },
  { name: "Ent/Sai", start: 113, len: 1, desc: "E/S" },
  { name: "Especie", start: 114, len: 3, desc: "Espécie Nota (NFE)" },
  { name: "Flag Canc", start: 117, len: 1 },
  { name: "Filler", start: 118, len: 1 },
  { name: "Flag Ent", start: 119, len: 1 },
  { name: "Num DI", start: 120, len: 10, desc: "Número DI" },
  { name: "Serie", start: 130, len: 3 },
  { name: "CST", start: 133, len: 2 },
  { name: "Sit Trib E", start: 135, len: 5 },
  { name: "Sit Trib F", start: 140, len: 5 },
  { name: "UF", start: 145, len: 2 },
  { name: "Via", start: 147, len: 1 },
  { name: "Valor Frete", start: 148, len: 15, type: "N", decimals: 2 },
  { name: "Valor ICMS", start: 163, len: 15, type: "N", decimals: 2 },
  { name: "Base ICMS", start: 178, len: 15, type: "N", decimals: 2 },
  { name: "Cod Importador", start: 193, len: 4 },
  { name: "Cod Transportador", start: 197, len: 20 },
  { name: "Valor Seguro", start: 217, len: 15, type: "N", decimals: 2 },
  { name: "Valor IPI", start: 232, len: 15, type: "N", decimals: 2 },
  { name: "Total Mercadoria", start: 247, len: 15, type: "N", decimals: 2 },
  { name: "Total Nota", start: 262, len: 15, type: "N", decimals: 2 },
  { name: "Base IPI", start: 277, len: 15, type: "N", decimals: 2 },
  { name: "Filler", start: 292, len: 2 },
  { name: "Cod Exportador", start: 294, len: 4 },
  { name: "Nome Exportador", start: 298, len: 60 },
  { name: "Numero PO", start: 358, len: 17 },
  { name: "Red. Base ICMS", start: 375, len: 6, type: "N", decimals: 2 },
];

const ITEM_SCHEMA: FieldDef[] = [
  { name: "OBS", start: 1, len: 1, desc: "Identificador Detalhe (Fixed 2)" },
  { name: "Empresa", start: 2, len: 2 },
  { name: "Filial", start: 4, len: 2 },
  { name: "Nota", start: 6, len: 9 },
  { name: "Num Lancamento", start: 15, len: 6 },
  { name: "NCM", start: 21, len: 10 },
  { name: "Cod Interno", start: 31, len: 20 },
  { name: "Trib ICMS", start: 51, len: 1 },
  { name: "Trib IPI", start: 52, len: 1 },
  { name: "Num Item", start: 53, len: 2 },
  { name: "Quantidade", start: 55, len: 11, type: "N", decimals: 4 },
  { name: "Unidade", start: 66, len: 3 },
  { name: "Vlr IPI", start: 69, len: 15, type: "N", decimals: 2 },
  { name: "Vlr Mercadoria", start: 84, len: 15, type: "N", decimals: 2 },
  { name: "Flag Ent", start: 99, len: 1 },
  { name: "Qtd Rec", start: 100, len: 11, type: "N", decimals: 4 },
  { name: "Descricao", start: 111, len: 150 },
  { name: "Vlr FOB", start: 261, len: 15, type: "N", decimals: 2 },
  { name: "Vlr Frete", start: 276, len: 15, type: "N", decimals: 2 },
  { name: "Vlr Seguro", start: 291, len: 15, type: "N", decimals: 2 },
  { name: "Vlr II", start: 306, len: 15, type: "N", decimals: 2 },
  { name: "Aliq IPI", start: 321, len: 5, type: "N", decimals: 2 },
  { name: "Despesas", start: 326, len: 15, type: "N", decimals: 2 },
  { name: "Num Processo", start: 341, len: 17 },
  { name: "EX NCM", start: 358, len: 3 },
  { name: "Invoice", start: 361, len: 15 },
  { name: "ICMS Recolher", start: 376, len: 15, type: "N", decimals: 2 },
  { name: "Peso Liquido", start: 391, len: 11, type: "N", decimals: 4 },
  { name: "Item Pedido", start: 402, len: 4 },
  { name: "Aliq II", start: 406, len: 5, type: "N", decimals: 2 },
  { name: "Num Pedido", start: 411, len: 17 },
  { name: "PLI / LI", start: 428, len: 10 },
  { name: "Serie", start: 438, len: 3 },
  { name: "Base ICMS", start: 441, len: 15, type: "N", decimals: 2 },
  { name: "FOB Origem", start: 456, len: 15, type: "N", decimals: 7 },
  { name: "Aliq PIS", start: 471, len: 6, type: "N", decimals: 2 },
  { name: "Vlr Qtde PIS", start: 477, len: 9, type: "N", decimals: 2 },
  { name: "Base PIS", start: 486, len: 15, type: "N", decimals: 2 },
  { name: "Vlr PIS", start: 501, len: 15, type: "N", decimals: 2 },
  { name: "Aliq COFINS", start: 516, len: 6, type: "N", decimals: 2 },
  { name: "Vlr Qtde COFINS", start: 522, len: 9, type: "N", decimals: 2 },
  { name: "Base COFINS", start: 531, len: 15, type: "N", decimals: 2 },
  { name: "Vlr COFINS", start: 546, len: 15, type: "N", decimals: 2 },
  { name: "Num Adicao", start: 561, len: 3 },
  { name: "Seq Item", start: 564, len: 3 },
  { name: "Vlr Desconto", start: 567, len: 15, type: "N", decimals: 2 },
  { name: "Vlr IOF", start: 582, len: 15, type: "N", decimals: 2 },
  { name: "Desp Aduaneiras", start: 597, len: 15, type: "N", decimals: 2 },
  { name: "Aliq Esp IPI", start: 612, len: 15, type: "N", decimals: 4 },
  { name: "Qtd IPI", start: 627, len: 11, type: "N", decimals: 4 },
  { name: "Qtd PIS", start: 638, len: 11, type: "N", decimals: 4 },
  { name: "Qtd COFINS", start: 649, len: 11, type: "N", decimals: 4 },
  { name: "Lote", start: 660, len: 10 },
  { name: "Validade", start: 670, len: 8 },
  { name: "Aliq ICMS Item", start: 678, len: 5, type: "N", decimals: 2 },
  { name: "Aliq Maj COFINS", start: 683, len: 6, type: "N", decimals: 2 },
  { name: "Perc Rateio", start: 689, len: 8, type: "N", decimals: 4 },
];

interface TxtAuditViewerProps {
  content: string; // The current (edited) TXT content
  originalContent?: string; // The original raw TXT content for comparison
  onUpdate: (newContent: string) => void;
}

export function TxtAuditViewer({
  content,
  originalContent,
  onUpdate,
}: TxtAuditViewerProps) {
  const lines = useMemo(() => content.split(/\r\n|\n|\r/), [content]);
  const originalLines = useMemo(
    () => (originalContent ? originalContent.split(/\r\n|\n|\r/) : []),
    [originalContent],
  );

  const handleLineUpdate = (rowIndex: number, newLine: string) => {
    const newLines = [...lines];
    newLines[rowIndex] = newLine;
    onUpdate(newLines.join("\r\n")); // Standardize on CRLF when saving
  };

  return (
    <div className="space-y-4 font-mono text-sm">
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm mb-4">
        <div className="flex items-center gap-2 mb-1 font-semibold">
          <AlertCircle className="w-4 h-4" />
          Modo Auditoria Habilitado (Edição)
        </div>
        <p>
          Você pode editar os valores. O sistema ajustará zeros à esquerda e
          casas decimais automaticamente ao sair do campo.
        </p>
      </div>

      {lines.map((line, idx) => {
        if (!line.trim()) return null;

        const type = line.substring(0, 1);
        const schema =
          type === "1" ? HEADER_SCHEMA : type === "2" ? ITEM_SCHEMA : [];

        if (!schema.length) {
          return (
            <div
              key={idx}
              className="p-2 border rounded bg-gray-100 text-gray-500"
            >
              Linha desconhecida: {line}
            </div>
          );
        }

        return (
          <AuditRow
            key={idx}
            line={line}
            originalLine={originalLines[idx]}
            schema={schema}
            type={type}
            onLineUpdate={(newLine) => handleLineUpdate(idx, newLine)}
          />
        );
      })}
    </div>
  );
}

function AuditRow({
  line,
  originalLine,
  schema,
  type,
  onLineUpdate,
}: {
  line: string;
  originalLine?: string;
  schema: FieldDef[];
  type: string;
  onLineUpdate: (l: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse fields from CURRENT line
  const fields = schema.map((def) => {
    const startIdx = def.start - 1;
    const endIdx = startIdx + def.len;
    const rawValue = line.substring(startIdx, endIdx);

    // Extract original value if available
    let originalValue = "-";
    if (originalLine) {
      originalValue = originalLine.substring(startIdx, endIdx);
    }

    return { ...def, value: rawValue, originalValue };
  });

  const handleFieldChange = (fieldIndex: number, newValue: string) => {
    const field = fields[fieldIndex];
    let formatted = newValue;

    // Smart Formatting Logic
    if (field.type === "N") {
      // 1. Remove invalid chars (except dot)
      formatted = formatted.replace(/[^0-9.]/g, "");

      // 2. Handle Padding & Decimals
      if (field.decimals !== undefined) {
        // If it has a dot, align decimals
        if (formatted.includes(".")) {
          const [intPart, decPart] = formatted.split(".");
          // Truncate/Pad decimals
          const cleanDec = decPart
            .substring(0, field.decimals)
            .padEnd(field.decimals, "0");
          formatted = `${intPart}${cleanDec}`; // Remove dot
        } else {
          // No dot, assume integer part and append zeros
          formatted = `${formatted}${"0".repeat(field.decimals)}`;
        }
      }

      // 3. Left Pad with Zeros
      if (formatted.length > field.len) {
        formatted = formatted.substring(0, field.len);
      } else {
        formatted = formatted.padStart(field.len, "0");
      }
    } else {
      // Alpha: Right Pad Space
      if (formatted.length > field.len) {
        formatted = formatted.substring(0, field.len);
      } else {
        formatted = formatted.padEnd(field.len, " ");
      }
    }

    // Reconstruct Line
    let newLine = line;
    const startIdx = field.start - 1;
    const endIdx = startIdx + field.len;
    newLine = newLine.slice(0, startIdx) + formatted + newLine.slice(endIdx);

    onLineUpdate(newLine);
  };

  return (
    <Card className="overflow-hidden border-slate-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors ${type === "1" ? "bg-indigo-50/50" : "bg-white"}`}
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold ${type === "1" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}
        >
          {type === "1" ? "HEADER" : "ITEM"}
        </span>
        <span className="font-mono text-xs text-slate-500 truncate max-w-xl opacity-75">
          {line}
        </span>
      </button>

      {isOpen && (
        <div className="overflow-x-auto border-t border-slate-100 bg-slate-50/30 p-4">
          <table className="w-full text-xs box-border">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200 text-left">
                <th className="px-2 py-1 font-medium">Seq</th>
                <th className="px-2 py-1 font-medium">Campo</th>
                <th className="px-2 py-1 font-medium text-right">Posição</th>
                <th className="px-2 py-1 font-medium text-right">Tam</th>
                <th className="px-2 py-1 font-medium text-left pl-4 text-slate-400">
                  Valor (Extraído)
                </th>
                <th className="px-2 py-1 font-medium text-left pl-4">
                  Valor (Editável)
                </th>
                <th className="px-2 py-1 font-medium text-left">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {fields.map((f, i) => {
                const isModified =
                  f.value !== f.originalValue && f.originalValue !== "-";
                return (
                  <tr
                    key={i}
                    className={`transition-colors ${isModified ? "bg-amber-50 hover:bg-amber-100" : "hover:bg-blue-50/50"}`}
                  >
                    <td className="px-2 py-1.5 text-slate-400">{i + 1}</td>
                    <td className="px-2 py-1.5 font-semibold text-slate-700">
                      {f.name}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-slate-500">
                      {f.start} - {f.start + f.len - 1}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-slate-500">
                      {f.len}
                    </td>
                    <td className="px-2 py-1.5 pl-4 font-mono text-slate-400 break-all select-all">
                      {f.originalValue}
                    </td>
                    <td className="px-2 py-1.5 pl-4">
                      <EditableCell
                        value={f.value}
                        onCommit={(val) => handleFieldChange(i, val)}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-slate-500 italic">
                      {f.desc || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function EditableCell({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (val: string) => void;
}) {
  const [localVal, setLocalVal] = React.useState(value);

  React.useEffect(() => {
    setLocalVal(value);
  }, [value]);

  return (
    <input
      type="text"
      aria-label="Edit value"
      className="w-full min-w-[120px] bg-blue-50/20 border border-transparent hover:border-blue-300 focus:border-blue-500 focus:bg-white rounded px-1 py-0.5 font-mono text-blue-700 outline-none transition-all"
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={() => {
        if (localVal !== value) {
          onCommit(localVal);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
    />
  );
}
