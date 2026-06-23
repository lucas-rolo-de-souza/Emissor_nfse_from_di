import { ArrowRight, FileText, Eye, PenSquare } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface LandingStepProps {
  onStart: () => void;
  onViewTxt: () => void;
  onCreateFromScratch: () => void;
}

export function LandingStep({ onStart, onViewTxt, onCreateFromScratch }: LandingStepProps) {
  return (
    <Card className="w-full max-w-xl text-center">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground transition-colors duration-350">
          Gerador de{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
            Nota Fiscal
          </span>
        </h1>
        <p className="text-lg text-muted-foreground transition-colors duration-350">
          Integração SIGAEIC — Layout Nota Fiscal de Entrada (TOTVS Protheus)
        </p>
      </div>
 
      <div className="grid grid-cols-1 gap-4 mb-6">
        {/* Primary flow: XML */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-primary/10 dark:to-primary/5 border border-indigo-100/60 dark:border-primary/20 transition-colors duration-350">
          <div className="flex items-start gap-4 text-left mb-4">
            <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-primary dark:to-primary-hover text-white rounded-xl flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground transition-colors duration-350">Importar do XML da DI</h3>
              <p className="text-sm text-muted-foreground mt-0.5 transition-colors duration-350">
                Faça upload do Espelho da DI, revise os dados extraídos automaticamente e gere o TXT.
              </p>
            </div>
          </div>
          <ol className="text-xs text-muted-foreground/80 space-y-1 mb-4 ml-14 transition-colors duration-350">
            <li>1. Upload do XML (Espelho da DI / DUIMP)</li>
            <li>2. Revisão e preenchimento de campos obrigatórios</li>
            <li>3. Geração e download do arquivo TXT</li>
          </ol>
          <Button className="w-full" size="lg" onClick={onStart}>
            Iniciar com XML
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
 
        {/* Secondary flow: Scratch wizard */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/10 border border-violet-100/60 dark:border-violet-900/35 transition-colors duration-350">
          <div className="flex items-start gap-4 text-left mb-4">
            <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 text-white rounded-xl flex items-center justify-center shadow-md">
              <PenSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground transition-colors duration-350">Criar do Zero</h3>
              <p className="text-sm text-muted-foreground mt-0.5 transition-colors duration-350">
                Assistente passo a passo para criar o TXT manualmente, com múltiplas adições e itens.
              </p>
            </div>
          </div>
          <Button
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 dark:from-violet-500 dark:to-purple-500 dark:hover:from-violet-600 dark:hover:to-purple-600 text-white shadow-lg shadow-violet-500/30 dark:shadow-violet-950/30 cursor-pointer"
            size="lg"
            onClick={onCreateFromScratch}
          >
            Assistente de Criação
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      <Button variant="outline" className="w-full" size="md" onClick={onViewTxt}>
        <Eye className="w-4 h-4 mr-2" />
        Visualizar / Auditar TXT Existente
      </Button>
    </Card>
  );
}
