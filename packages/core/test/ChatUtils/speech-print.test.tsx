import {
  canSpeak,
  conversationHtml,
  printConversation,
  useSpeech,
} from '@oc-tech/omni-ui-components/lib/chat';
import { act, render } from '@testing-library/react';

type Utterance = { text: string; onend?: () => void; onerror?: () => void };

const stubSpeech = () => {
  const spoken: Utterance[] = [];
  const synth = { speak: jest.fn((u: Utterance) => spoken.push(u)), cancel: jest.fn() };
  Object.defineProperty(globalThis, 'speechSynthesis', { value: synth, configurable: true });
  (globalThis as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
    class {
      onend?: () => void;
      onerror?: () => void;
      constructor(public text: string) {}
    };
  return { synth, spoken };
};

const unstubSpeech = () => {
  delete (globalThis as { speechSynthesis?: unknown }).speechSynthesis;
};

describe('canSpeak and useSpeech', () => {
  afterEach(unstubSpeech);

  it('canSpeak reflects speechSynthesis', () => {
    expect(canSpeak()).toBe(false);
    stubSpeech();
    expect(canSpeak()).toBe(true);
  });

  const setup = () => {
    const ref: { current: ReturnType<typeof useSpeech> | null } = { current: null };
    const Probe = () => {
      ref.current = useSpeech();
      return null;
    };
    const view = render(<Probe />);
    return { ref, ...view };
  };

  it('speak starts reading, a second call for the same id stops, onend clears', () => {
    const { synth, spoken } = stubSpeech();
    const { ref, unmount } = setup();
    act(() => ref.current?.speak('m1', 'hello'));
    expect(spoken[0].text).toBe('hello');
    expect(ref.current?.speaking).toBe('m1');
    act(() => ref.current?.speak('m1', 'hello'));
    expect(ref.current?.speaking).toBeUndefined();
    expect(spoken).toHaveLength(1);
    act(() => ref.current?.speak('m2', 'again'));
    expect(ref.current?.speaking).toBe('m2');
    act(() => spoken[1].onend?.());
    expect(ref.current?.speaking).toBeUndefined();
    act(() => ref.current?.speak('m3', 'x'));
    act(() => ref.current?.stop());
    expect(ref.current?.speaking).toBeUndefined();
    synth.cancel.mockClear();
    unmount();
    expect(synth.cancel).toHaveBeenCalled();
  });

  it('does nothing without speechSynthesis', () => {
    const { ref } = setup();
    act(() => ref.current?.speak('m1', 'hello'));
    expect(ref.current?.speaking).toBeUndefined();
  });
});

describe('printConversation', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('writes the printable page into a hidden iframe, prints it, and removes the frame later', () => {
    const print = jest.fn();
    const write = jest.fn();
    const doc = { open: jest.fn(), write, close: jest.fn() };
    const create = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = create(tag);
      if (tag === 'iframe') {
        Object.defineProperty(el, 'contentDocument', { value: doc });
        Object.defineProperty(el, 'contentWindow', { value: { focus: jest.fn(), print } });
      }
      return el;
    });
    const messages = [
      { role: 'user', text: 'a < b' },
      { role: 'assistant', text: 'ok' },
    ];
    printConversation('Plan', messages);
    expect(document.querySelector('iframe')).not.toBeNull();
    expect(write).toHaveBeenCalledWith(conversationHtml('Plan', messages));
    expect(write.mock.calls[0][0]).toContain('a &lt; b');
    expect(print).toHaveBeenCalledTimes(1);
    act(() => jest.advanceTimersByTime(60_000));
    expect(document.querySelector('iframe')).toBeNull();
    jest.restoreAllMocks();
  });

  it('removes the frame and does not print when there is no document', () => {
    const create = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = create(tag);
      if (tag === 'iframe') Object.defineProperty(el, 'contentDocument', { value: null });
      return el;
    });
    printConversation('Plan', []);
    expect(document.querySelector('iframe')).toBeNull();
    jest.restoreAllMocks();
  });
});
