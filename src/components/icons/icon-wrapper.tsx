import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { forwardRef, HTMLAttributes, ReactNode } from "react";

const iconWrapperVariants = cva("inline-flex items-center justify-center", {
  variants: {
    size: {
      xs: "size-3",
      sm: "size-4",
      md: "size-6",
      lg: "size-8",
      xl: "size-10",
      auto: "size-auto",
    },
    variant: {
      default: "text-current",
      primary: "text-primary",
      secondary: "text-secondary",
      tertiary: "text-tertiary",
      white: "text-white",
      black: "text-black",
    },
    maintainAspectRatio: {
      true: "aspect-auto",
      false: "w-full",
    },
  },
  defaultVariants: {
    size: "auto",
    variant: "default",
  },
});

export type IconWrapperVariants = VariantProps<typeof iconWrapperVariants>;

type IconWrapperProps = HTMLAttributes<HTMLDivElement> & IconWrapperVariants;

export const IconWrapper = forwardRef<HTMLDivElement, IconWrapperProps>(
  function IconWrapper(
    { className, size, variant, maintainAspectRatio, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          iconWrapperVariants({ size, variant, maintainAspectRatio }),
          className
        )}
        {...props}
      />
    );
  }
);

export const createIcon = (icon: ReactNode) => {
  return forwardRef<HTMLDivElement, IconWrapperProps>(function Icon(
    props,
    ref
  ) {
    return (
      <IconWrapper ref={ref} {...props}>
        {icon}
      </IconWrapper>
    );
  });
};
