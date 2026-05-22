import { useState } from "react";
import { Layout } from "./components/Layout";
import { LandingStep } from "./components/LandingStep";
import { UploadStep } from "./components/UploadStep";
import { ReviewStep } from "./components/ReviewStep";
import { ReportStep } from "./components/ReportStep";
import { TxtViewerStep } from "./components/TxtViewerStep";
import { WizardStep } from "./components/WizardStep";
import { AnimatePresence, motion } from "framer-motion";
import type { ExtractedData } from "./types";

const API_BASE = "http://localhost:8005";

function App() {
  const [step, setStep] = useState<
    "landing" | "upload" | "review" | "report" | "viewer" | "wizard"
  >("landing");
  const [report, setReport] = useState<{
    status: "success" | "error";
    message: string;
    downloadUrl?: string;
    filename?: string;
  } | null>(null);

  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Extract data from XML
  const handleExtract = async () => {
    if (!xmlFile) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("xml_file", xmlFile);

    try {
      const response = await fetch(`${API_BASE}/extract`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedData(data);
        setStep("review");
      } else {
        const err = await response.json();
        setReport({
          status: "error",
          message: err.detail || "Failed to extract data from XML",
        });
        setStep("report");
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Network error during extraction.";
      setReport({ status: "error", message });
      setStep("report");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate TXT from wizard-created data
  const handleGenerateFromWizard = async (data: ExtractedData) => {
    setExtractedData(data);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const contentDisposition = response.headers.get("content-disposition");
        let filename = "nota_fiscal.txt";
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match?.[1]) filename = match[1];
        }
        setReport({ status: "success", message: `Arquivo "${filename}" gerado com sucesso.`, downloadUrl: url, filename });
        setStep("report");
      } else {
        const err = await response.json() as { detail?: { errors?: string[] } | string };
        const msg = typeof err.detail === "object" && err.detail?.errors ? err.detail.errors.join("\n") : String(err.detail || "Erro ao gerar TXT");
        setReport({ status: "error", message: msg });
        setStep("report");
      }
    } catch (e) {
      setReport({ status: "error", message: e instanceof Error ? e.message : "Erro de rede." });
      setStep("report");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate TXT from reviewed data
  const handleGenerate = async () => {
    if (!extractedData) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(extractedData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const contentDisposition = response.headers.get("content-disposition");
        let filename = "nota_fiscal.txt";
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) {
            filename = match[1];
          }
        }
        setReport({
          status: "success",
          message: `File "${filename}" generated successfully and is ready for download.`,
          downloadUrl: url,
          filename: filename,
        });
        setStep("report");
      } else {
        const err = await response.json();
        const errorMessage = err.detail?.errors
          ? err.detail.errors.join("\n")
          : err.detail || "Failed to generate TXT";
        setReport({
          status: "error",
          message: errorMessage,
        });
        setStep("report");
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Network error during generation.";
      setReport({ status: "error", message });
      setStep("report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setStep("landing");
    setReport(null);
    setXmlFile(null);
    setExtractedData(null);
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        {step === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex justify-center"
          >
            <LandingStep
              onStart={() => setStep("upload")}
              onViewTxt={() => setStep("viewer")}
              onCreateFromScratch={() => setStep("wizard")}
            />
          </motion.div>
        )}

        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex justify-center"
          >
            <UploadStep
              onExtract={handleExtract}
              onBack={() => setStep("landing")}
              xmlFile={xmlFile}
              setXmlFile={setXmlFile}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {step === "review" && extractedData && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex justify-center"
          >
            <ReviewStep
              data={extractedData}
              onDataChange={setExtractedData}
              onGenerate={handleGenerate}
              onBack={() => setStep("upload")}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {step === "report" && (
          <motion.div
            key="report"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex justify-center"
          >
            <ReportStep report={report} onRestart={handleRestart} />
          </motion.div>
        )}

        {step === "viewer" && (
          <motion.div
            key="viewer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex justify-center"
          >
            <TxtViewerStep onBack={() => setStep("landing")} />
          </motion.div>
        )}

        {step === "wizard" && (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex justify-center"
          >
            <WizardStep
              onGenerate={handleGenerateFromWizard}
              onBack={() => setStep("landing")}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default App;
