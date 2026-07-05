import NavMenu from "@/components/NavMenu";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AuthNav() {
  const user = await getCurrentUser();
  return <NavMenu user={user} />;
}
