import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const shineButtonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31B0A9]/40 disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        primary:
          "text-white shadow-[0_12px_30px_rgba(49,176,169,0.28)] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(49,176,169,0.34)]",
        outline:
          "border border-[#31B0A9]/30 bg-white text-slate-900 shadow-sm hover:border-[#31B0A9]/60 hover:text-[#0f766e]",
        subtle:
          "bg-slate-100 text-slate-800 hover:bg-slate-200",
        ghost:
          "bg-transparent text-slate-700 hover:bg-[#31B0A9]/10 hover:text-[#0f766e]",
        danger:
          "bg-red-600 text-white shadow-sm hover:bg-red-700",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export const ShineButton = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      bgColor = "linear-gradient(135deg, rgba(49,176,169,1) 0%, rgba(61,199,190,1) 50%, rgba(49,176,169,1) 100%)",
      label,
      children,
      ...props
    },
    ref
  ) => {
    const content = children ?? label;
    const isPrimary = (variant ?? "primary") === "primary";
    const classes = cn(shineButtonVariants({ variant, size }), className);
    const innerContent = (
      <>
        {isPrimary && (
          <>
            <span
              className="absolute inset-0"
              style={{ backgroundImage: bgColor }}
            />
            <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.38)_48%,transparent_76%)] translate-x-[-130%] group-hover:translate-x-[130%] transition-transform duration-700 ease-out" />
          </>
        )}
        <span className="relative z-[1] inline-flex items-center gap-2">
          {content}
        </span>
      </>
    );

    if (asChild) {
      const child = React.Children.only(content);

      return React.cloneElement(child, {
        ...props,
        ref,
        className: cn(classes, child.props.className),
        children: innerContent,
      });
    }

    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      >
        {innerContent}
      </button>
    );
  }
);

ShineButton.displayName = "ShineButton";

export { shineButtonVariants };
