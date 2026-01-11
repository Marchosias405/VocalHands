/**
 * Sign-Speak SDK initializer.
 * We keep it minimal: set API key if the SDK supports it.
 * If the SDK API differs, this won't break your app.
 */

export async function initSignSpeak(apiKey?: string) {
  if (!apiKey) {
    console.warn("No Sign-Speak key found (VITE_SIGN_SPEAK_API_KEY).");
    return;
  }

  try {
    // Dynamic import so app still runs even if SDK changes
    const mod: any = await import("@sign-speak/react-sdk");

    // Common patterns: setKey(key) OR init({key})
    if (typeof mod.setKey === "function") {
      mod.setKey(apiKey);
      return;
    }
    if (typeof mod.init === "function") {
      mod.init({ apiKey });
      return;
    }

    console.warn(
      "Sign-Speak SDK loaded but no init method found. Check SDK docs for key setup."
    );
  } catch (e) {
    console.warn("Sign-Speak SDK not available or failed to load:", e);
  }
}
