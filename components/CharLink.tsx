import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/**
 * K95-pattern character-split hover: each glyph carries a duplicate below it
 * (via CSS ::after) and the column slides up on hover with a per-character
 * stagger. Pure CSS transforms — no JS on the hot path, screen-reader safe
 * (duplicate glyphs live in ::after, the real text stays in the DOM).
 */
export function SplitChars({ text }: { text: string }) {
  return (
    <span aria-hidden="true">
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className="char"
          data-char={ch}
          style={{ "--char-i": i } as CSSProperties}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

export function CharLink({
  href,
  text,
  className = "",
  children,
}: {
  href: string;
  text: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Link href={href} className={`char-link ${className}`}>
      <span className="sr-only">{text}</span>
      <SplitChars text={text} />
      {children}
    </Link>
  );
}
