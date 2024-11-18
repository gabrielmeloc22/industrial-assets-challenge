import { Logo } from "@/components/layout/logo";
import { Stack } from "@/components/ui/stack";
import { CompanyNavigation } from "./company-navigation";

export function MainHeader() {
  return (
    <Stack
      direction="row"
      as="header"
      className="bg-secondary items-center min-h-12 px-4 justify-between"
    >
      <Logo size="xs" variant="white" />
      <CompanyNavigation />
    </Stack>
  );
}
