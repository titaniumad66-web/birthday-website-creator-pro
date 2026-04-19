import React from "react";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

interface SmoothButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    | "onDrag"
    | "onDragStart"
    | "onDragEnd"
    | "onAnimationStart"
    | "onAnimationIteration"
    | "onAnimationEnd"
  > {
  variant?: "primary" | "secondary" | "outline";
  children: React.ReactNode;
  className?: string;
  onDrag?: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => void;
}

const SmoothButton: React.FC<SmoothButtonProps> = ({
  variant = "primary",
  children,
  className,
  onDrag,
  ...props
}) => {
  const reduceMotion = useReducedMotion();
  const variants = {
    primary:
      "bg-primary text-primary-foreground shadow-[0_6px_28px_-6px_rgba(255,107,157,0.42)] hover:bg-[#e85a8a] hover:shadow-[0_14px_40px_-8px_rgba(255,107,157,0.38)]",
    secondary:
      "border border-border/80 bg-white/90 text-foreground shadow-sm backdrop-blur-sm hover:border-primary/25 hover:bg-white hover:shadow-[0_12px_36px_-10px_rgba(255,107,157,0.18)]",
    outline:
      "border border-border bg-transparent text-foreground hover:border-primary/35 hover:bg-accent/50",
  };

  return (
    <motion.button
      whileHover={
        reduceMotion ? undefined : { scale: 1.03, y: -1 }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      className={cn(
        "group relative inline-flex min-h-[44px] items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-3.5 font-semibold transition-[box-shadow,background-color,border-color] duration-300",
        variants[variant],
        className,
      )}
      onDrag={onDrag}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent opacity-0 transition duration-700 ease-out group-hover:translate-x-full group-hover:opacity-100",
          variant === "primary" && "via-white/25",
          variant === "secondary" && "via-primary/10",
          variant === "outline" && "via-primary/5",
        )}
        aria-hidden
      />

      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};

export default SmoothButton;
