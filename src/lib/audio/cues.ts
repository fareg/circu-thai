let audioContext: AudioContext | null = null;

function getContext() {
  if (typeof window === "undefined") {
    return null;
  }
  if (!audioContext) {
    audioContext = new window.AudioContext();
  }
  return audioContext;
}

export async function playBeep(volume = 0.4, frequency = 880, durationSeconds = 0.2) {
  const ctx = getContext();
  if (!ctx) {
    return;
  }
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch (error) {
      console.warn("Unable to resume audio context for beep", error);
      return;
    }
  }
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + durationSeconds);
}

export function speakInstruction(text: string) {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (!("speechSynthesis" in window)) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    const finish = () => resolve();
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = finish;
      utterance.onerror = finish;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn("Unable to start speech synthesis", error);
      finish();
    }
  });
}

export function stopInstructions() {
  if (typeof window === "undefined") {
    return;
  }
  if (!("speechSynthesis" in window)) {
    return;
  }
  window.speechSynthesis.cancel();
}
