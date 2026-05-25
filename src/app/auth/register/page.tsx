import { AuthGuestOnly } from "@/components/auth/AuthGuestOnly";
import { AuthRegisterClient } from "@/components/auth/AuthRegisterClient";

export default function AuthRegisterPage() {
  return (
    <AuthGuestOnly>
      <AuthRegisterClient />
    </AuthGuestOnly>
  );
}
