import { cn } from "@/lib/utils";
import { ComponentProps, forwardRef, ReactNode } from "react";

type InputProps = ComponentProps<"input"> & {
  rightIcon?: ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, rightIcon, ...props }, ref) => {
    return (
      <fieldset className="flex justify-between">
        <input
          type={type}
          className={cn(
            "flex flex-grow h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-base ring-offset-background placeholder:muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && rightIcon}
      </fieldset>
    );
  }
);
Input.displayName = "Input";

export { Input };
