import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { AdicaoData, DetailedTax, TaxBreakdown } from "@/types";

interface StepAdicoesProps {
  adicoes: AdicaoData[];
  onChange: (adicoes: AdicaoData[]) => void;
}

function emptyTax(): DetailedTax {
  return { base_calc: 0, rate: 0, rate_reduced: 0, value_due: 0, value_collect: 0, regime_code: "", regime_name: "" };
}

function emptyTaxBreakdown(): TaxBreakdown {
  return { ii: emptyTax(), ipi: emptyTax(), pis: emptyTax(), cofins: emptyTax(), icms: emptyTax() };
}

function emptyAdicao(number: string): AdicaoData {
  return {
    number,
    ncm: "",
    li_number: "",
    codigo_li: "",
    codigo_li_substitutiva: "",
    net_weight: 0,
    gross_weight: 0,
    fob_currency: 0,
    fob_reais: 0,
    freight_reais: 0,
    insurance_reais: 0,
    supplier: { name: "", address: "", number: "", complement: "", city: "", state: "", country_name: "" },
    incoterm: { term: "", local: "", method_val_code: "", method_val_name: "" },
    logistics: { origin_country_code: "", origin_country_name: "", acquisition_country_code: "", acquisition_country_name: "" },
    taxes: emptyTaxBreakdown(),
    nves: [],
    items: [],
  };
}

type TaxKey = keyof TaxBreakdown;
type TaxField = "rate" | "base_calc" | "value_due" | "value_collect";

const TAX_ROWS: { key: TaxKey; label: string; valueField: TaxField }[] = [
  { key: "ii", label: "II", valueField: "value_due" },
  { key: "ipi", label: "IPI", valueField: "value_due" },
  { key: "pis", label: "PIS", valueField: "value_collect" },
  { key: "cofins", label: "COFINS", valueField: "value_collect" },
  { key: "icms", label: "ICMS", valueField: "value_collect" },
];

function NumInput({ value, onChange, placeholder }: { value: number; onChange: (v: number) => void; placeholder?: string }) {
  return (
    <Input
      type="number"
      step="any"
      value={value || ""}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      placeholder={placeholder || "0.00"}
      className="h-7 text-xs"
    />
  );
}

function AdicaoForm({
  adicao,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  adicao: AdicaoData;
  index: number;
  onUpdate: (updated: AdicaoData) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const update = (patch: Partial<AdicaoData>) => onUpdate({ ...adicao, ...patch });

  const updateTax = (taxKey: TaxKey, field: keyof DetailedTax, value: number) => {
    onUpdate({
      ...adicao,
      taxes: {
        ...adicao.taxes,
        [taxKey]: { ...adicao.taxes[taxKey], [field]: value },
      },
    });
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold bg-slate-100 border px-2 py-0.5 rounded">
          Adição #{adicao.number}
        </span>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
            aria-label="Remover adição"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label required>NCM (8 dígitos)</Label>
          <Input
            value={adicao.ncm}
            onChange={(e) => update({ ncm: e.target.value })}
            placeholder="Ex: 73181500"
            maxLength={10}
          />
        </div>
        <div className="space-y-1">
          <Label>Nº Licença (LI)</Label>
          <Input
            value={adicao.li_number || ""}
            onChange={(e) => update({ li_number: e.target.value })}
            placeholder="PLI / Licença"
          />
        </div>
        <div className="space-y-1">
          <Label>Cód. da LI (Siscomex)</Label>
          <Input
            value={adicao.codigo_li || ""}
            onChange={(e) => update({ codigo_li: e.target.value })}
            placeholder="Registro LI"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label>Peso Líq. (kg)</Label>
          <NumInput value={adicao.net_weight} onChange={(v) => update({ net_weight: v })} />
        </div>
        <div className="space-y-1">
          <Label>FOB (R$)</Label>
          <NumInput value={adicao.fob_reais} onChange={(v) => update({ fob_reais: v })} />
        </div>
        <div className="space-y-1">
          <Label>Frete (R$)</Label>
          <NumInput value={adicao.freight_reais} onChange={(v) => update({ freight_reais: v })} />
        </div>
        <div className="space-y-1">
          <Label>Seguro (R$)</Label>
          <NumInput value={adicao.insurance_reais} onChange={(v) => update({ insurance_reais: v })} />
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Impostos (Alíquota % / Valor R$)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500">
                <th className="text-left py-1 w-16">Imposto</th>
                <th className="text-center py-1 w-24">Alíq. (%)</th>
                <th className="text-center py-1 w-24">Base (R$)</th>
                <th className="text-center py-1 w-24">Valor (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TAX_ROWS.map(({ key, label, valueField }) => (
                <tr key={key}>
                  <td className="py-1 font-semibold text-slate-600 pr-2">{label}</td>
                  <td className="py-1 px-1">
                    <NumInput
                      value={adicao.taxes[key].rate}
                      onChange={(v) => updateTax(key, "rate", v)}
                      placeholder="0.00"
                    />
                  </td>
                  <td className="py-1 px-1">
                    <NumInput
                      value={adicao.taxes[key].base_calc}
                      onChange={(v) => updateTax(key, "base_calc", v)}
                    />
                  </td>
                  <td className="py-1 px-1">
                    <NumInput
                      value={adicao.taxes[key][valueField] as number}
                      onChange={(v) => updateTax(key, valueField, v)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Exportador (Nome)</Label>
          <Input
            value={adicao.supplier.name || ""}
            onChange={(e) => update({ supplier: { ...adicao.supplier, name: e.target.value } })}
            placeholder="Razão social"
          />
        </div>
        <div className="space-y-1">
          <Label>País de Origem</Label>
          <Input
            value={adicao.logistics.origin_country_name || ""}
            onChange={(e) => update({ logistics: { ...adicao.logistics, origin_country_name: e.target.value } })}
            placeholder="Ex: CHINA"
          />
        </div>
      </div>
    </div>
  );
}

export function StepAdicoes({ adicoes, onChange }: StepAdicoesProps) {
  const addAdicao = () => {
    const next = String(adicoes.length + 1).padStart(3, "0");
    onChange([...adicoes, emptyAdicao(next)]);
  };

  const removeAdicao = (idx: number) => {
    onChange(adicoes.filter((_, i) => i !== idx));
  };

  const updateAdicao = (idx: number, updated: AdicaoData) => {
    onChange(adicoes.map((a, i) => (i === idx ? updated : a)));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Adicione as adições da Declaração de Importação. Cada adição corresponde a um NCM diferente.
      </p>

      {adicoes.map((adicao, idx) => (
        <div key={idx}>
          <AdicaoForm
            adicao={adicao}
            index={idx}
            onUpdate={(u) => updateAdicao(idx, u)}
            onRemove={() => removeAdicao(idx)}
            canRemove={adicoes.length > 1}
          />
        </div>
      ))}

      <Separator />

      <Button variant="outline" onClick={addAdicao} className="w-full gap-2">
        <Plus className="w-4 h-4" />
        Adicionar Adição
      </Button>
    </div>
  );
}
