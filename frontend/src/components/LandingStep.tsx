import { ArrowRight, FileText, Eye } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface LandingStepProps {
  onStart: () => void;
  onViewTxt: () => void;
}

export function LandingStep({ onStart, onViewTxt }: LandingStepProps) {
  return (
    <Card className="w-full max-w-xl text-center">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Gerador de{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
            Nota Fiscal
          </span>
        </h1>
        <p className="text-lg text-slate-600">
          Converta o Espelho da DI em arquivo TXT para importação.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <FileText className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Como Funciona
        </h3>

        <ol className="text-sm text-slate-600 text-left space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span>Faça upload do arquivo XML (Espelho da DI)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <span>
              Revise os dados extraídos e preencha as informações adicionais
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <span>Gere o arquivo TXT para importação no sistema fiscal</span>
          </li>
        </ol>

        <div className="space-y-3">
          <Button className="w-full" size="lg" onClick={onStart}>
            Iniciar
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button
            className="w-full"
            size="lg"
            variant="outline"
            onClick={onViewTxt}
          >
            <Eye className="w-5 h-5 mr-2" />
            Visualizar TXT Existente
          </Button>
        </div>
      </div>
    </Card>
  );
}
