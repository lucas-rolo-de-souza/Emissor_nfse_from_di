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
        "relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-8 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
