import { useMemo } from "react";
import {
  ArrowLeft,
  FileDown,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./ui/collapsible";
import { Separator } from "./ui/separator";
import type { ExtractedData, HeaderData, AdicaoData, ItemData } from "../types";
import {
  HEADER_LABELS,
  REQUIRED_HEADER_FIELDS,
  REQUIRED_ITEM_FIELDS,
} from "../types";
import { useState } from "react";

interface ReviewStepProps {
  data: ExtractedData;
  onDataChange: (data: ExtractedData) => void;
  onGenerate: () => void;
  onBack: () => void;
  isLoading: boolean;
}

type HeaderSection = {
  title: string;
  fields: (keyof HeaderData)[];
  readOnly?: (keyof HeaderData)[];
};

const HEADER_SECTIONS: HeaderSection[] = [
  {
    title: "Identificação da Nota Fiscal",
    fields: ["numero_nota", "data_emissao", "data_entrada", "cfop"],
  },
  {
    title: "Dados da DI / DUIMP",
    fields: ["di_number", "di_date", "duimp_number"],
    readOnly: ["di_number", "di_date"],
  },
  {
    title: "Entidades",
    fields: ["exporter_name", "exporter_country", "cod_importador", "cod_transportador", "cod_exportador"],
    readOnly: ["exporter_name", "exporter_country"],
  },
  {
    title: "Informações Adicionais",
    fields: ["numero_po", "invoice_number", "provenance_country_code", "urf_entry", "transport_via"],
  },
];

const fmt = (val: number | undefined | null) =>
  (val || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  });

function FieldGroup({
  section,
  data,
  errors,
  onChange,
}: {
  section: HeaderSection;
  data: ExtractedData["header"];
  errors: string[];
  onChange: (field: keyof HeaderData, value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{section.title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {section.fields.map((field) => {
          const isRequired = REQUIRED_HEADER_FIELDS.includes(field);
          const isReadOnly = section.readOnly?.includes(field) ?? false;
          const hasError = errors.includes(field);
          const label = HEADER_LABELS[field] || field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

          return (
            <div key={field} className="space-y-1">
              <Label required={isRequired}>{label.replace(" *", "")}</Label>
              <Input
                value={(data as unknown as Record<string, string>)[field] || ""}
                onChange={(e) => onChange(field, e.target.value)}
                readOnly={isReadOnly}
                error={hasError}
                placeholder={isRequired ? "Obrigatório" : "Opcional"}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ReviewStep({ data, onDataChange, onGenerate, onBack, isLoading }: ReviewStepProps) {
  const [openAdicoes, setOpenAdicoes] = useState<Record<number, boolean>>({});

  const toggleAdicao = (idx: number) => {
    setOpenAdicoes((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const validation = useMemo(() => {
    const headerErrors: string[] = [];
    const itemErrors: { adicaoIdx: number; itemIdx: number; field: string }[] = [];

    REQUIRED_HEADER_FIELDS.forEach((field) => {
      if (!data.header[field]) headerErrors.push(field);
    });

    data.adicoes.forEach((adicao, aIdx) => {
      adicao.items.forEach((item, iIdx) => {
        REQUIRED_ITEM_FIELDS.forEach((field) => {
          if (!item[field]) itemErrors.push({ adicaoIdx: aIdx, itemIdx: iIdx, field });
        });
      });
    });

    return {
      headerErrors,
      itemErrors,
      isValid: headerErrors.length === 0 && itemErrors.length === 0,
      totalErrors: headerErrors.length + itemErrors.length,
    };
  }, [data]);

  const handleHeaderChange = (field: keyof HeaderData, value: string) => {
    onDataChange({ ...data, header: { ...data.header, [field]: value } });
  };

  const handleItemChange = (adicaoIdx: number, itemIdx: number, field: keyof ItemData, value: string) => {
    const newAdicoes = data.adicoes.map((a, ai) => {
      if (ai !== adicaoIdx) return a;
      return {
        ...a,
        items: a.items.map((item, ii) =>
          ii === itemIdx ? { ...item, [field]: value } : item,
        ),
      };
    });
    onDataChange({ ...data, adicoes: newAdicoes });
  };

  return (
    <Card className="w-full max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Revisar Dados da DI</h2>
        </div>

        <Badge variant={validation.isValid ? "success" : "warning"} className="gap-1.5 px-3 py-1.5 text-sm">
          {validation.isValid ? (
            <><CheckCircle className="w-4 h-4" /> Pronto para Gerar</>
          ) : (
            <><AlertCircle className="w-4 h-4" /> {validation.totalErrors} pendência(s)</>
          )}
        </Badge>
      </div>

      <Tabs defaultValue="header">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="header" className="flex-1 gap-1.5">
            Capa & Cabeçalho
            {validation.headerErrors.length > 0 && (
              <Badge variant="warning" className="text-xs px-1.5 py-0">{validation.headerErrors.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="adicoes" className="flex-1 gap-1.5">
            Adições & Itens ({data.adicoes.length})
            {validation.itemErrors.length > 0 && (
              <Badge variant="warning" className="text-xs px-1.5 py-0">{validation.itemErrors.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="header" className="space-y-6">
          {HEADER_SECTIONS.map((section, i) => (
            <div key={section.title}>
              <FieldGroup
                section={section}
                data={data.header}
                errors={validation.headerErrors}
                onChange={handleHeaderChange}
              />
              {i < HEADER_SECTIONS.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Totais Extraídos
            </h3>
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <span className="block text-slate-500 text-xs uppercase tracking-wider">Frete Total</span>
                <span className="font-mono">{fmt(data.header.valor_total_frete)}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs uppercase tracking-wider">Seguro Total</span>
                <span className="font-mono">{fmt(data.header.valor_total_seguro)}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs uppercase tracking-wider">Qtd Adições</span>
                <span className="font-mono">{data.header.total_additions}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="adicoes" className="space-y-3">
          <div className="flex justify-end gap-2 text-sm">
            <button
              onClick={() => {
                const all: Record<number, boolean> = {};
                data.adicoes.forEach((_, i) => { all[i] = true; });
                setOpenAdicoes(all);
              }}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Expandir Tudo
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setOpenAdicoes({})}
              className="text-slate-500 hover:text-slate-700 hover:underline"
            >
              Recolher Tudo
            </button>
          </div>

          {data.adicoes.map((adicao, adicaoIdx) => {
            const adicaoErrors = validation.itemErrors.filter((e) => e.adicaoIdx === adicaoIdx).length;
            const isOpen = openAdicoes[adicaoIdx] ?? false;

            return (
              <Collapsible key={adicaoIdx} open={isOpen} onOpenChange={() => toggleAdicao(adicaoIdx)}>
                <div className={`border rounded-lg overflow-hidden ${adicaoErrors > 0 ? "border-amber-200" : "border-slate-200"}`}>
                  <CollapsibleTrigger asChild>
                    <div
                      className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${adicaoErrors > 0 ? "bg-amber-50" : "bg-slate-50"}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-sm font-semibold bg-white border px-2 py-0.5 rounded text-slate-600">
                          #{adicao.number}
                        </span>
                        <div>
                          <span className="text-sm font-medium text-slate-900">NCM {adicao.ncm}</span>
                          <span className="text-xs text-slate-500 block">
                            {adicao.items.length} item(s) • LI: {adicao.li_number || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {adicaoErrors > 0 && (
                          <Badge variant="warning" className="gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {adicaoErrors} erro(s)
                          </Badge>
                        )}
                        <span className="text-right hidden sm:block">
                          <span className="block text-xs text-slate-500">FOB (R$)</span>
                          <span className="font-mono text-sm">{fmt(adicao.fob_reais)}</span>
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="p-4 border-t border-slate-200">
                      <AdicaoDetail
                        adicao={adicao}
                        adicaoIdx={adicaoIdx}
                        itemErrors={validation.itemErrors}
                        onItemChange={handleItemChange}
                      />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </TabsContent>
      </Tabs>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <Button
          onClick={onGenerate}
          disabled={!validation.isValid || isLoading}
          isLoading={isLoading}
          className="w-full"
          size="lg"
        >
          <FileDown className="w-5 h-5 mr-2" />
          Gerar Arquivo TXT
        </Button>
      </div>
    </Card>
  );
}

function AdicaoDetail({
  adicao,
  adicaoIdx,
  itemErrors,
  onItemChange,
}: {
  adicao: AdicaoData;
  adicaoIdx: number;
  itemErrors: { adicaoIdx: number; itemIdx: number; field: string }[];
  onItemChange: (adicaoIdx: number, itemIdx: number, field: keyof ItemData, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Logística & Incoterm</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoItem label="Exportador" value={adicao.supplier?.name} />
            <InfoItem label="Incoterm" value={`${adicao.incoterm?.term || "-"} ${adicao.incoterm?.local || ""}`} />
            <InfoItem label="País Origem" value={adicao.logistics?.origin_country_name} />
            <InfoItem label="Peso Líquido" value={`${fmt(adicao.net_weight)} kg`} />
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Valores da Adição</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoItem label="FOB (Moeda)" value={fmt(adicao.fob_currency)} />
            <InfoItem label="FOB (R$)" value={fmt(adicao.fob_reais)} />
            <InfoItem label="Frete (R$)" value={fmt(adicao.freight_reais)} />
            <InfoItem label="Seguro (R$)" value={fmt(adicao.insurance_reais)} />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Detalhamento de Impostos</h4>
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                {["Imposto", "Base Cálculo", "Aliq. (%)", "Aliq. Red. (%)", "Valor Devido", "Valor A Recolher", "Regime"].map(
                  (h) => <th key={h} className="px-3 py-2 whitespace-nowrap">{h}</th>,
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(Object.entries({ II: adicao.taxes.ii, IPI: adicao.taxes.ipi, PIS: adicao.taxes.pis, COFINS: adicao.taxes.cofins, ICMS: adicao.taxes.icms }) as [string, typeof adicao.taxes.ii][]).map(
                ([label, tax]) => (
                  <tr key={label}>
                    <td className="px-3 py-2 font-semibold bg-slate-50/50">{label}</td>
                    <td className="px-3 py-2 font-mono text-slate-500">{fmt(tax?.base_calc)}</td>
                    <td className="px-3 py-2 font-mono">{fmt(tax?.rate)}</td>
                    <td className="px-3 py-2 font-mono text-slate-500">{fmt(tax?.rate_reduced)}</td>
                    <td className="px-3 py-2 font-mono font-medium">{fmt(tax?.value_due)}</td>
                    <td className="px-3 py-2 font-mono font-medium bg-slate-50/30">{fmt(tax?.value_collect)}</td>
                    <td className="px-3 py-2 truncate max-w-[150px]" title={tax?.regime_name || ""}>{tax?.regime_name || "-"}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>

      {adicao.nves?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">NVEs</h4>
          <div className="flex flex-wrap gap-2">
            {adicao.nves.map((nve, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {nve.level}: {nve.attr} - {nve.spec}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator />

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Mercadorias</h4>
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-white text-xs uppercase text-slate-500 font-medium border-b">
              <tr>
                <th className="px-3 py-2 text-left w-12">Seq</th>
                <th className="px-3 py-2 text-left">Descrição</th>
                <th className="px-3 py-2 text-left w-28">Invoice</th>
                <th className="px-3 py-2 text-right w-24">Qtd</th>
                <th className="px-3 py-2 text-left w-16">Unid.</th>
                <th className="px-3 py-2 text-right w-28">Valor Un.</th>
                <th className="px-3 py-2 text-left w-36">Cód. Interno *</th>
                <th className="px-3 py-2 text-left w-24">CFOP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adicao.items.map((item, itemIdx) => {
                const hasCodeError = itemErrors.some(
                  (e) => e.adicaoIdx === adicaoIdx && e.itemIdx === itemIdx && e.field === "internal_code",
                );
                return (
                  <tr key={itemIdx} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2 text-slate-400 font-mono text-xs text-center">{item.sequence}</td>
                    <td className="px-3 py-2 min-w-[180px] whitespace-normal text-xs">{item.description}</td>
                    <td className="px-3 py-2">
                      <Input
                        value={item.invoice_number || ""}
                        onChange={(e) => onItemChange(adicaoIdx, itemIdx, "invoice_number", e.target.value)}
                        className="h-7 text-xs"
                        placeholder="Invoice..."
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">{fmt(item.qty)}</td>
                    <td className="px-3 py-2 text-slate-500 text-xs">{item.unit}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs">{fmt(item.unit_value)}</td>
                    <td className="px-3 py-2">
                      <Input
                        value={item.internal_code || ""}
                        onChange={(e) => onItemChange(adicaoIdx, itemIdx, "internal_code", e.target.value)}
                        error={hasCodeError}
                        className="h-7 text-xs"
                        placeholder="Código..."
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        value={item.cfop || ""}
                        onChange={(e) => onItemChange(adicaoIdx, itemIdx, "cfop", e.target.value)}
                        className="h-7 text-xs"
                        placeholder="Opcional"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <span className="block text-slate-400 text-xs">{label}</span>
      <span className="text-slate-800 font-medium text-sm truncate block" title={String(value ?? "")}>
        {value || "—"}
      </span>
    </div>
  );
}
