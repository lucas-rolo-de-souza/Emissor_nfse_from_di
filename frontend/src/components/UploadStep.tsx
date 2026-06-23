import { ArrowLeft, FileSearch } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { FileInput } from "./ui/FileInput";
import { useState } from "react";

interface UploadStepProps {
  onExtract: () => void;
  onBack: () => void;
  xmlFile: File | null;
  setXmlFile: (file: File | null) => void;
  isLoading: boolean;
}

export function UploadStep({
  onExtract,
  onBack,
  xmlFile,
  setXmlFile,
  isLoading,
}: UploadStepProps) {
  const [xmlError, setXmlError] = useState<string | undefined>();

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

  const canExtract = !!xmlFile && !xmlError;

  return (
    <Card className="w-full max-w-lg">
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-secondary transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-foreground transition-colors duration-300">Upload DI XML</h2>
      </div>

      <div className="space-y-6">
        <FileInput
          label="DI XML File"
          accept=".xml"
          value={xmlFile}
          onChange={handleXmlFileChange}
          error={xmlError}
          description="Upload the XML file from the 'Espelho da DI' (Declaração de Importação)."
        />

        <p className="text-sm text-muted-foreground transition-colors duration-300">
          After extracting the data, you'll be able to review and fill in
          additional information before generating the TXT file.
        </p>

        <div className="pt-4">
          <Button
            onClick={onExtract}
            disabled={!canExtract || isLoading}
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            <FileSearch className="w-5 h-5 mr-2" />
            Extrair Dados
          </Button>
        </div>
      </div>
    </Card>
  );
}
