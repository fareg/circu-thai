export interface PreciseTimerOptions {
  durationMs: number;
  onTick: (elapsedMs: number, remainingMs: number) => void;
  onComplete: () => void;
}

export interface PreciseTimer {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function createPreciseTimer({ durationMs, onTick, onComplete }: PreciseTimerOptions): PreciseTimer {
  let rafId: number | null = null;
  let startTime = 0;
  let pausedAt = 0;
  let elapsed = 0;
  let running = false;

  const step = () => {
    if (!running) {
      return;
    }
    const now = performance.now();
    elapsed = now - startTime;
    const remaining = Math.max(0, durationMs - elapsed);
    onTick(elapsed, remaining);
    if (remaining <= 0) {
      running = false;
      onComplete();
      return;
    }
    rafId = window.requestAnimationFrame(step);
  };

  return {
    start() {
      if (running) {
        return;
      }
      running = true;
      startTime = performance.now();
      rafId = window.requestAnimationFrame(step);
    },
    pause() {
      if (!running) {
        return;
      }
      running = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      pausedAt = elapsed;
    },
    resume() {
      if (running || pausedAt === 0) {
        return;
      }
      running = true;
      startTime = performance.now() - pausedAt;
      rafId = window.requestAnimationFrame(step);
    },
    stop() {
      running = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      rafId = null;
      pausedAt = 0;
      elapsed = 0;
    },
  };
}
