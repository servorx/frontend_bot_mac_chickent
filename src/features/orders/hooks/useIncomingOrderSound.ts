import { useCallback, useEffect, useRef, useState } from "react";

import { INCOMING_ORDER_CREATED_EVENT } from "./useOrderRealtime";

type WindowWithWebkitAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export function useIncomingOrderSound() {
  const audioContext = useRef<AudioContext | null>(null);
  const pendingAlert = useRef(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const play = useCallback(() => {
    const context = audioContext.current;
    if (!context || context.state !== "running") {
      pendingAlert.current = true;
      return;
    }

    pendingAlert.current = false;
    playOrderAlarm(context);

    if ("vibrate" in navigator) {
      navigator.vibrate([250, 120, 250, 120, 350]);
    }
  }, []);

  const enable = useCallback(() => {
    const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    if (!audioContext.current) {
      audioContext.current = new AudioContextClass();
    }

    void audioContext.current
      .resume()
      .then(() => {
        const enabled = audioContext.current?.state === "running";
        setIsEnabled(Boolean(enabled));
        if (enabled && pendingAlert.current) {
          play();
        }
      })
      .catch(() => {
        setIsEnabled(false);
      });
  }, [play]);

  useEffect(() => {
    enable();

    const unlock = () => {
      enable();
    };
    const options: AddEventListenerOptions = { passive: true };

    window.addEventListener("click", unlock, options);
    window.addEventListener("pointerdown", unlock, options);
    window.addEventListener("mousemove", unlock, options);
    window.addEventListener("touchstart", unlock, options);
    window.addEventListener("keydown", unlock);
    window.addEventListener("focus", unlock);
    document.addEventListener("visibilitychange", unlock);

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("mousemove", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("focus", unlock);
      document.removeEventListener("visibilitychange", unlock);
    };
  }, [enable]);

  useEffect(() => {
    window.addEventListener(INCOMING_ORDER_CREATED_EVENT, play);
    return () => window.removeEventListener(INCOMING_ORDER_CREATED_EVENT, play);
  }, [play]);

  return { enable, isEnabled, test: play };
}

function playOrderAlarm(context: AudioContext) {
  const pattern = [
    [0, 784, 0.22, 0.9],
    [0.25, 1175, 0.24, 0.95],
    [0.54, 1568, 0.36, 1],
    [1.15, 784, 0.22, 0.9],
    [1.4, 1175, 0.24, 0.95],
    [1.69, 1568, 0.42, 1],
    [2.45, 988, 0.24, 0.95],
    [2.72, 1319, 0.48, 1],
  ] as const;

  pattern.forEach(([delaySeconds, frequency, durationSeconds, volume]) => {
    playBellTone(context, delaySeconds, frequency, durationSeconds, volume);
  });
}

function playBellTone(
  context: AudioContext,
  delaySeconds: number,
  frequency: number,
  durationSeconds: number,
  volume: number,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + delaySeconds;
  const end = start + durationSeconds;

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.08, end);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
}
