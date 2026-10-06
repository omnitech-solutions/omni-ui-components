import * as React from 'react';

/** True when the browser can read text aloud. */
export const canSpeak = (): boolean => typeof globalThis.speechSynthesis !== 'undefined';

/** What a reply sounds like read aloud: prose without Markdown punctuation, code blocks replaced by `codeOmitted`. */
export const speakable = (markdown: string, codeOmitted = '(code omitted)'): string =>
  markdown
    .replace(/```[\s\S]*?```/g, ` ${codeOmitted} `)
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(\d{1,3})\]/g, '')
    .replace(/[#*_>|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Read-aloud toggle: `speak(id, text)` starts reading, or stops when `id` is already being read. `speaking` is the id
 * being read. Speech stops when the component unmounts.
 */
export const useSpeech = (): { speaking: string | undefined; speak: (id: string, text: string) => void; stop: () => void } => {
  const [speaking, setSpeaking] = React.useState<string>();
  const speak = React.useCallback(
    (id: string, text: string) => {
      const synth = globalThis.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      if (speaking === id) {
        setSpeaking(undefined);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeaking((current) => (current === id ? undefined : current));
      utterance.onerror = utterance.onend;
      setSpeaking(id);
      synth.speak(utterance);
    },
    [speaking],
  );
  const stop = React.useCallback(() => {
    globalThis.speechSynthesis?.cancel();
    setSpeaking(undefined);
  }, []);
  React.useEffect(() => () => globalThis.speechSynthesis?.cancel(), []);
  return { speaking, speak, stop };
};
