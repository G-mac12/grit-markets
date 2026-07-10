/**
 * Setup-path progress travels in the URL (?done=1,3) — no localStorage, per
 * the privacy-preserving brief. Links between hub and guides preserve it.
 */
export function parseDone(param: string | null): number[] {
  if (!param) return [];
  return Array.from(
    new Set(
      param
        .split(",")
        .map((s) => parseInt(s, 10))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 5)
    )
  ).sort();
}

export function doneParam(done: number[]): string {
  return done.length ? `?done=${done.join(",")}` : "";
}

export function withStep(done: number[], step: number): number[] {
  return parseDone([...done, step].join(","));
}

export function withoutStep(done: number[], step: number): number[] {
  return done.filter((n) => n !== step);
}
