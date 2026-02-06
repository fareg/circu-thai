"use client";

import { useEffect, useMemo, useState } from "react";
import { playBeep, speakInstruction } from "@/lib/audio/cues";
import { MusicController } from "@/lib/audio/music";

export function useAudioController() {
  const music = useMemo(() => new MusicController(), []);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.5);

  useEffect(() => {
    music.setVolume(isMuted ? 0 : volume);
  }, [isMuted, volume, music]);

  useEffect(() => () => music.halt(), [music]);

  return {
    playInstruction: (text: string) => speakInstruction(text),
    playBeep: () => playBeep(isMuted ? 0 : volume),
    loadMusic: (src?: string) => music.load(src),
    playMusic: () => music.play(),
    pauseMusic: () => music.pause(),
    changeVolume: (next: number) => setVolumeState(next),
    toggleMute: () => setIsMuted((prev) => !prev),
    volume,
    isMuted,
  };
}
