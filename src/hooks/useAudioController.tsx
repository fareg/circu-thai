"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { playBeep, speakInstruction, stopInstructions } from "@/lib/audio/cues";
import { MusicController } from "@/lib/audio/music";

export function useAudioController() {
  const music = useMemo(() => new MusicController(), []);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.5);

  useEffect(() => {
    music.setVolume(isMuted ? 0 : volume);
  }, [isMuted, volume, music]);

  useEffect(() => () => music.halt(), [music]);

  const playInstructionSafe = useCallback((text: string) => speakInstruction(text), []);
  const stopInstructionSafe = useCallback(() => stopInstructions(), []);
  const playBeepSafe = useCallback(() => playBeep(isMuted ? 0 : volume), [isMuted, volume]);
  const loadMusic = useCallback((src?: string) => music.load(src), [music]);
  const playMusic = useCallback(() => music.play(), [music]);
  const pauseMusic = useCallback(() => music.pause(), [music]);
  const seekMusic = useCallback((seconds: number) => music.seek(seconds), [music]);
  const getMusicPosition = useCallback(() => music.getPosition(), [music]);
  const getMusicDuration = useCallback(() => music.getDuration(), [music]);
  const changeVolume = useCallback((next: number) => setVolumeState(next), []);
  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), []);

  return {
    playInstruction: playInstructionSafe,
    stopInstruction: stopInstructionSafe,
    playBeep: playBeepSafe,
    loadMusic,
    playMusic,
    pauseMusic,
    seekMusic,
    getMusicPosition,
    getMusicDuration,
    changeVolume,
    toggleMute,
    volume,
    isMuted,
  };
}
