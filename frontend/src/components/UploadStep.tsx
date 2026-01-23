import { useState } from "react";
import { ArrowLeft, Rocket } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { FileInput } from "./ui/FileInput";

interface UploadStepProps {
  onProcess: () => void;
  onBack: () => void;
  xmlFile: File | null;
  setXmlFile: (file: File | null) => void;
  xlsxFile: File | null;
  setXlsxFile: (file: File | null) => void;
  isLoading: boolean;
}

export function UploadStep({
  onProcess,
  onBack,
  xmlFile,
  setXmlFile,
  xlsxFile,
  setXlsxFile,
  isLoading,
}: UploadStepProps) {
  const [xmlError, setXmlError] = useState<string | undefined>();
  const [xlsxError, setXlsxError] = useState<string | undefined>();

  const handleXmlFileChange = (file: File | null) => {
    setXmlFile(file);
    if (file && !file.name.endsWith(".xml")) {
      setXmlError("Invalid file type. Please upload an XML file.");
    } else if (file && file.size === 0) {
      setXmlError("File cannot be empty.");
    } else {
      setXmlError(undefined);
    }
  };

  const handleXlsxFileChange = (file: File | null) => {
    setXlsxFile(file);
    if (file && !file.name.endsWith(".xlsx")) {
      setXlsxError("Invalid file type. Please upload an XLSX file.");
    } else if (file && file.size === 0) {
      setXlsxError("File cannot be empty.");
    } else {
      setXlsxError(undefined);
    }
  };

  const canProcess = !!xmlFile && !!xlsxFile && !xmlError && !xlsxError;

  return (
    <Card className="w-full max-w-lg">
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Upload Files</h2>
      </div>

      <div className="space-y-6">
        <FileInput
          label="DI XML File"
          accept=".xml"
          value={xmlFile}
          onChange={handleXmlFileChange}
          error={xmlError}
          description="Upload the XML file for the 'Declaração de Importação'."
        />

        <FileInput
          label="Filled Model XLSX"
          accept=".xlsx"
          value={xlsxFile}
          onChange={handleXlsxFileChange}
          error={xlsxError}
          description="Upload the XLSX mapping file with NCM, Internal Code, and CFOP."
        />

        <div className="pt-4">
          <Button
            onClick={onProcess}
            disabled={!canProcess || isLoading}
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Processar Arquivos
          </Button>
        </div>
      </div>
    </Card>
  );
}
