import { WarenkorbClient } from "@/components/warenkorb/WarenkorbClient";
import { OnlineOrderingPausedClient } from "@/components/ordering/OnlineOrderingPausedClient";
import { isOnlineOrderingEnabled } from "@/lib/online-ordering-enabled";

export default function WarenkorbPage() {
  if (!isOnlineOrderingEnabled()) {
    return <OnlineOrderingPausedClient />;
  }
  return <WarenkorbClient />;
}
