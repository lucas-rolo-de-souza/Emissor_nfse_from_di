import { CheckCircle, XCircle, RefreshCw, Download } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface ReportStepProps {
  report: {
    status: "success" | "error";
    message: string;
    downloadUrl?: string;
    filename?: string;
    warnings?: string[];
  } | null;
  onRestart: () => void;
}

export function ReportStep({ report, onRestart }: ReportStepProps) {
  const isSuccess = report?.status === "success";
  const hasDownloadedRef = useRef<string | null>(null);

  // Auto-download when URL is available
  useEffect(() => {
    if (
      report?.downloadUrl &&
      hasDownloadedRef.current !== report.downloadUrl
    ) {
      hasDownloadedRef.current = report.downloadUrl;
      const link = document.createElement("a");
      link.href = report.downloadUrl;
      link.download = report.filename || "nota_fiscal.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [report?.downloadUrl, report?.filename]);

  const handleManualDownload = () => {
    if (report?.downloadUrl) {
      const link = document.createElement("a");
      link.href = report.downloadUrl;
      link.download = report.filename || "nota_fiscal.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full max-w-lg text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="mb-6 flex justify-center"
      >
        {isSuccess ? (
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/20">
            <CheckCircle className="w-10 h-10" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-destructive/10 dark:bg-destructive/20 flex items-center justify-center text-destructive shadow-lg shadow-destructive/20">
            <XCircle className="w-10 h-10" />
          </div>
        )}
      </motion.div>

      <h2 className="text-2xl font-bold text-foreground mb-2">
        {isSuccess ? "Processamento Concluído!" : "Falha no Processamento"}
      </h2>

      <p className="text-muted-foreground mb-8 px-4">
        {report?.message || "Ocorreu um erro desconhecido."}
      </p>

      {isSuccess && report?.warnings && report.warnings.length > 0 && (
        <div
          role="alert"
          className="mb-6 mx-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-left text-sm text-amber-800 dark:text-amber-300"
        >
          <p className="font-semibold mb-1">Atenção: verifique antes de enviar</p>
          <ul className="list-disc pl-5 space-y-1">
            {report.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-2 space-y-3">
        {isSuccess && report?.downloadUrl && (
          <Button
            onClick={handleManualDownload}
            variant="primary"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Arquivo TXT
          </Button>
        )}

        <Button
          onClick={onRestart}
          variant={
            isSuccess && report?.downloadUrl
              ? "outline"
              : isSuccess
                ? "primary"
                : "secondary"
          }
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Recomeçar
        </Button>
      </div>
    </Card>
  );
}
