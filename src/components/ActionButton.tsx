import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const actionButtonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.95] disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        primary:
          "text-primary-foreground shadow-[0_12px_40px_-10px_var(--primary)] hover:shadow-[0_20px_50px_-8px_var(--primary)] [background-image:var(--gradient-cta)] hover:brightness-125",
        accent:
          "text-accent-foreground shadow-[0_0_30px_-6px_var(--accent)] hover:shadow-[0_0_50px_-2px_var(--accent)] [background-image:var(--gradient-accent)] hover:brightness-120",
        ghost: "border-2 border-accent/30 bg-transparent text-foreground hover:bg-accent/10 hover:border-accent/60",
        quiet: "text-muted-foreground hover:text-accent transition-colors",
      },
      size: {
        md: "min-h-11",
        lg: "min-h-13 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof actionButtonVariants>;

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(actionButtonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
ActionButton.displayName = "ActionButton";
