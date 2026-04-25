"use client";

import { useCallback, useRef } from "react";

type ConfettiFn = (options?: Record<string, unknown>) => Promise<null> | null;

export function useConfetti() {
  const confettiRef = useRef<ConfettiFn | null>(null);

  const fire = useCallback(async () => {
    if (!confettiRef.current) {
      const mod = await import("canvas-confetti");
      confettiRef.current = mod.default as unknown as ConfettiFn;
    }

    confettiRef.current?.({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return { fire };
}
