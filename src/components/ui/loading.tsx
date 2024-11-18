import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { IconWrapper, IconWrapperVariants } from "../icons/icon-wrapper";

type LoadingProps = IconWrapperVariants & {
  className?: string;
  layout?: boolean;
};

export function Loading({ layout = false, className, ...props }: LoadingProps) {
  const renderSpinner = () => {
    return (
      <IconWrapper className={cn("animate-spin", className)} {...props}>
        <LoaderCircle />
      </IconWrapper>
    );
  };

  if (layout) {
    return (
      <div
        className={cn("flex size-full items-center justify-center", className)}
      >
        {renderSpinner()}
      </div>
    );
  }

  return renderSpinner();
}
