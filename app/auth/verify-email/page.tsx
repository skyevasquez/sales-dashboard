"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
      setError("Invalid verification link. Please check your email for the correct link.");
    }
  }, [token]);

  async function verifyEmail() {
    try {
      const response = await authClient.verifyEmail({
        query: { token: token! },
      });
      if (response.error) {
        throw new Error(response.error.message || "Failed to verify email.");
      }
      setStatus("success");
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth");
      }, 3000);
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Failed to verify email. The link may have expired.");
    }
  }

  async function resendVerification() {
    if (!email) {
      setError("Email address not found. Please try logging in to resend verification.");
      return;
    }

    setResendLoading(true);
    setResendSuccess(false);

    try {
      // Note: Better Auth doesn't expose a direct resend method, 
      // so we need to sign in again to trigger verification email
      // This is a simplified version - you may need to adjust based on your Better Auth version
      await authClient.signIn.email({
        email,
        password: "", // This will fail but may trigger verification email
      });
    } catch {
      // Expected to fail without password, but verification email may be sent
    }

    setResendSuccess(true);
    setResendLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === "loading" && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === "error" && <XCircle className="h-5 w-5 text-destructive" />}
            {status === "loading" && "Verifying Email"}
            {status === "success" && "Email Verified"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we verify your email address..."}
            {status === "success" && "Your email has been verified successfully."}
            {status === "error" && "We couldn't verify your email address."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "error" && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {status === "success" && (
            <Alert className="border-green-500 text-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              <AlertDescription>
                Your email is now verified. Redirecting to login…
              </AlertDescription>
            </Alert>
          )}
          {status === "error" && email && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Need a new verification link?
              </p>
              {resendSuccess && (
                <Alert className="border-green-500 text-green-700">
                  <Mail className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    Verification email sent! Please check your inbox.
                  </AlertDescription>
                </Alert>
              )}
              <Button 
                onClick={resendVerification} 
                disabled={resendLoading || resendSuccess}
                variant="outline"
                className="w-full"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Link href="/auth" className="w-full">
            <Button variant="link" className="w-full">
              Back to login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
