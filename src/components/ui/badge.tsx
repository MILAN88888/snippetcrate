import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        blue: "border-transparent bg-sky-100 text-sky-700",
        purple: "border-transparent bg-violet-100 text-violet-700",
        yellow: "border-transparent bg-amber-100 text-amber-800 font-mono",
        orange: "border-transparent bg-orange-100 text-orange-700",
        green: "border-transparent bg-emerald-100 text-emerald-700",
        gray: "border-transparent bg-muted text-muted-foreground",
        cyan: "border-transparent bg-cyan-100 text-cyan-700"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
