import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.label}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary bg-card text-primary"
                        : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
 
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 mb-4 transition-all",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
