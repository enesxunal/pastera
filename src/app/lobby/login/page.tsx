import { LobbyLoginClient } from "@/components/lobby/LobbyLoginClient";

export default function LobbyLoginPage() {
  const defaultBranchId = process.env.BRANCH_PANEL_BRANCH_ID;
  return <LobbyLoginClient defaultBranchId={defaultBranchId} />;
}
