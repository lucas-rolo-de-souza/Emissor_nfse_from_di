import { useState } from "react";
import { ArrowLeft, ArrowRight, FileDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Stepper } from "./ui/Stepper";
import { StepCapa } from "./wizard/StepCapa";
import { StepAdicoes } from "./wizard/StepAdicoes";
import { StepItens } from "./wizard/StepItens";
import type { ExtractedData, HeaderData, AdicaoData } from "../types";

interface WizardStepProps {
  onGenerate: (data: ExtractedData) => void;
  onBack: () => void;
  isLoading: boolean;
}

type WizardPhase = 0 | 1 | 2 | 3;

const STEPS = [
  { label: "Capa", description: "Dados da nota" },
  { label: "Adições", description: "Impostos e NCM" },
  { label: "Itens", description: "Mercadorias" },
  { label: "Revisar", description: "Confirmar e gerar" },
];

function emptyHeader(): HeaderData {
  return {
    document_type: "DI",
    di_number: "",
    duimp_number: "",
    versao_registro: "",
    di_date: "",
    exporter_name: "",
    exporter_city: "",
    exporter_country: "",
    importer_code: "",
    importer_name: "",
    urf_entry: "",
    transport_via: "",
    provenance_country_code: "",
    valor_total_frete: 0,
    valor_total_seguro: 0,
    total_additions: 0,
    numero_nota: "",
    data_emissao: "",
    data_entrada: "",
    cfop: "",
    numero_po: "",
    perc_reducao: "",
    cod_importador: "",
    cod_transportador: "",
    cod_exportador: "",
    invoice_number: "",
    mv_eic0010_source: "ITEMS",
    aliq_icms_capa: "",
    mv_eic0076_mode: "STANDARD_15",
  };
}

function emptyTax() {
  return { base_calc: 0, rate: 0, rate_reduced: 0, value_due: 0, value_collect: 0, regime_code: "", regime_name: "" };
}

function emptyAdicao(): AdicaoData {
  return {
    number: "001",
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
    taxes: { ii: emptyTax(), ipi: emptyTax(), pis: emptyTax(), cofins: emptyTax(), icms: emptyTax() },
    nves: [],
    items: [],
  };
}

type HeaderErrors = Partial<Record<keyof HeaderData, string>>;

function validateCapa(header: HeaderData): HeaderErrors {
  const errors: HeaderErrors = {};
  if (!header.numero_nota) errors.numero_nota = "Obrigatório";
  if (!header.data_emissao) errors.data_emissao = "Obrigatório";
  if (!header.data_entrada) errors.data_entrada = "Obrigatório";
  if (!header.cfop) errors.cfop = "Obrigatório";
  if (header.document_type === "DUIMP") {
    if (!header.duimp_number) errors.duimp_number = "Obrigatório";
  } else {
    if (!header.di_number) errors.di_number = "Obrigatório";
  }
  return errors;
}

function validateAdicoes(adicoes: AdicaoData[]): string[] {
  if (adicoes.length === 0) return ["Adicione ao menos uma adição."];
  const errs: string[] = [];
  adicoes.forEach((a, i) => {
    if (!a.ncm || a.ncm.replace(/\D/g, "").length < 8)
      errs.push(`Adição ${i + 1}: NCM obrigatório (8 dígitos).`);
  });
  return errs;
}

function validateItens(adicoes: AdicaoData[]): string[] {
  const errs: string[] = [];
  adicoes.forEach((a, ai) => {
    if (a.items.length === 0) errs.push(`Adição ${ai + 1}: adicione ao menos um item.`);
    a.items.forEach((item, ii) => {
      if (!item.internal_code) errs.push(`Adição ${ai + 1} / Item ${ii + 1}: código interno obrigatório.`);
    });
  });
  return errs;
}

export function WizardStep({ onGenerate, onBack, isLoading }: WizardStepProps) {
  const [phase, setPhase] = useState<WizardPhase>(0);
  const [header, setHeader] = useState<HeaderData>(emptyHeader);
  const [adicoes, setAdicoes] = useState<AdicaoData[]>([emptyAdicao()]);
  const [headerErrors, setHeaderErrors] = useState<HeaderErrors>({});
  const [adicaoErrors, setAdicaoErrors] = useState<string[]>([]);
  const [itemErrors, setItemErrors] = useState<string[]>([]);

  const handleHeaderChange = (field: keyof HeaderData, value: string) => {
    setHeader((prev) => ({ ...prev, [field]: value }));
    setHeaderErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const advanceFrom0 = () => {
    const errors = validateCapa(header);
    if (Object.keys(errors).length > 0) { setHeaderErrors(errors); return; }
    setPhase(1);
  };

  const advanceFrom1 = () => {
    const errors = validateAdicoes(adicoes);
    if (errors.length > 0) { setAdicaoErrors(errors); return; }
    setAdicaoErrors([]);
    setPhase(2);
  };

  const advanceFrom2 = () => {
    const errors = validateItens(adicoes);
    if (errors.length > 0) { setItemErrors(errors); return; }
    setItemErrors([]);
    setPhase(3);
  };

  const handleGenerate = () => {
    const data: ExtractedData = {
      header: { ...header, total_additions: adicoes.length },
      adicoes,
    };
    onGenerate(data);
  };

  const goBack = () => {
    if (phase === 0) { onBack(); return; }
    setPhase((p) => (p - 1) as WizardPhase);
  };

  const nextAction = [advanceFrom0, advanceFrom1, advanceFrom2, handleGenerate][phase];

  return (
    <Card className="w-full max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={goBack}
          className="p-2 -ml-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Criar Nota Fiscal</h2>
          <p className="text-sm text-slate-500">Preencha os dados passo a passo</p>
        </div>
      </div>

      <Stepper steps={STEPS} currentStep={phase} className="mb-8" />

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="min-h-[400px]"
        >
          {phase === 0 && (
            <StepCapa header={header} onChange={handleHeaderChange} errors={headerErrors} />
          )}
          {phase === 1 && (
            <div className="space-y-4">
              <StepAdicoes adicoes={adicoes} onChange={setAdicoes} />
              {adicaoErrors.length > 0 && (
                <ul className="text-sm text-red-600 space-y-1">
                  {adicaoErrors.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              )}
            </div>
          )}
          {phase === 2 && (
            <div className="space-y-4">
              <StepItens adicoes={adicoes} onChange={setAdicoes} />
              {itemErrors.length > 0 && (
                <ul className="text-sm text-red-600 space-y-1">
                  {itemErrors.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              )}
            </div>
          )}
          {phase === 3 && (
            <ReviewSummary header={header} adicoes={adicoes} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer navigation */}
      <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between gap-3">
        <Button variant="outline" onClick={goBack} disabled={isLoading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {phase === 0 ? "Cancelar" : "Voltar"}
        </Button>

        <Button
          onClick={nextAction}
          isLoading={isLoading && phase === 3}
          className="flex-1 max-w-xs"
          size="lg"
        >
          {phase === 3 ? (
            <><FileDown className="w-5 h-5 mr-2" />Gerar TXT</>
          ) : (
            <>Próximo<ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </Card>
  );
}

function ReviewSummary({ header, adicoes }: { header: HeaderData; adicoes: AdicaoData[] }) {
  const totalItems = adicoes.reduce((s, a) => s + a.items.length, 0);
  const totalFob = adicoes.reduce((s, a) => s + (a.fob_reais || 0), 0);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-5">
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-3">Resumo da Nota Fiscal</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <SummaryRow label="Número da Nota" value={header.numero_nota} />
          <SummaryRow label="Data de Emissão" value={header.data_emissao} />
          <SummaryRow label="Data de Entrada" value={header.data_entrada} />
          <SummaryRow label="CFOP" value={header.cfop} />
          {header.document_type === "DUIMP" ? (
            <SummaryRow label="Número DUIMP" value={header.duimp_number} />
          ) : (
            <SummaryRow label="Número DI" value={header.di_number} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <StatCard label="Adições" value={String(adicoes.length)} />
        <StatCard label="Itens Total" value={String(totalItems)} />
        <StatCard label="FOB Total (R$)" value={`R$ ${fmt(totalFob)}`} />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">Adições</h3>
        {adicoes.map((a, i) => (
          <div key={i} className="flex items-center justify-between text-sm px-3 py-2 bg-slate-50 rounded border border-slate-100">
            <span className="font-mono font-semibold text-slate-600">#{a.number}</span>
            <span className="text-slate-700">NCM {a.ncm}</span>
            <span className="text-slate-500">{a.items.length} item(s)</span>
            <span className="text-slate-600 font-mono">R$ {fmt(a.fob_reais)}</span>
          </div>
        ))}
      </div>

      <p className="text-sm text-slate-500 text-center">
        Verifique os dados acima e clique em "Gerar TXT" para criar o arquivo de integração.
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-blue-700 font-medium">{label}:</span>
      <span className="text-blue-900 font-semibold">{value || "—"}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
      <span className="block text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="block text-lg font-bold text-slate-900 mt-1">{value}</span>
    </div>
  );
}
