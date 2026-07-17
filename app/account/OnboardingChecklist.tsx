import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ONBOARDING_STEPS,
  isStepDone,
  type OnboardingState,
} from "@/lib/onboarding";

/**
 * Server-rendered onboarding checklist. Ticks are derived exclusively from
 * server-observed signals via onboarding_state (RLS own-read); the current
 * blocker always shows its fix. Hidden once the account is healthy.
 */
export async function OnboardingChecklist() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("onboarding_state")
    .select("state")
    .maybeSingle<{ state: OnboardingState }>();
  const state = data?.state;
  if (state === "healthy") return null;

  const firstBlockerIdx = ONBOARDING_STEPS.findIndex(
    (s) => !isStepDone(state, s)
  );
  const stalled = state?.startsWith("stalled_");

  return (
    <div className="panel mt-8 max-w-2xl p-5 md:p-6">
      <p className="label-micro mb-4">
        Getting set up
        {stalled && <span className="ml-2 text-loss">· looks stuck — see the highlighted fix</span>}
      </p>
      <ol className="space-y-3">
        {ONBOARDING_STEPS.map((step, i) => {
          const done = isStepDone(state, step);
          const isBlocker = i === firstBlockerIdx;
          return (
            <li key={step.label} className="flex gap-3">
              <span
                aria-hidden="true"
                className={`mt-0.5 inline-flex h-4 w-4 flex-none items-center justify-center border font-mono text-[10px] ${
                  done
                    ? "border-gain bg-gain text-white"
                    : isBlocker
                      ? "border-accent text-accent"
                      : "border-line text-fg-faint"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <div>
                <p
                  className={`font-mono text-xs uppercase tracking-[0.08em] ${
                    done ? "text-fg-faint line-through" : isBlocker ? "text-fg" : "text-fg-muted"
                  }`}
                >
                  {step.label}
                </p>
                {isBlocker && (
                  <p className="mt-1 max-w-md text-xs leading-relaxed text-fg-muted">
                    {step.fix}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-5 border-t border-line pt-3 text-xs text-fg-faint">
        Steps tick automatically from what the platform actually observes —
        nothing to mark done by hand. Stuck?{" "}
        <Link href="/start-here" className="text-accent underline">
          Start-here guides
        </Link>{" "}
        cover every step with screenshots.
      </p>
    </div>
  );
}
