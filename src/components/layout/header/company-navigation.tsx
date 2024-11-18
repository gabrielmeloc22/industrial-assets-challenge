"use client";

import { useCompanyGetAll } from "@/packages/company/api/companyGetAll";
import { useCompany } from "@/packages/company/context/companyContext";
import Link from "next/link";
import { Gold } from "../../icons/gold";
import { Button } from "../../ui/button";
import { Stack } from "../../ui/stack";
import { withSuspense } from "../../util/with-suspense";

export const CompanyNavigation = withSuspense(function MainHeaderCompanies() {
  const { data } = useCompanyGetAll();

  const { company, setCompany } = useCompany();

  const isCompanyPage = (id: string): boolean => {
    return company?.id === id;
  };

  return (
    <Stack direction="row" className="gap-4">
      {data.map((company) => (
        <Button
          onClick={() => {
            setCompany(company);
          }}
          key={company.id}
          leftIcon={<Gold size="auto" />}
          size="sm"
          variant={isCompanyPage(company.id) ? "default" : "tertiary"}
          asChild
        >
          <Link href={`/company/${company.id}`}>{company.name}</Link>
        </Button>
      ))}
    </Stack>
  );
});
