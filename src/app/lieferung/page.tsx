import { DeliveryEntryClient } from "@/components/delivery/DeliveryEntryClient";
import { DeliveryPausedClient } from "@/components/delivery/DeliveryPausedClient";
import { isDeliveryEnabled } from "@/lib/delivery-enabled";

export default function LieferungPage() {
  if (!isDeliveryEnabled()) {
    return <DeliveryPausedClient />;
  }
  return <DeliveryEntryClient />;
}
