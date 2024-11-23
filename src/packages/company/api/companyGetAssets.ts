import { API_URL } from "@/lib/constants";
import { SuccessResponse } from "@/lib/error";
import { SafeQueryOptions } from "@/lib/reactQuery";
import {
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export type CompanyAsset = {
  id: string;
  name: string;
  parentId: string | null;
  sensorId: string;
  sensorType: string;
  status: string;
  gatewayId: string;
  locationId: string | null;
};

type CompanyGetAssetsArgs = {
  companyId: string;
};

type CompanyGetAssetsResult = SuccessResponse<{
  companyAssets: CompanyAsset[];
}>;

export const companyGetAssets = async (
  args: CompanyGetAssetsArgs
): Promise<CompanyGetAssetsResult> => {
  const response = await fetch(`${API_URL}/companies/${args.companyId}/assets`);

  if (!response.ok) {
    return {
      success: false,
      error: "Failed to fetch company assets",
    };
  }

  const data = (await response.json()) as CompanyAsset[];

  return {
    success: true,
    companyAssets: data,
  };
};

export const COMPANY_GET_ASSETS_QUERY_KEY = "company.get.assets";

export const companyGetAssetsQueryConfig = (args: CompanyGetAssetsArgs) => ({
  queryKey: [COMPANY_GET_ASSETS_QUERY_KEY, args.companyId],
  queryFn: async () => {
    const response = await companyGetAssets(args);

    if (!response.success) {
      return Promise.reject(new Error(response.error));
    }

    return response.companyAssets;
  },
});

export const useCompanyGetAssets = (args: {
  variables: CompanyGetAssetsArgs;
  opts?: SafeQueryOptions<UseSuspenseQueryOptions<CompanyAsset[]>>;
}) => {
  return useSuspenseQuery<CompanyAsset[]>({
    ...args.opts,
    ...companyGetAssetsQueryConfig(args.variables),
  });
};
