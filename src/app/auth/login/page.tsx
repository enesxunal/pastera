import { AuthGuestOnly } from "@/components/auth/AuthGuestOnly";
import { AuthLoginClient } from "@/components/auth/AuthLoginClient";

export default function AuthLoginPage() {
  return (
    <AuthGuestOnly>
      <AuthLoginClient />
    </AuthGuestOnly>
  );
}
