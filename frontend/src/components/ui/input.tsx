import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md border border-border dark:border-input bg-background dark:bg-input-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors",
        "placeholder:text-slate-400 dark:placeholder:text-[#989898]",
        "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25",
        "disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:text-slate-400 dark:disabled:text-slate-600",
        "read-only:bg-slate-50 dark:read-only:bg-slate-950 read-only:text-slate-500 dark:read-only:text-slate-400",
        error && "border-red-300 dark:border-destructive bg-red-50 dark:bg-destructive/10 focus:border-red-500 dark:focus:border-destructive focus:ring-red-500/20 dark:focus:ring-destructive/20",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
