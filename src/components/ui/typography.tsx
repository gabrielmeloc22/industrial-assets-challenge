import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { ElementType, forwardRef, HTMLAttributes } from "react";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "font-semibold text-xl",
      h2: "font-semibold text-lg",
      subtitle: "font-regular text-sm",
      body: "font-regular",
    },
    color: {
      foreground: "text-foreground",
      muted: "text-muted",
    },
  },
  defaultVariants: {
    color: "foreground",
    variant: "body",
  },
});

const variantToTag = (value: string): ElementType | undefined => {
  const tagMap: Record<string, ElementType> = {
    h1: "h1",
    h2: "h2",
    subtitle: "p",
    body: "p",
  };

  return tagMap[value];
};

type TypographyProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants>;

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  function Typography({ variant, className, ...props }, ref) {
    const defaultElement = "p";
    const Component = variant
      ? variantToTag(variant) || defaultElement
      : defaultElement;

    return (
      <Component
        ref={ref}
        className={cn(typographyVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
