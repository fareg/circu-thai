"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playBeep, speakInstruction, stopInstructions } from "@/lib/audio/cues";
import { MusicController } from "@/lib/audio/music";

const MUSIC_MUTED_PREF_KEY = "circuthai.musicMuted";

export function useAudioController() {
  const music = useMemo(() => new MusicController(), []);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const warmupRef = useRef<Promise<void> | null>(null);
  const primedRef = useRef(false);

  useEffect(() => {
    music.setVolume(isMuted ? 0 : volume);
  }, [isMuted, volume, music]);

  useEffect(() => () => music.halt(), [music]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(MUSIC_MUTED_PREF_KEY);
    if (stored === null) {
      return;
    }
    setIsMuted(stored === "true");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(MUSIC_MUTED_PREF_KEY, String(isMuted));
  }, [isMuted]);

  const warmupBeepContext = useCallback(() => {
    if (warmupRef.current) {
      return warmupRef.current;
    }
    warmupRef.current = playBeep(0).catch(() => undefined).finally(() => {
      warmupRef.current = null;
    });
    return warmupRef.current;
  }, []);

  useEffect(() => {
    void warmupBeepContext();
  }, [warmupBeepContext]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const prime = () => {
      if (primedRef.current) {
        return;
      }
      primedRef.current = true;
      void warmupBeepContext();
    };
    window.addEventListener("pointerdown", prime);
    window.addEventListener("keydown", prime);
    return () => {
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("keydown", prime);
    };
  }, [warmupBeepContext]);

  const playInstructionSafe = useCallback((text: string) => speakInstruction(text), []);
  const stopInstructionSafe = useCallback(() => stopInstructions(), []);
  const playBeepSafe = useCallback(
    (frequency?: number, durationSeconds?: number) => {
      music.duck();
      void warmupBeepContext().then(() => playBeep(volume, frequency, durationSeconds));
    },
    [music, volume, warmupBeepContext]
  );
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
