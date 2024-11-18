import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type PageProps = HTMLAttributes<HTMLDivElement>;

export function Page({ className, ...props }: PageProps) {
  return (
    <main
      className={cn("grid bg-background flex-grow", className)}
      {...props}
    />
  );
}
