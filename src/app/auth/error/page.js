"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const errorMessages = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access was denied. You may not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication.",
  EmailCreateAccount: "Could not create account with this email.",
  Callback: "There was an error with the callback URL.",
  EmailSignin: "There was an error sending the sign-in email.",
  CredentialsSignin: "Sign in failed. Check your credentials and try again.",
  SessionRequired: "Please sign in to access this page.",
};

function AuthErrorForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Authentication Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">{errorMessage}</p>
              </div>

              <div className="space-y-3">
                <Link href="/auth/signin" className="block">
                  <Button className="w-full" size="lg">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </Link>

                <Link href={callbackUrl} className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                </Link>

                <Link href="/contact" className="block">
                  <Button variant="ghost" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </div>

              {error && (
                <div className="mt-6 p-3 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500">
                    Error Code: <code className="font-mono">{error}</code>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Need Help?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-900 mb-2">
                  Common Solutions
                </h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Clear browser cookies</li>
                  <li>• Try a different browser</li>
                  <li>• Check your internet connection</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-900 mb-2">
                  Still Having Issues?
                </h4>
                <p className="text-gray-600 mb-2">
                  Contact our support team for assistance.
                </p>
                <Link href="/contact">
                  <Button variant="outline" size="sm">
                    Get Help
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorForm />
    </Suspense>
  );
}
