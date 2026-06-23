import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { HeaderData } from "@/types";

interface StepCapaProps {
  header: HeaderData;
  onChange: (field: keyof HeaderData, value: string) => void;
  errors: Partial<Record<keyof HeaderData, string>>;
}

type FieldDef = {
  key: keyof HeaderData;
  label: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
};

const SECTION_REQUIRED: FieldDef[] = [
  { key: "numero_nota", label: "Número da Nota", required: true, placeholder: "Ex: 000000001" },
  { key: "data_emissao", label: "Data de Emissão", required: true, placeholder: "AAAAMMDD ou DD/MM/AAAA" },
  { key: "data_entrada", label: "Data de Entrada", required: true, placeholder: "AAAAMMDD ou DD/MM/AAAA" },
  { key: "cfop", label: "CFOP", required: true, placeholder: "Ex: 3101" },
];



const SECTION_ENTITIES: FieldDef[] = [
  { key: "exporter_name", label: "Nome do Exportador", placeholder: "Ex: ACME CORP LTD" },
  { key: "exporter_country", label: "País do Exportador", placeholder: "Ex: CHINA" },
  { key: "cod_importador", label: "Cód. Importador", placeholder: "Código no ERP (até 4 chars)" },
  { key: "cod_transportador", label: "Cód. Transportador", placeholder: "Código no ERP" },
  { key: "cod_exportador", label: "Cód. Exportador", placeholder: "Código no ERP" },
];

const SECTION_OPTIONAL: FieldDef[] = [
  { key: "numero_po", label: "Número do PO", placeholder: "Ex: PO-2025-001" },
  { key: "invoice_number", label: "Número da Invoice", placeholder: "Ex: INV-12345" },
  { key: "perc_reducao", label: "% Redução Base ICMS", placeholder: "Ex: 0.00" },
  { key: "mv_eic0010_source", label: "Origem ICMS (MV_EIC0010)", placeholder: "HEADER ou ITEMS" },
  { key: "aliq_icms_capa", label: "Alíq. ICMS CAPA", placeholder: "Ex: 12.00" },
  { key: "mv_eic0076_mode", label: "Modo MV_EIC0076", placeholder: "STANDARD_15 ou FIELD_WIDTH" },
];

function FieldRow({ fields, header, errors, onChange }: {
  fields: FieldDef[];
  header: HeaderData;
  errors: Partial<Record<keyof HeaderData, string>>;
  onChange: (field: keyof HeaderData, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {fields.map(({ key, label, required, placeholder }) => (
        <div key={key} className="space-y-1">
          <Label required={required}>{label}</Label>
          <Input
            value={(header as unknown as Record<string, string>)[key] || ""}
            onChange={(e) => onChange(key, e.target.value)}
            error={!!errors[key]}
            placeholder={placeholder}
          />
          {errors[key] && <p className="text-xs text-red-650 dark:text-red-400 font-medium">{errors[key]}</p>}
        </div>
      ))}
    </div>
  );
}

export function StepCapa({ header, onChange, errors }: StepCapaProps) {
  const sectionNf = header.document_type === "DUIMP"
    ? [{ key: "duimp_number" as keyof HeaderData, label: "Número DUIMP", required: true, placeholder: "Ex: 22/0000000-0" }]
    : [{ key: "di_number" as keyof HeaderData, label: "Número DI", required: true, placeholder: "Ex: 22/000000-0" }];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-350 mb-3">Tipo do Documento (Layout de Exportação)</h3>
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => onChange("document_type", "DI")}
            className={`flex-1 py-2 px-4 rounded-md border text-sm font-semibold transition-all ${
              header.document_type !== "DUIMP"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
            }`}
          >
            DI (Layout 380/717)
          </button>
          <button
            type="button"
            onClick={() => onChange("document_type", "DUIMP")}
            className={`flex-1 py-2 px-4 rounded-md border text-sm font-semibold transition-all ${
              header.document_type === "DUIMP"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
            }`}
          >
            DUIMP (Layout 399/717)
          </button>
        </div>

        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-350 mb-3">Identificação da Nota Fiscal</h3>
        <FieldRow fields={SECTION_REQUIRED} header={header} errors={errors} onChange={onChange} />
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-350 mb-3">Processo de Importação</h3>
        <FieldRow fields={sectionNf} header={header} errors={errors} onChange={onChange} />
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-350 mb-3">Entidades</h3>
        <FieldRow fields={SECTION_ENTITIES} header={header} errors={errors} onChange={onChange} />
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-350 mb-3">Informações Adicionais</h3>
        <FieldRow fields={SECTION_OPTIONAL} header={header} errors={errors} onChange={onChange} />
      </div>
    </div>
  );
}
