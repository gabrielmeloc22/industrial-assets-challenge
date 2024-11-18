import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, VariantProps } from "class-variance-authority";
import { ElementType, HTMLAttributes } from "react";

const stackVariants = cva("", {
  variants: {
    direction: {
      row: "flex-row",
      col: "flex-col",
    },
    display: {
      grid: "grid",
      flex: "flex",
    },
  },
  defaultVariants: {
    direction: "col",
    display: "flex",
  },
});

type StackProps = HTMLAttributes<HTMLOrSVGElement> &
  VariantProps<typeof stackVariants> & {
    as?: ElementType;
    asChild?: boolean;
  };

export function Stack({
  direction,
  display,
  className,
  children,
  as = "div",
  asChild,
  ...props
}: StackProps) {
  const Component = asChild ? Slot : as;

  return (
    <Component
      className={cn(stackVariants({ direction, display }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}
