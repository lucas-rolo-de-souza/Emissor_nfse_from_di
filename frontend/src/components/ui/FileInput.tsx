import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FileInputProps {
  label: string;
  accept: string;
  value: File | null;
  onChange: (file: File | null) => void;
  description?: string;
  error?: string;
}

export function FileInput({
  label,
  accept,
  value,
  onChange,
  description,
  error,
}: FileInputProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      onChange(files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      onChange(files[0]);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-2 transition-colors duration-300">
        {label}
      </label>
 
      <AnimatePresence mode="wait">
        {!value ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            key="upload-zone"
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative group cursor-pointer flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed transition-all duration-300",
              isDragOver
                ? "border-primary bg-primary/10"
                : "border-border bg-card/40 dark:bg-input-background/30 hover:bg-slate-100/50 dark:hover:bg-input-background/60 hover:border-primary/50 dark:hover:border-primary/50",
              error && "!border-destructive !bg-destructive/5 dark:!bg-destructive/10"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleChange}
              className="hidden"
              aria-label={label}
            />
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud
                className={cn(
                  "w-8 h-8 mb-2 transition-colors duration-300",
                  isDragOver
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary/70",
                  error && "!text-destructive"
                )}
              />
              <p
                className={cn(
                  "mb-1 text-sm text-muted-foreground font-medium transition-colors duration-300",
                  error && "!text-destructive"
                )}
              >
                <span
                  className={cn(
                    "font-semibold text-primary",
                    error && "!text-destructive"
                  )}
                >
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              {description && (
                <p className="text-xs text-muted-foreground/80 transition-colors duration-300">{description}</p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            key="file-preview"
            className="relative flex items-center p-4 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 transition-colors duration-300"
          >
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/20 dark:bg-primary/25 flex items-center justify-center transition-colors duration-300">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="ml-4 flex-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate transition-colors duration-300">
                  {value.name}
                </p>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xs text-muted-foreground transition-colors duration-300">
                {(value.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              onClick={() => onChange(null)}
              className="ml-2 p-1.5 rounded-full text-muted-foreground hover:text-destructive dark:hover:text-destructive hover:bg-destructive/10 transition-all duration-300 cursor-pointer"
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <p className="mt-2 text-sm text-destructive font-medium transition-colors duration-300">{error}</p>
      )}
    </div>
  );
}
