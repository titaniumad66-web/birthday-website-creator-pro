import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

type MotionSectionProps = Omit<HTMLMotionProps<"div">, "initial" | "whileInView"> & {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "section" | "div" | "footer";
};

const ease = [0.16, 1, 0.3, 1] as const;

export default function MotionSection({
  children,
  className,
  delay = 0,
  as = "section",
  ...rest
}: MotionSectionProps) {
  const reduce = useReducedMotion();

  const motionProps = {
    initial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 },
    whileInView: reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15, margin: "0px 0px -8% 0px" } as const,
    transition: { duration: reduce ? 0 : 0.65, delay: reduce ? 0 : delay, ease },
    className: cn(className),
    ...rest,
  };

  if (as === "footer") {
    return <motion.footer {...motionProps}>{children}</motion.footer>;
  }
  if (as === "div") {
    return <motion.div {...motionProps}>{children}</motion.div>;
  }
  return <motion.section {...motionProps}>{children}</motion.section>;
}

