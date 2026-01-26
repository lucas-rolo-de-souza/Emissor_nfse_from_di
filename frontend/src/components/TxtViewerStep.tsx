import {
  ArrowLeft,
  FileText,
  Upload,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { useCallback, useState } from "react";
import { TxtAuditViewer } from "./TxtAuditViewer";

interface ParsedHeader {
  numero_nota: string;
  cfop: string;
  data_emissao: string;
  data_entrada: string;
  numero_di: string;
  nome_exportador: string;
  valor_total_mercadoria: string;
  valor_total_nota: string;
  valor_frete: string;
  valor_seguro: string;
  qtd_itens: string;
}

interface ParsedItem {
  ncm: string;
  cod_produto: string;
  descricao: string;
  quantidade: string;
  unidade: string;
  valor_mercadoria: string;
  valor_fob: string;
  valor_frete: string;
  valor_seguro: string;
  peso_liquido: string;
  num_adicao: string;
  seq_item: string;
}

interface ParsedData {
  header: ParsedHeader;
  items: ParsedItem[];
  filename: string;
}

interface TxtViewerStepProps {
  onBack: () => void;
}

export function TxtViewerStep({ onBack }: TxtViewerStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [showAudit, setShowAudit] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const [modifiedContent, setModifiedContent] = useState<string | null>(null);

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

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".txt")) {
      setError("Invalid file. Please upload a .txt file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRawContent(null);
    setModifiedContent(null);

    // Read raw content for audit
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRawContent(text);
      setModifiedContent(text);
    };
    reader.readAsText(file);

    try {
      const formData = new FormData();
      formData.append("txt_file", file);

      const response = await fetch("http://localhost:8000/parse-txt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to parse TXT file");
      }

      const data = await response.json();
      setParsedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const handleDownloadModified = () => {
    if (!modifiedContent || !parsedData) return;

    const blob = new Blob([modifiedContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AUDITED_${parsedData.filename}`; // Prefix to indicate audited version
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const formatValue = (value: string | undefined) => {
    if (!value) return "-";
    return value.trim() || "-";
  };

  const formatNumeric = (value: string | undefined) => {
    if (!value) return "-";
    const num = parseFloat(value.trim());
    if (isNaN(num)) return value.trim() || "-";
    return num.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  };

  return (
    <Card className="w-full max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-slate-900">Visualizar TXT</h2>
        </div>

        <div className="flex items-center gap-3">
          {showAudit && modifiedContent && (
            <Button
              onClick={handleDownloadModified}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex gap-2"
            >
              <Upload className="w-4 h-4" />{" "}
              {/* Reuse Icon for now, implies submit/download */}
              Salvar e Baixar
            </Button>
          )}

          {parsedData && rawContent && (
            <button
              onClick={() => setShowAudit(!showAudit)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showAudit ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {showAudit ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showAudit ? "Modo Auditoria" : "Modo Visual"}
            </button>
          )}
        </div>
      </div>

      {!parsedData && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300 hover:border-slate-400"
          } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-500" />
          </div>

          <p className="text-lg font-medium text-slate-700 mb-2">
            {isLoading ? "Processando..." : "Arraste o arquivo TXT aqui"}
          </p>
          <p className="text-sm text-slate-500 mb-4">ou</p>

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
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {parsedData && (
        <>
          {showAudit && modifiedContent ? (
            <TxtAuditViewer
              content={modifiedContent}
              originalContent={rawContent ?? undefined}
              onUpdate={(newVal) => setModifiedContent(newVal)}
            />
          ) : (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Dados da Nota Fiscal
                  </h3>
                  <span className="text-sm text-slate-500">
                    {parsedData.filename}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      Número
                    </label>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatValue(parsedData.header.numero_nota)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      CFOP
                    </label>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatValue(parsedData.header.cfop)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      DI
                    </label>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatValue(parsedData.header.numero_di)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      Data Emissão
                    </label>
                    <p className="text-slate-700">
                      {formatValue(parsedData.header.data_emissao)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      Data Entrada
                    </label>
                    <p className="text-slate-700">
                      {formatValue(parsedData.header.data_entrada)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      Qtd. Itens
                    </label>
                    <p className="text-slate-700">
                      {formatValue(parsedData.header.qtd_itens)}
                    </p>
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      Exportador
                    </label>
                    <p className="text-slate-700">
                      {formatValue(parsedData.header.nome_exportador)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-indigo-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      Total Mercadoria
                    </label>
                    <p className="text-slate-900 font-medium">
                      R${" "}
                      {formatNumeric(parsedData.header.valor_total_mercadoria)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      Total Nota
                    </label>
                    <p className="text-slate-900 font-medium">
                      R$ {formatNumeric(parsedData.header.valor_total_nota)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      Frete
                    </label>
                    <p className="text-slate-700">
                      R$ {formatNumeric(parsedData.header.valor_frete)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      Seguro
                    </label>
                    <p className="text-slate-700">
                      R$ {formatNumeric(parsedData.header.valor_seguro)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Itens ({parsedData.items.length})
                </h3>

                <div className="space-y-2">
                  {parsedData.items.map((item, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(index)}
                        className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <span className="text-sm font-medium text-slate-500">
                            #{index + 1}
                          </span>
                          <span className="font-mono text-sm text-indigo-600">
                            {formatValue(item.ncm)}
                          </span>
                          <span className="text-sm text-slate-700 truncate max-w-md">
                            {formatValue(item.descricao).substring(0, 60)}...
                          </span>
                        </div>
                        {expandedItems.has(index) ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      {expandedItems.has(index) && (
                        <div className="px-4 py-4 bg-white grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase">
                              NCM
                            </label>
                            <p className="font-mono text-slate-900">
                              {formatValue(item.ncm)}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase">
                              Código Interno
                            </label>
                            <p className="font-mono text-slate-900">
                              {formatValue(item.cod_produto)}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase">
                              Quantidade
                            </label>
                            <p className="text-slate-900">
                              {formatNumeric(item.quantidade)} {item.unidade}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase">
                              Peso Líquido
                            </label>
                            <p className="text-slate-900">
                              {formatNumeric(item.peso_liquido)} kg
                            </p>
                          </div>
                          <div className="col-span-2 md:col-span-4">
                            <label className="text-xs font-medium text-slate-500 uppercase">
                              Descrição
                            </label>
                            <p className="text-slate-700 text-sm">
                              {formatValue(item.descricao)}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase">
                              Valor Mercadoria
                            </label>
                            <p className="text-slate-900 font-medium">
                              R$ {formatNumeric(item.valor_mercadoria)}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase">
                              Valor FOB
                            </label>
                            <p className="text-slate-700">
                              R$ {formatNumeric(item.valor_fob)}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase">
                              Frete
                            </label>
                            <p className="text-slate-700">
                              R$ {formatNumeric(item.valor_frete)}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase">
                              Seguro
                            </label>
                            <p className="text-slate-700">
                              R$ {formatNumeric(item.valor_seguro)}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase">
                              Adição
                            </label>
                            <p className="text-slate-700">
                              {formatValue(item.num_adicao)}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase">
                              Seq. Item
                            </label>
                            <p className="text-slate-700">
                              {formatValue(item.seq_item)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reset Button */}
          <div className="pt-4">
            <Button
              onClick={() => {
                setParsedData(null);
                setError(null);
                setRawContent(null);
                setShowAudit(false);
              }}
              variant="outline"
              className="w-full"
            >
              Carregar Outro Arquivo
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
