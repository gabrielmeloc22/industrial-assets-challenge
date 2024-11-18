"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { Company, useCompanyGetAll } from "../api/companyGetAll";
import { useParams, usePathname, useRouter } from "next/navigation";

type CompanyContextData = {
  company: Company | null;
  setCompany: Dispatch<SetStateAction<Company | null>>;
};

const initialContextData: CompanyContextData = {
  company: null,
  setCompany: () => {},
};

const companyContext = createContext<CompanyContextData>(initialContextData);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null);

  const { data } = useCompanyGetAll({ staleTime: Infinity });

  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  useEffect(() => {
    const defaultCompanyId = pathname.startsWith("/company/")
      ? (params.id as string)
      : data[0].id;
    const defaultCompany = data.find(
      (company) => company.id === defaultCompanyId
    );

    if (!defaultCompany) {
      return;
    }

    setCompany(defaultCompany);
    router.replace(`/company/${defaultCompany.id}`);
  }, []);

  return (
    <companyContext.Provider value={{ company, setCompany }}>
      {children}
    </companyContext.Provider>
  );
}

export const useCompany = () => {
  return useContext(companyContext);
};
