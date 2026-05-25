import { haversineKm, roundKm } from "@/lib/geo";
import { listActiveBranches } from "@/lib/branches-server";
import type { BranchRow } from "@/lib/order-types";

export type NearestBranchResult = {
  branch: BranchRow;
  distanceKm: number;
};

export type DeliveryCheckResult =
  | { ok: true; nearest: NearestBranchResult }
  | {
      ok: false;
      reason: "no_branch_location" | "no_branches" | "out_of_range";
      nearest?: NearestBranchResult;
    };

/** En yakın şubeyi bulur; yarıçap içindeyse ok, değilse mesafe bilgisiyle hata döner. */
export async function checkDeliveryForAddress(
  lat: number,
  lng: number,
): Promise<DeliveryCheckResult> {
  const branches = await listActiveBranches();
  if (!branches.length) {
    return { ok: false, reason: "no_branches" };
  }

  const located = branches.filter((b) => b.lat != null && b.lng != null);
  if (!located.length) {
    return { ok: false, reason: "no_branch_location" };
  }

  let nearest: NearestBranchResult | null = null;

  for (const branch of located) {
    const distanceKm = roundKm(haversineKm(branch.lat!, branch.lng!, lat, lng));
    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = { branch, distanceKm };
    }
  }

  if (!nearest) {
    return { ok: false, reason: "no_branches" };
  }

  const maxKm = Number(nearest.branch.radius_km) || 5;
  if (nearest.distanceKm <= maxKm) {
    return { ok: true, nearest };
  }

  return { ok: false, reason: "out_of_range", nearest };
}

/** Adrese en yakın ve teslimat yarıçapı içindeki şubeyi bulur. */
export async function findNearestDeliveringBranch(
  lat: number,
  lng: number,
): Promise<NearestBranchResult | null> {
  const result = await checkDeliveryForAddress(lat, lng);
  return result.ok ? result.nearest : null;
}
