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
      <label className="block text-sm font-medium text-slate-700 mb-2">
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
              "relative group cursor-pointer flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed transition-all duration-200",
              isDragOver
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400",
              error && "!border-red-500 !bg-red-50"
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
                  "w-8 h-8 mb-2 transition-colors",
                  isDragOver
                    ? "text-indigo-500"
                    : "text-slate-400 group-hover:text-slate-500",
                  error && "!text-red-500"
                )}
              />
              <p
                className={cn(
                  "mb-1 text-sm text-slate-500 font-medium",
                  error && "!text-red-600"
                )}
              >
                <span
                  className={cn(
                    "font-semibold text-indigo-600",
                    error && "!text-red-600"
                  )}
                >
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              {description && (
                <p className="text-xs text-slate-400">{description}</p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            key="file-preview"
            className="relative flex items-center p-4 rounded-xl border border-indigo-100 bg-indigo-50/50"
          >
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="ml-4 flex-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {value.name}
                </p>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs text-slate-500">
                {(value.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              onClick={() => onChange(null)}
              className="ml-2 p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
