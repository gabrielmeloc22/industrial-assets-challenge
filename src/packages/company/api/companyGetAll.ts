import { API_URL } from "@/lib/constants";
import { SuccessResponse } from "@/lib/error";
import { SafeQueryOptions } from "@/lib/reactQuery";
import {
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export type Company = {
  id: string;
  name: string;
};

type CompanyGetAllResult = SuccessResponse<{ companies: Company[] }>;

export const companyGetAll = async (): Promise<CompanyGetAllResult> => {
  const response = await fetch(`${API_URL}/companies`);

  if (!response.ok) {
    return {
      success: false,
      error: "Failed to fetch companies",
    };
  }

  const data = (await response.json()) as Company[];

  return {
    success: true,
    companies: data,
  };
};

export const COMPANY_GET_ALL_QUERY_KEY = "company.get.all";

export const companyGetAllQueryConfig = () => ({
  queryKey: [COMPANY_GET_ALL_QUERY_KEY],
  queryFn: async () => {
    const response = await companyGetAll();

    if (!response.success) {
      return Promise.reject(new Error(response.error));
    }

    return response.companies;
  },
});

export const useCompanyGetAll = (
  opts?: SafeQueryOptions<UseSuspenseQueryOptions<Company[]>>
) => {
  return useSuspenseQuery<Company[]>({
    ...opts,
    ...companyGetAllQueryConfig(),
  });
};
