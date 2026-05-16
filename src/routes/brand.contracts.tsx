import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ContractList } from "./athlete.contracts";

export const Route = createFileRoute("/brand/contracts")({
  component: () => (
    <RequireAuth roles={["brand"]} requireOnboarding>
      <ContractList role="brand" />
    </RequireAuth>
  ),
});
