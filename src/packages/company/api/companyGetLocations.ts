import { API_URL } from "@/lib/constants";
import { SuccessResponse } from "@/lib/error";
import { SafeQueryOptions } from "@/lib/reactQuery";
import {
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export type CompanyLocation = {
  id: string;
  name: string;
  parentId: string | null;
};

type CompanyGetLocationsResult = SuccessResponse<{
  companyLocations: CompanyLocation[];
}>;

type CompanyGetLocationsArgs = {
  companyId: string;
};

export const companyGetLocations = async (
  args: CompanyGetLocationsArgs
): Promise<CompanyGetLocationsResult> => {
  const response = await fetch(
    `${API_URL}/companies/${args.companyId}/locations`
  );

  if (!response.ok) {
    return {
      success: false,
      error: "Failed to fetch company locations",
    };
  }

  const data = (await response.json()) as CompanyLocation[];

  return {
    success: true,
    companyLocations: data,
  };
};

export const COMPANY_GET_LOCATIONS_QUERY_KEY = "company.get.locations";

export const companyGetLocationQueryConfig = (
  args: CompanyGetLocationsArgs
) => ({
  queryKey: [COMPANY_GET_LOCATIONS_QUERY_KEY, args.companyId],
  queryFn: async () => {
    const response = await companyGetLocations(args);

    if (!response.success) {
      return Promise.reject(new Error(response.error));
    }

    return response.companyLocations;
  },
});

export const useCompanyGetLocations = (args: {
  variables: CompanyGetLocationsArgs;
  opts?: SafeQueryOptions<UseSuspenseQueryOptions<CompanyLocation[]>>;
}) => {
  return useSuspenseQuery<CompanyLocation[]>({
    ...args.opts,
    ...companyGetLocationQueryConfig(args.variables),
  });
};
