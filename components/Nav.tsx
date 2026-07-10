"use client";

import Link from "next/link";
import { useState } from "react";
import { CharLink } from "./CharLink";

const NAV_ITEMS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/faq", label: "FAQ" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-sm">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-site items-center justify-between px-5 py-4 md:px-10"
      >
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-ink transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Grit&nbsp;Markets<span className="text-accent">.</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <CharLink
              key={item.href}
              href={item.href}
              text={item.label}
              className="font-mono text-xs uppercase tracking-[0.12em] text-fg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          ))}
          <CharLink
            href="/account"
            text="Account"
            className="font-mono text-xs uppercase tracking-[0.12em] text-fg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          <Link
            href="/pricing"
            className="border border-ink px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-ink transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Get access
          </Link>
        </div>

        <button
          type="button"
          className="font-mono text-xs uppercase tracking-[0.12em] text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-paper md:hidden">
          <ul className="flex flex-col px-5 py-4">
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="border-b border-line/60 last:border-0">
                <Link
                  href={item.href}
                  className="block py-3 font-mono text-sm uppercase tracking-[0.12em] text-fg-muted hover:text-accent"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-4">
              <Link
                href="/pricing"
                className="btn-primary w-full justify-center"
                onClick={() => setOpen(false)}
              >
                Get access
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
