import { isServer, QueryClient } from "@tanstack/react-query";

const createQueryClient = (): QueryClient => {
  return new QueryClient({ defaultOptions: {} });
};

let queryClient: QueryClient | undefined = undefined;

export const getQueryClient = (): QueryClient => {
  if (isServer) {
    return createQueryClient();
  }
  if (!queryClient) {
    return (queryClient = createQueryClient());
  }

  return queryClient;
};

export type SafeQueryOptions<T> = Omit<T, "fetchFn" | "queryKey">;
