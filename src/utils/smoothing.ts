export type SmoothResult = { commit: boolean; text: string };

/**
 * Commit a word only after it stays stable for stabilityMs.
 * Avoid repeating the same word within cooldownMs.
 */
export function createSmoother(stabilityMs = 700, cooldownMs = 1300) {
  let lastSeen = "";
  let lastSeenAt = 0;

  let lastCommit = "";
  let lastCommitAt = 0;

  return function smooth(nowText: string, now = Date.now()): SmoothResult {
    const t = (nowText || "").trim();
    if (!t) return { commit: false, text: "" };

    if (t !== lastSeen) {
      lastSeen = t;
      lastSeenAt = now;
      return { commit: false, text: "" };
    }

    if (now - lastSeenAt < stabilityMs) {
      return { commit: false, text: "" };
    }

    const sameAsLast = t === lastCommit;
    const inCooldown = now - lastCommitAt < cooldownMs;

    if (sameAsLast && inCooldown) return { commit: false, text: "" };

    lastCommit = t;
    lastCommitAt = now;
    return { commit: true, text: t };
  };
}
