import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { motion } from "framer-motion";

interface ReportStepProps {
  report: {
    status: "success" | "error";
    message: string;
    downloadUrl?: string;
  } | null;
  onRestart: () => void;
}

export function ReportStep({ report, onRestart }: ReportStepProps) {
  const isSuccess = report?.status === "success";

  return (
    <Card className="w-full max-w-lg text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="mb-6 flex justify-center"
      >
        {isSuccess ? (
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-lg shadow-green-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-lg shadow-red-500/20">
            <XCircle className="w-10 h-10" />
          </div>
        )}
      </motion.div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        {isSuccess ? "Processamento Concluído!" : "Falha no Processamento"}
      </h2>

      <p className="text-slate-600 mb-8 px-4">
        {report?.message || "Ocorreu um erro desconhecido."}
      </p>

      <div className="pt-2">
        <Button
          onClick={onRestart}
          variant={isSuccess ? "primary" : "secondary"}
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Recomeçar
        </Button>
      </div>
    </Card>
  );
}
