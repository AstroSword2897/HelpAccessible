import { useCallback, useRef } from "react";

export interface UseTTSOptions {
  enabled?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useTTS(options: UseTTSOptions = {}) {
  const { enabled = true, rate = 0.95, pitch = 1, volume = 1 } = options;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(
    (text: string, interrupt = true) => {
      if (!enabled || typeof window === "undefined" || !window.speechSynthesis) return;

      if (interrupt) {
        window.speechSynthesis.cancel();
      }

      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;
      u.lang = "en-US";
      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    },
    [enabled, rate, pitch, volume],
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop, enabled };
}
