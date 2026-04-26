// Worker entrypoint. Day 6 Phase 1 swaps the body for BullMQ workers
// listening on the publish + refresh-tokens queues.

import { refreshTokensJob } from "./refresh-tokens";

async function main() {
  // Day 6 wires this to a queue runner. For now the entry just exposes
  // the named jobs so `tsx workers/index.ts --job=refresh-tokens` style
  // invocations can drive them ad-hoc.
  const arg = process.argv.find((a) => a.startsWith("--job="))?.split("=")[1];

  switch (arg) {
    case "refresh-tokens":
      await refreshTokensJob();
      break;
    default:
      console.log("Available jobs: refresh-tokens");
      console.log("Usage: tsx workers/index.ts --job=refresh-tokens");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
