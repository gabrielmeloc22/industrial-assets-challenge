import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { Loading } from "@/components/ui/loading";
import { cn } from "@/lib/utils";
import {
  ButtonHTMLAttributes,
  ElementType,
  forwardRef,
  ReactNode,
} from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-border bg-none hover:bg-muted/10 text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        tertiary: "bg-tertiary text-tertiary-foreground hover:bg-tertiary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        unstyled: "",
      },
      size: {
        sm: "h-6 px-2 py-1",
        md: "h-8 px-4",
      },
      leftIcon: {
        true: "",
        false: "",
      },
      rightIcon: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
    compoundVariants: [
      { leftIcon: true, size: "md", class: "pl-3.5" },

      { rightIcon: true, size: "md", class: "pr-1" },
    ],
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Omit<VariantProps<typeof buttonVariants>, "leftIcon" | "rightIcon"> & {
    asChild?: boolean;
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    as?: ElementType;
  };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      leftIcon,
      rightIcon,
      asChild = false,
      children,
      as = "button",
      ...props
    },
    ref
  ) => {
    const Component = asChild ? Slot : as;

    return (
      <Component
        className={cn(
          leftIcon && "pl-",
          buttonVariants({
            leftIcon: !!leftIcon,
            rightIcon: !!rightIcon,
            variant,
            size,
            className,
          })
        )}
        disabled={props.disabled || loading}
        ref={ref}
        {...props}
      >
        {!loading && leftIcon}
        {loading ? <Loading /> : <Slottable>{children}</Slottable>}
        {!loading && rightIcon}
      </Component>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
