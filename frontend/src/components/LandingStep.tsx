import { ArrowRight, Download } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface LandingStepProps {
  onDownloadTemplate: () => void;
  onStart: () => void;
}

export function LandingStep({ onDownloadTemplate, onStart }: LandingStepProps) {
  return (
    <Card className="w-full max-w-2xl text-center">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Gerador de{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
            NFSE
          </span>
        </h1>
        <p className="text-lg text-slate-600">
          Automate your Import Declaration to Nota Fiscal conversion with
          AI-powered precision.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center hover:bg-slate-100 transition-colors">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            1. Get the Template
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Download the Excel template to prepare your data.
          </p>
          <Button
            variant="secondary"
            className="w-full mt-auto"
            onClick={onDownloadTemplate}
          >
            Baixar Modelo XLSX
          </Button>
        </div>

        <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col items-center text-center hover:bg-indigo-50 transition-colors">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <ArrowRight className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            2. Start Processing
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Upload your DI XML and filled Excel file.
          </p>
          <Button className="w-full mt-auto" onClick={onStart}>
            Iniciar Processamento
          </Button>
        </div>
      </div>
    </Card>
  );
}
