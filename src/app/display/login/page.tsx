import { DisplayLoginClient } from "@/components/display/DisplayLoginClient";

export default function DisplayLoginPage() {
  const defaultBranchId = process.env.BRANCH_PANEL_BRANCH_ID;
  return <DisplayLoginClient defaultBranchId={defaultBranchId} />;
}
