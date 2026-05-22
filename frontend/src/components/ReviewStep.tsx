import { useState, useMemo } from "react";
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
import type { ExtractedData, HeaderData, ItemData } from "../types";
import {
  HEADER_LABELS,
  REQUIRED_HEADER_FIELDS,
  REQUIRED_ITEM_FIELDS,
} from "../types";

interface ReviewStepProps {
  data: ExtractedData;
  onDataChange: (data: ExtractedData) => void;
  onGenerate: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function ReviewStep({
  data,
  onDataChange,
  onGenerate,
  onBack,
  isLoading,
}: ReviewStepProps) {
  const [activeTab, setActiveTab] = useState<"header" | "adicoes">("header");
  const [expandedAdicoes, setExpandedAdicoes] = useState<
    Record<string, boolean>
  >({});

  const toggleAdicao = (idx: number) => {
    setExpandedAdicoes((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    data.adicoes.forEach((_, idx) => {
      all[idx] = true;
    });
    setExpandedAdicoes(all);
  };

  const collapseAll = () => {
    setExpandedAdicoes({});
  };

  // Validation
  const validation = useMemo(() => {
    const headerErrors: string[] = [];
    const itemErrors: { adicaoIdx: number; itemIdx: number; field: string }[] =
      [];

    REQUIRED_HEADER_FIELDS.forEach((field) => {
      // Check for empty string or 0 if it's a number field required to be non-zero (if applicable)
      // For now, strict check on truthy for string fields mainly
      if (!data.header[field]) {
        headerErrors.push(field);
      }
    });

    data.adicoes.forEach((adicao, aIdx) => {
      adicao.items.forEach((item, iIdx) => {
        REQUIRED_ITEM_FIELDS.forEach((field) => {
          if (!item[field]) {
            itemErrors.push({ adicaoIdx: aIdx, itemIdx: iIdx, field });
          }
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
    onDataChange({
      ...data,
      header: { ...data.header, [field]: value },
    });
  };

  const handleItemChange = (
    adicaoIdx: number,
    itemIdx: number,
    field: keyof ItemData,
    value: string,
  ) => {
    const newAdicoes = [...data.adicoes];
    const newItems = [...newAdicoes[adicaoIdx].items];

    newItems[itemIdx] = { ...newItems[itemIdx], [field]: value };
    newAdicoes[adicaoIdx] = { ...newAdicoes[adicaoIdx], items: newItems };

    onDataChange({ ...data, adicoes: newAdicoes });
  };

  const headerFields: (keyof HeaderData)[] = [
    "di_number",
    "di_date",
    "duimp_number", // New Field
    "numero_nota",
    "data_emissao",
    "data_entrada",
    "cfop",
    "numero_po",
    "cod_importador",
    "cod_transportador",
    "cod_exportador",
    "exporter_name",
    "exporter_country",
    "provenance_country_code", // New Field
    "urf_entry", // New Field
    "transport_via", // New Field
  ];

  // Helper to format currency/numbers
  const fmt = (val: number | undefined | null) =>
    (val || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 5,
    });

  return (
    <Card className="w-full max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">
            Revisar Dados da DI
          </h2>
        </div>

        {/* Validation Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            validation.isValid
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {validation.isValid ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Pronto para Gerar
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" />
              {validation.totalErrors} pendência(s)
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab("header")}
          className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
            activeTab === "header"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Capa & Cabeçalho
          {validation.headerErrors.length > 0 && (
            <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
              {validation.headerErrors.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("adicoes")}
          className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
            activeTab === "adicoes"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Adições & Itens ({data.adicoes.length})
          {validation.itemErrors.length > 0 && (
            <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
              {validation.itemErrors.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === "header" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {headerFields.map((field) => {
                const isRequired = REQUIRED_HEADER_FIELDS.includes(field);
                const hasError = validation.headerErrors.includes(field);
                // ReadOnly fields are generally the ones from XML (not user provided)
                // BUT user might want to edit some if extracted wrong.
                // For now, let's keep extracted metadata readonly-ish unless critical?
                // Actually, allowing edit is safer. Just di info is fixed.
                const isReadOnly = [
                  "di_number",
                  "di_date",
                  "exporter_name",
                  "exporter_country",
                ].includes(field);

                return (
                  <div key={field} className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      {HEADER_LABELS[field] ||
                        field
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                    <input
                      type="text"
                      value={
                        (data.header as unknown as Record<string, string>)[
                          field
                        ] || ""
                      }
                      onChange={(e) =>
                        handleHeaderChange(field, e.target.value)
                      }
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
                        hasError
                          ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                          : isReadOnly
                            ? "border-slate-200 bg-slate-50 text-slate-500"
                            : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                      placeholder={isRequired ? "Obrigatório" : "Opcional"}
                    />
                  </div>
                );
              })}
            </div>

            {/* Totals Summary */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Totais Extraídos
              </h3>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="block text-slate-500 text-xs uppercase tracking-wider">
                    Frete Total
                  </span>
                  <span className="font-mono">
                    {fmt(data.header.valor_total_frete)}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500 text-xs uppercase tracking-wider">
                    Seguro Total
                  </span>
                  <span className="font-mono">
                    {fmt(data.header.valor_total_seguro)}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500 text-xs uppercase tracking-wider">
                    Qtd Adições
                  </span>
                  <span className="font-mono">
                    {data.header.total_additions}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "adicoes" && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2 text-sm">
              <button
                onClick={expandAll}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Expandir Tudo
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={collapseAll}
                className="text-slate-500 hover:text-slate-700 hover:underline"
              >
                Recolher Tudo
              </button>
            </div>

            {data.adicoes.map((adicao, adicaoIdx) => {
              const isExpanded = expandedAdicoes[adicaoIdx];
              const adicaoErrors = validation.itemErrors.filter(
                (e) => e.adicaoIdx === adicaoIdx,
              ).length;

              return (
                <div
                  key={adicaoIdx}
                  className={`border rounded-lg overflow-hidden transition-all ${adicaoErrors > 0 ? "border-amber-200" : "border-slate-200"}`}
                >
                  {/* Adicao Header */}
                  <div
                    className={`px-4 py-3 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors ${adicaoErrors > 0 ? "bg-amber-50" : ""}`}
                    onClick={() => toggleAdicao(adicaoIdx)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-semibold bg-white border px-2 py-0.5 rounded text-slate-600">
                        #{adicao.number}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">
                          NCM {adicao.ncm}
                        </span>
                        <span className="text-xs text-slate-500">
                          {adicao.items.length} item(s) • LI:{" "}
                          {adicao.li_number || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {adicaoErrors > 0 && (
                        <span className="flex items-center gap-1 text-xs text-amber-700 font-medium bg-amber-100 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          {adicaoErrors} erro(s)
                        </span>
                      )}
                      <div className="text-right hidden sm:block">
                        <span className="block text-xs text-slate-500">
                          Valor Total (R$)
                        </span>
                        <span className="font-mono text-sm">
                          {fmt(adicao.fob_reais)}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Adicao Body */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-200 animate-in slide-in-from-top-2 duration-200">
                      {/* General Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Logistics & Incoterm */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b pb-1">
                            Logística & Incoterm
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="block text-slate-400 text-xs">
                                Exportador
                              </span>
                              <span
                                className="text-slate-800 font-medium truncate block"
                                title={adicao.supplier?.name}
                              >
                                {adicao.supplier?.name || "N/A"}
                              </span>
                              <span className="text-slate-500 text-xs truncate block">
                                {adicao.supplier?.city},{" "}
                                {adicao.supplier?.country_name}
                              </span>
                            </div>
                            <div>
                              <span className="block text-slate-400 text-xs">
                                Incoterm
                              </span>
                              <span className="text-slate-800 font-medium">
                                {adicao.incoterm?.term || "-"} -{" "}
                                {adicao.incoterm?.local}
                              </span>
                            </div>
                            <div>
                              <span className="block text-slate-400 text-xs">
                                País Origem
                              </span>
                              <span className="text-slate-800">
                                {adicao.logistics?.origin_country_name || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-slate-400 text-xs">
                                Peso Líquido
                              </span>
                              <span className="text-slate-800">
                                {fmt(adicao.net_weight)} kg
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Values Summary */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b pb-1">
                            Valores da Adição
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="block text-slate-400 text-xs">
                                FOB (Moeda)
                              </span>
                              <span className="text-slate-800 font-medium">
                                {fmt(adicao.fob_currency)}
                              </span>
                            </div>
                            <div>
                              <span className="block text-slate-400 text-xs">
                                FOB (R$)
                              </span>
                              <span className="text-slate-800 font-medium">
                                {fmt(adicao.fob_reais)}
                                {fmt(adicao.fob_reais)}
                              </span>
                            </div>
                            <div>
                              <span className="block text-slate-400 text-xs">
                                Valor ICMS Total
                              </span>
                              <span className="text-slate-800 font-medium">
                                {fmt(adicao.taxes.icms?.value_due)}
                              </span>
                            </div>
                            <div>
                              <span className="block text-slate-400 text-xs">
                                Frete (R$)
                              </span>
                              <span className="text-slate-800">
                                {fmt(adicao.freight_reais)}
                              </span>
                            </div>
                            <div>
                              <span className="block text-slate-400 text-xs">
                                Seguro (R$)
                              </span>
                              <span className="text-slate-800">
                                {fmt(adicao.insurance_reais)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Taxes Table */}
                      <div className="mb-6">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b pb-1 mb-2">
                          Detalhamento de Impostos
                        </h4>
                        <div className="overflow-x-auto border rounded-md">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                              <tr>
                                <th className="px-3 py-2">Imposto</th>
                                <th className="px-3 py-2 text-right">
                                  Base Cálculo
                                </th>
                                <th className="px-3 py-2 text-right">
                                  Aliq. (%)
                                </th>
                                <th className="px-3 py-2 text-right">
                                  Aliq. Red. (%)
                                </th>
                                <th className="px-3 py-2 text-right">
                                  Valor Devido
                                </th>
                                <th className="px-3 py-2 text-right">
                                  Valor A Recolher
                                </th>
                                <th className="px-3 py-2">Regime</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {Object.entries({
                                II: adicao.taxes.ii,
                                IPI: adicao.taxes.ipi,
                                PIS: adicao.taxes.pis,
                                COFINS: adicao.taxes.cofins,
                                ICMS: adicao.taxes.icms, // Add ICMS to table
                              }).map(([label, tax]) => (
                                <tr key={label}>
                                  <td className="px-3 py-2 font-semibold bg-slate-50/50">
                                    {label}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-500">
                                    {fmt(tax?.base_calc)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono">
                                    {fmt(tax?.rate)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-500">
                                    {fmt(tax?.rate_reduced)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono font-medium">
                                    {fmt(tax?.value_due)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono font-medium text-slate-900 bg-slate-50/30">
                                    {fmt(tax?.value_collect)}
                                  </td>
                                  <td
                                    className="px-3 py-2 truncate max-w-[150px]"
                                    title={tax?.regime_name || ""}
                                  >
                                    {tax?.regime_name || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* NVEs if present */}
                      {adicao.nves && adicao.nves.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b pb-1 mb-2">
                            NVEs
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {adicao.nves.map((nve, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs border border-blue-100"
                              >
                                {nve.level}: {nve.attr} - {nve.spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Items Table */}
                      <div className="overflow-x-auto rounded-md border border-slate-200 mt-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 p-2 bg-slate-50 border-b">
                          Mercadorias
                        </h4>
                        <table className="w-full text-sm">
                          <thead className="bg-white text-xs uppercase text-slate-500 font-medium border-b">
                            <tr>
                              <th className="px-3 py-2 text-left w-12">Seq</th>
                              <th className="px-3 py-2 text-left">Descrição</th>
                              <th className="px-3 py-2 text-left w-24">
                                Invoice
                              </th>
                              <th className="px-3 py-2 text-right w-24">Qtd</th>
                              <th className="px-3 py-2 text-left w-20">
                                Unid.
                              </th>
                              <th className="px-3 py-2 text-right w-28">
                                Valor Un.
                              </th>
                              <th className="px-3 py-2 text-left w-32">
                                Cód. Interno *
                              </th>
                              <th className="px-3 py-2 text-left w-24">CFOP</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {adicao.items.map((item, itemIdx) => {
                              const hasError = validation.itemErrors.some(
                                (e) =>
                                  e.adicaoIdx === adicaoIdx &&
                                  e.itemIdx === itemIdx &&
                                  e.field === "internal_code",
                              );

                              return (
                                <tr
                                  key={itemIdx}
                                  className="hover:bg-slate-50/50"
                                >
                                  <td className="px-3 py-2 text-slate-400 font-mono text-xs text-center">
                                    {item.sequence}
                                  </td>
                                  <td
                                    className="px-3 py-2 min-w-[200px] whitespace-normal"
                                    title={item.description}
                                  >
                                    {item.description}
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={item.invoice_number || ""}
                                      onChange={(e) =>
                                        handleItemChange(
                                          adicaoIdx,
                                          itemIdx,
                                          "invoice_number",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                                      placeholder="Invoice..."
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono">
                                    {fmt(item.qty)}
                                  </td>
                                  <td className="px-3 py-2 text-slate-500 text-xs">
                                    {item.unit}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-600">
                                    {fmt(item.unit_value)}
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={item.internal_code || ""}
                                      onChange={(e) =>
                                        handleItemChange(
                                          adicaoIdx,
                                          itemIdx,
                                          "internal_code",
                                          e.target.value,
                                        )
                                      }
                                      className={`w-full px-2 py-1 rounded border text-xs ${
                                        hasError
                                          ? "border-red-300 bg-red-50"
                                          : "border-slate-300 focus:border-blue-500"
                                      } focus:outline-none`}
                                      placeholder="Código..."
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={item.cfop || ""}
                                      onChange={(e) =>
                                        handleItemChange(
                                          adicaoIdx,
                                          itemIdx,
                                          "cfop",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs focus:border-blue-500 focus:outline-none placeholder-slate-300"
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
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
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
