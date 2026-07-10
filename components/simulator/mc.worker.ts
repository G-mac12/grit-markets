import { simulate, type SimParams } from "@/lib/martingale";

self.onmessage = (e: MessageEvent<{ id: number; params: SimParams }>) => {
  const { id, params } = e.data;
  const result = simulate(params);
  (self as unknown as Worker).postMessage({ id, result });
};
