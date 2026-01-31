import { redirect } from "next/navigation";
import { getSignInUrl, withAuth } from "@workos-inc/authkit-nextjs";

export default async function AuthPage() {
  const { user } = await withAuth();
  
  if (user) {
    redirect("/");
  }
  
  const signInUrl = await getSignInUrl();
  redirect(signInUrl);
}
