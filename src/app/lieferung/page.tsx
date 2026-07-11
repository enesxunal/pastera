import { DeliveryEntryClient } from "@/components/delivery/DeliveryEntryClient";
import { DeliveryPausedClient } from "@/components/delivery/DeliveryPausedClient";
import { OnlineOrderingPausedClient } from "@/components/ordering/OnlineOrderingPausedClient";
import { isDeliveryEnabled } from "@/lib/delivery-enabled";
import { isOnlineOrderingEnabled } from "@/lib/online-ordering-enabled";

export default function LieferungPage() {
  if (!isOnlineOrderingEnabled()) {
    return <OnlineOrderingPausedClient />;
  }
  if (!isDeliveryEnabled()) {
    return <DeliveryPausedClient />;
  }
  return <DeliveryEntryClient />;
}
