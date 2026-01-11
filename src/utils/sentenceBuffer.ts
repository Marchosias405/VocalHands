export function createSentenceBuffer(endAfterMs = 2000) {
  let words: string[] = [];
  let lastAddAt = 0;

  function add(word: string, now = Date.now()) {
    const w = (word || "").trim();
    if (!w) return;
    words.push(w);
    lastAddAt = now;
  }

  function draft() {
    return words.join(" ").trim();
  }

  function shouldEnd(now = Date.now()) {
    if (words.length === 0) return false;
    return now - lastAddAt >= endAfterMs;
  }

  function commit() {
    const s = draft();
    words = [];
    lastAddAt = 0;
    return s;
  }

  function clear() {
    words = [];
    lastAddAt = 0;
  }

  return { add, draft, shouldEnd, commit, clear };
}
