import { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 dark:bg-card/50 p-8 shadow-xl dark:shadow-slate-950/40 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl dark:hover:shadow-indigo-950/20",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-slate-800/10 dark:to-slate-800/0 pointer-events-none transition-opacity duration-300" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
