import Link from "next/link";
import { RISK_WARNING, SITE } from "@/lib/site";

const FOOTER_LINKS = [
  { href: "/start-here", label: "Start here" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
  { href: "/changelog", label: "Changelog" },
];

const LEGAL_LINKS = [
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/refunds", label: "Refunds & Cancellation" },
  { href: "/legal/risk", label: "Risk Disclosure" },
];

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-site px-5 py-14 md:px-10">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight">
              Grit Markets<span className="text-accent-bright">.</span>
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/70">
              {SITE.description}
            </p>
            <p className="mt-4 font-mono text-xs text-paper/50">
              {SITE.companyName} · Company {SITE.companyNumber} · Registered in
              Scotland
            </p>
            <p className="mt-1 font-mono text-xs text-paper/50">
              {/* [OWNER INPUT: confirm support email] */}
              <a
                href={`mailto:${SITE.supportEmail}`}
                className="hover:text-accent-bright"
              >
                {SITE.supportEmail}
              </a>
            </p>
          </div>

          <nav aria-label="Site">
            <p className="label-micro mb-4 text-paper/40">Site</p>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-paper/70 transition-colors hover:text-accent-bright"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <p className="label-micro mb-4 text-paper/40">Legal</p>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-paper/70 transition-colors hover:text-accent-bright"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border border-paper/20 p-5">
          <p className="label-micro mb-2 text-accent-bright">Risk warning</p>
          <p className="text-sm leading-relaxed text-paper/70">{RISK_WARNING}</p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-paper/15 pt-5">
          <p className="font-mono text-micro uppercase tracking-[0.14em] text-paper/40">
            {SITE.metadataStrip} — PAPER / COBALT — © {new Date().getFullYear()}{" "}
            {SITE.companyName}
          </p>
          <p className="font-mono text-micro uppercase tracking-[0.14em] text-paper/40">
            gritmarkets.com
          </p>
        </div>
      </div>
    </footer>
  );
}
