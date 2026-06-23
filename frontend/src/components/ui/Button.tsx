import { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "className"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95";

  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/20 dark:shadow-slate-950/20 transition-all",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-transparent dark:border dark:border-border dark:text-foreground dark:hover:bg-secondary shadow-sm transition-all",
    outline:
      "border-2 border-slate-200 dark:border-border text-slate-700 dark:text-[#CCCCCC] hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-[#FFFFFF] bg-transparent transition-all",
    ghost:
      "text-slate-600 dark:text-[#CCCCCC] hover:bg-slate-100 dark:hover:bg-secondary transition-all",
    danger:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20 dark:shadow-slate-950/20 transition-all",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </motion.button>
  );
}
