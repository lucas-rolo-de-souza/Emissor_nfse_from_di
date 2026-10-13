import { ArrowLeft, FileText, Upload, Code, AlignLeft, ChevronDown } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { useCallback, useMemo, useRef, useState } from "react";
import { AuditDashboard } from "./audit/AuditDashboard";
import { AuditSummaryBar } from "./audit/AuditSummaryBar";
import {
  detectLayoutVersion,
  convertLinesToLayout,
  type LayoutVersion,
} from "../lib/fieldSchema";

interface TxtViewerStepProps {
  onBack: () => void;
}

export function TxtViewerStep({ onBack }: TxtViewerStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [modifiedContent, setModifiedContent] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [globalShowRaw, setGlobalShowRaw] = useState(false);
  const [detectedLayout, setDetectedLayout] = useState<LayoutVersion>("v3_DUIMP");
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(
    () => (modifiedContent ? modifiedContent.split(/\r\n|\n|\r/) : []),
    [modifiedContent],
  );

  // Header "Quantidade de Itens" (pos. 73-74) must equal the number of item lines
  const itemCountWarning = useMemo(() => {
    const header = lines.find((l) => l.startsWith("1"));
    if (!header) return null;
    const declared = parseInt(header.slice(72, 74), 10);
    const actual = lines.filter((l) => l.startsWith("2")).length;
    if (Number.isNaN(declared) || declared === actual) return null;
    return `O cabeçalho declara ${declared} itens, mas o arquivo contém ${actual} linhas de item. Algum item pode ter ficado de fora.`;
  }, [lines]);

  const defaultExportLayout = useMemo(() => {
    return detectedLayout === "v3_DI" ? "v3_DI" : "v3_DUIMP";
  }, [detectedLayout]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [],
  );

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".txt")) {
      setError("Arquivo inválido. Por favor, envie um arquivo .txt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFilename(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const splitLines = text.split(/\r\n|\n|\r/);
      const layout = detectLayoutVersion(splitLines);
      setDetectedLayout(layout);
      setRawContent(text);
      setModifiedContent(text);
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError("Erro ao ler o arquivo.");
      setIsLoading(false);
    };
    reader.readAsText(file, "latin1");
  };

  const triggerDownload = (content: string, suffix: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=latin1" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AUDITADO_${suffix}_${filename}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setShowDownloadMenu(false);
  };

  const handleDownload = (targetLayout: LayoutVersion) => {
    if (!modifiedContent) return;
    const converted = convertLinesToLayout(modifiedContent, targetLayout);
    triggerDownload(converted, targetLayout);
  };

  const handleReset = () => {
    setRawContent(null);
    setModifiedContent(null);
    setFilename("");
    setError(null);
    setGlobalShowRaw(false);
    setShowDownloadMenu(false);
  };

  const hasFile = rawContent !== null && modifiedContent !== null;

  return (
    <Card className="w-full max-w-6xl">
      {/* Header bar */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Auditar TXT</h2>
        </div>

        {hasFile && (
          <div className="flex items-center gap-2">
            {/* Global raw/friendly toggle */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden text-sm">
              <button
                onClick={() => setGlobalShowRaw(false)}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                  !globalShowRaw
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                Amigável
              </button>
              <button
                onClick={() => setGlobalShowRaw(true)}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                  globalShowRaw
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Raw
              </button>
            </div>

            {/* Download split button */}
            <div className="relative" ref={downloadMenuRef}>
              <div className="flex rounded-lg overflow-hidden border border-emerald-600">
                <button
                  onClick={() => handleDownload(defaultExportLayout)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Salvar como {defaultExportLayout === "v3_DUIMP" ? "DUIMP" : "DI"}
                </button>
                <button
                  onClick={() => setShowDownloadMenu((v) => !v)}
                  className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-l border-emerald-500 transition-colors"
                  aria-label="Mais opções de download"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {showDownloadMenu && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg shadow-lg z-10 overflow-hidden">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800">
                    Formato de Exportação
                  </div>
                  <button
                    onClick={() => handleDownload("v3_DUIMP")}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300 block">DUIMP (Layout 399/717)</span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500">Último padrão DUIMP (CRLF)</span>
                  </button>
                  <button
                    onClick={() => handleDownload("v3_DI")}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300 block">DI (Layout 380/717)</span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500">Último padrão DI (CRLF)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload zone */}
      {!hasFile && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
              : "border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-650"
          } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            {isLoading ? "Processando..." : "Arraste o arquivo TXT aqui"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-450 mb-4">ou</p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Selecionar Arquivo</span>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-750 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Audit view */}
      {hasFile && (
        <div className="space-y-4">
          {itemCountWarning && (
            <div
              role="alert"
              className="p-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300"
            >
              {itemCountWarning}
            </div>
          )}
          <AuditSummaryBar
            lines={lines}
            filename={filename}
            detectedLayout={detectedLayout}
            modifiedLines={modifiedContent !== rawContent ? lines : undefined}
          />

          <AuditDashboard
            content={modifiedContent!}
            originalContent={rawContent ?? undefined}
            onUpdate={setModifiedContent}
            globalShowRaw={globalShowRaw}
            detectedLayout={detectedLayout}
          />

          <Button onClick={handleReset} variant="outline" className="w-full mt-2">
            Carregar Outro Arquivo
          </Button>
        </div>
      )}
    </Card>
  );
}
