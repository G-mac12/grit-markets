"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SPEC_CARDS } from "@/content/ea-features";

export function SpecCards() {
  const reduced = useReducedMotion();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {SPEC_CARDS.map((card, i) => (
        <motion.article
          key={card.id}
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="panel scanlines flex flex-col p-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-medium">{card.name}</h3>
            <span className="inline-flex items-center gap-1.5 font-mono text-micro uppercase tracking-[0.12em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
              {card.status}
            </span>
          </div>
          <dl className="mt-4 space-y-1.5 border-y border-line py-3 font-mono text-xs">
            {card.readout.map((r) => (
              <div key={r.label} className="flex justify-between gap-3">
                <dt className="uppercase tracking-[0.1em] text-fg-faint">{r.label}</dt>
                <dd className="text-right text-fg">{r.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-fg-muted">
            {card.description}
          </p>
        </motion.article>
      ))}
    </div>
  );
}
