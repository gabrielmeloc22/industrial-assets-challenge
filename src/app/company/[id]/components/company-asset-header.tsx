import { ExclamationCircle } from "@/components/icons/exclamation-circle";
import { Lightning } from "@/components/icons/lightning";
import { Button } from "@/components/ui/button";
import { Stack } from "@/components/ui/stack";
import { Typography } from "@/components/ui/typography";
import { useCompany } from "@/packages/company/context/companyContext";

export function CompanyAssetHeader() {
  const { company } = useCompany();

  return (
    <Stack direction="row" className="items-center gap-2 justify-between">
      <Stack direction="row" className="items-center">
        <Typography variant="h1">Ativos</Typography>
        <Typography variant="subtitle" color="muted">
          / {company?.name}
        </Typography>
      </Stack>
      <Stack direction="row">
        <Button variant="outline" leftIcon={<Lightning variant="primary" />}>
          Crítico
        </Button>
        <Button
          variant="outline"
          leftIcon={<ExclamationCircle variant="primary" />}
        >
          Sensor de energia
        </Button>
      </Stack>
    </Stack>
  );
}
