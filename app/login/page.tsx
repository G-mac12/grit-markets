import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { authConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Log in",
  description:
    "Log in to the Grit Markets dashboard to manage your subscription, license keys and EA downloads.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <section className="mx-auto flex min-h-[100svh] max-w-site flex-col justify-center px-5 pt-20 md:px-10">
      <div className="mx-auto w-full max-w-md">
        <p className="label-micro mb-4">Subscriber access</p>
        <h1 className="font-display text-display-md font-medium">
          Your terminal awaits.
        </h1>
        <p className="mt-4 leading-relaxed text-fg-muted">
          Enter the email you subscribed with and we&apos;ll send a one-time
          sign-in link. No passwords to lose.
        </p>
        <div className="mt-8">
          {authConfigured() ? (
            <LoginForm />
          ) : (
            <div className="panel p-5">
              <p className="text-sm leading-relaxed text-fg-muted">
                Accounts open with the customer dashboard launch. Until then,
                early access is handled by email from the{" "}
                <a href="/pricing" className="text-accent underline">
                  pricing page
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
