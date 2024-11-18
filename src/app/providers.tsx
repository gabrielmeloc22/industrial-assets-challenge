"use client";

import { getQueryClient } from "@/lib/reactQuery";
import { CompanyProvider } from "@/packages/company/context/companyContext";
import { QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <CompanyProvider>{children}</CompanyProvider>
    </QueryClientProvider>
  );
}
