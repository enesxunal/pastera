import type { SupabaseClient } from "@supabase/supabase-js";
import { nextBranchDisplayNumber } from "@/lib/branch-display-number";

export async function allocateBranchDisplayNumber(
  svc: SupabaseClient,
  branchId: string,
): Promise<number> {
  const { data } = await svc
    .from("orders")
    .select("display_number")
    .eq("branch_id", branchId)
    .not("display_number", "is", null)
    .order("display_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  return nextBranchDisplayNumber(
    typeof data?.display_number === "number" ? data.display_number : null,
  );
}
