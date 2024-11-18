"use client";

import { Page } from "@/components/layout/page";
import { Card, CardContent } from "@/components/ui/card";
import { Stack } from "@/components/ui/stack";
import { useParams } from "next/navigation";
import { CompanyAssetHeader } from "./components/company-asset-header";
import { CompanyAssetPreview } from "./components/company-asset-preview";
import { CompanyAssetTree } from "./components/company-asset-tree";

function CompanyPage() {
  const params = useParams();

  return (
    <Page className="p-2">
      <Card>
        <CardContent className="flex flex-col gap-2">
          <CompanyAssetHeader />
          <Stack className="w-full grid-cols-2 gap-4" display="grid">
            <CompanyAssetTree companyId={params.id as string} />
            <CompanyAssetPreview />
          </Stack>
        </CardContent>
      </Card>
    </Page>
  );
}

export default CompanyPage;
