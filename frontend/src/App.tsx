import { useState } from "react";
import { Layout } from "./components/Layout";
import { LandingStep } from "./components/LandingStep";
import { UploadStep } from "./components/UploadStep";
import { ReportStep } from "./components/ReportStep";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const [step, setStep] = useState<"landing" | "upload" | "report">("landing");
  const [report, setReport] = useState<{
    status: "success" | "error";
    message: string;
    downloadUrl?: string;
  } | null>(null);

  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadTemplate = () => {
    window.location.href = "http://localhost:8000/template";
  };

  const handleProcess = async () => {
    if (!xmlFile || !xlsxFile) {
      // This check is now redundant, but we keep it as a safeguard.
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("xml_file", xmlFile);
    formData.append("xlsx_file", xlsxFile);

    try {
      const response = await fetch("http://localhost:8000/process", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const contentDisposition = response.headers.get("content-disposition");
        let filename = "processed_file.txt"; // Default filename
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) {
            filename = match[1];
          }
        }
        setReport({
          status: "success",
          message: `File "${filename}" processed successfully and is ready for download.`,
          downloadUrl: url,
        });
        setStep("report");
      } else {
        const err = await response.json();
        setReport({
          status: "error",
          message: err.detail || "Processing failed",
        });
        setStep("report");
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "An unknown network error occurred.";
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
    setXlsxFile(null);
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
              onDownloadTemplate={handleDownloadTemplate}
              onStart={() => setStep("upload")}
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
              onProcess={handleProcess}
              onBack={() => setStep("landing")}
              xmlFile={xmlFile}
              setXmlFile={setXmlFile}
              xlsxFile={xlsxFile}
              setXlsxFile={setXlsxFile}
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
      </AnimatePresence>
    </Layout>
  );
}

export default App;
