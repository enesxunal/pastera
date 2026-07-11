import { PickupEntryClient } from "@/components/pickup/PickupEntryClient";
import { OnlineOrderingPausedClient } from "@/components/ordering/OnlineOrderingPausedClient";
import { isOnlineOrderingEnabled } from "@/lib/online-ordering-enabled";

export default function AbholungPage() {
  if (!isOnlineOrderingEnabled()) {
    return <OnlineOrderingPausedClient />;
  }
  return <PickupEntryClient />;
}
