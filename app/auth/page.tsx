import { redirect } from "next/navigation";
import { getSignInUrl, withAuth } from "@workos-inc/authkit-nextjs";
import { ensureRuntimeEnv } from "@/lib/runtime-env";

export default async function AuthPage() {
  const { missing } = ensureRuntimeEnv([
    "WORKOS_API_KEY",
    "WORKOS_CLIENT_ID",
    "WORKOS_COOKIE_PASSWORD",
    "WORKOS_REDIRECT_URI",
  ]);

  if (missing.length > 0) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold">Auth configuration error</h1>
        <p className="mt-2 text-muted-foreground">
          The following environment variables are missing on the server:
        </p>
        <ul className="mt-2 list-disc pl-6 text-sm">
          {missing.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Set these in your Hostinger Node.js app environment and redeploy.
        </p>
      </main>
    );
  }

  let user: { id: string } | null = null;
  try {
    ({ user } = await withAuth());
  } catch (error) {
    console.error("AuthKit failed to initialize:", error);
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold">Auth error</h1>
        <p className="mt-2 text-muted-foreground">
          AuthKit failed to initialize. Check server logs and env vars.
        </p>
      </main>
    );
  }
  
  if (user) {
    redirect("/");
  }
  
  try {
    const signInUrl = await getSignInUrl();
    redirect(signInUrl);
  } catch (error) {
    console.error("Failed to generate WorkOS sign-in URL:", error);
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold">Auth error</h1>
        <p className="mt-2 text-muted-foreground">
          Failed to start the WorkOS login flow. Check server logs for details.
        </p>
      </main>
    );
  }
}
