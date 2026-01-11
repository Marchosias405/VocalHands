export function speak(text: string) {
  const t = (text || "").trim();
  if (!t) return;

  // Cancel current speech to keep it "live"
  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(t);
  window.speechSynthesis.speak(u);
}

export function stopSpeech() {
  window.speechSynthesis.cancel();
}
