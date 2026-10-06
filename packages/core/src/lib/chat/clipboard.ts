/** Writes text to the clipboard. Resolves true when it was written, false when the clipboard is unavailable or refused. */
export const copyText = async (text: string): Promise<boolean> => {
  const clipboard = globalThis.navigator?.clipboard;
  if (!clipboard?.writeText) return false;
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
