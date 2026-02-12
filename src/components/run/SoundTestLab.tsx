"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { MusicPanel } from "@/components/run/MusicPanel";
import { useAudioController } from "@/hooks/useAudioController";
import {
  COMPLETION_BEEP_DURATION_MS,
  COMPLETION_BEEP_FREQUENCY,
  SIDE_SWITCH_BEEP_DURATION_MS,
  SIDE_SWITCH_BEEP_FREQUENCY,
  SIDE_SWITCH_DOUBLE_BEEP_DELAY_MS,
  WARNING_BEEP_DURATION_MS,
  WARNING_BEEP_FREQUENCY,
  WARNING_THRESHOLD_MS,
} from "@/lib/audio/cueConfig";

interface SoundTestLabels {
  title: string;
  intro: string;
  instructionHeading: string;
  instructionPlaceholder: string;
  defaultInstruction: string;
  speak: string;
  completionBeep: string;
  warningBeep: string;
  sideSwitchBeep: string;
  sideSwitchDoubleBeep: string;
  musicHeading: string;
  sampleLabel: string;
  sampleSelectLabel: string;
  customLabel: string;
  customPlaceholder: string;
  loadCustom: string;
  play: string;
  pause: string;
  stop: string;
  timelineHeading: string;
  statusHeading: string;
  statusIdle: string;
  statusLoaded: string;
  statusStopped: string;
  statusInstructionMissing: string;
  statusUrlMissing: string;
  statusInstructionQueued: string;
  statusBeepPlayed: string;
  statusPlaying: string;
  statusPaused: string;
  volumeLabel: string;
  muteLabel: string;
  unmuteLabel: string;
}

interface SoundTestLabProps {
  sampleMusicUrl: string;
  sampleOptions?: Array<{ label: string; url: string }>;
  labels: SoundTestLabels;
  homeHref?: string;
  homeLabel?: string;
}

const shortenAudioLabel = (source?: string) => {
  if (!source) {
    return "-";
  }
  try {
    const parsed = new URL(source);
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments.at(-1) ?? parsed.hostname;
  } catch {
    const parts = source.split("/").filter(Boolean);
    return parts.at(-1) ?? source;
  }
};

export function SoundTestLab({ sampleMusicUrl, sampleOptions, labels, homeHref, homeLabel }: SoundTestLabProps) {
  const {
    playInstruction,
    playBeep,
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
  } = useAudioController();

  const [instruction, setInstruction] = useState(labels.defaultInstruction);
  const [customUrl, setCustomUrl] = useState("");
  const [currentTrack, setCurrentTrack] = useState<string | undefined>(sampleMusicUrl);
  const [status, setStatus] = useState(
    sampleMusicUrl ? labels.statusLoaded.replace("{track}", shortenAudioLabel(sampleMusicUrl)) : labels.statusIdle
  );
  const [timeline, setTimeline] = useState({ position: 0, duration: 0 });
  const sideSwitchTimeoutRef = useRef<number | null>(null);

  const trackLabel = useMemo(() => shortenAudioLabel(currentTrack), [currentTrack]);

  useEffect(() => {
    loadMusic(currentTrack);
  }, [currentTrack, loadMusic]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeline({
        position: getMusicPosition(),
        duration: getMusicDuration(),
      });
    }, 400);
    return () => window.clearInterval(interval);
  }, [getMusicDuration, getMusicPosition]);

  useEffect(() => {
    if (!currentTrack) {
      setTimeline({ position: 0, duration: 0 });
    }
  }, [currentTrack]);

  useEffect(() => {
    return () => {
      if (sideSwitchTimeoutRef.current !== null) {
        window.clearTimeout(sideSwitchTimeoutRef.current);
        sideSwitchTimeoutRef.current = null;
      }
    };
  }, []);

  const sliderMax = timeline.duration > 0 ? timeline.duration : 1;
  const sliderValue = timeline.duration > 0 ? timeline.position : 0;
  const warningWindowSeconds = Math.round(WARNING_THRESHOLD_MS / 1000);

  const handleTimelineChange = (value: number) => {
    seekMusic(value);
    setTimeline((prev) => ({ ...prev, position: value }));
  };

  const formatTime = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds)) {
      return "0:00";
    }
    const clamped = Math.max(0, seconds);
    const minutes = Math.floor(clamped / 60);
    const remainder = Math.floor(clamped % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${remainder}`;
  };

  const handleSpeak = () => {
    const next = instruction.trim();
    if (!next) {
      setStatus(labels.statusInstructionMissing);
      return;
    }
    void playInstruction(next);
    setStatus(labels.statusInstructionQueued);
  };

  const triggerBeep = (frequency: number, durationMs: number) => {
    playBeep(frequency, durationMs / 1000);
    setStatus(labels.statusBeepPlayed);
  };

  const handleCompletionBeep = () => {
    triggerBeep(COMPLETION_BEEP_FREQUENCY, COMPLETION_BEEP_DURATION_MS);
  };

  const handleWarningBeep = () => {
    triggerBeep(WARNING_BEEP_FREQUENCY, WARNING_BEEP_DURATION_MS);
  };

  const handleSideSwitchBeep = () => {
    triggerBeep(SIDE_SWITCH_BEEP_FREQUENCY, SIDE_SWITCH_BEEP_DURATION_MS);
  };

  const handleSideSwitchDoubleBeep = () => {
    triggerBeep(SIDE_SWITCH_BEEP_FREQUENCY, SIDE_SWITCH_BEEP_DURATION_MS);
    if (sideSwitchTimeoutRef.current !== null) {
      window.clearTimeout(sideSwitchTimeoutRef.current);
    }
    sideSwitchTimeoutRef.current = window.setTimeout(() => {
      triggerBeep(SIDE_SWITCH_BEEP_FREQUENCY, SIDE_SWITCH_BEEP_DURATION_MS);
      sideSwitchTimeoutRef.current = null;
    }, SIDE_SWITCH_DOUBLE_BEEP_DELAY_MS);
  };

  const beepButtons = [
    {
      key: "completion",
      label: labels.completionBeep,
      meta: `${COMPLETION_BEEP_FREQUENCY} Hz · ${COMPLETION_BEEP_DURATION_MS} ms`,
      onClick: handleCompletionBeep,
      className:
        "rounded-full border border-white/40 px-5 py-2 text-left text-sm text-white focus-ring leading-tight",
      metaClassName: "text-[11px] text-white/60",
    },
    {
      key: "warning",
      label: labels.warningBeep,
      meta: `${WARNING_BEEP_FREQUENCY} Hz · ${WARNING_BEEP_DURATION_MS} ms • window: ${warningWindowSeconds}s`,
      onClick: handleWarningBeep,
      className:
        "rounded-full border border-orange-200/60 px-5 py-2 text-left text-sm text-orange-100 focus-ring leading-tight",
      metaClassName: "text-[11px] text-orange-200/80",
    },
    {
      key: "side-switch-single",
      label: labels.sideSwitchBeep,
      meta: `${SIDE_SWITCH_BEEP_FREQUENCY} Hz · ${SIDE_SWITCH_BEEP_DURATION_MS} ms`,
      onClick: handleSideSwitchBeep,
      className:
        "rounded-full border border-emerald-200/40 px-5 py-2 text-left text-sm text-emerald-50 focus-ring leading-tight",
      metaClassName: "text-[11px] text-emerald-200/70",
    },
    {
      key: "side-switch-double",
      label: labels.sideSwitchDoubleBeep,
      meta: `${SIDE_SWITCH_BEEP_FREQUENCY} Hz · ${SIDE_SWITCH_BEEP_DURATION_MS} ms ×2 +${SIDE_SWITCH_DOUBLE_BEEP_DELAY_MS} ms`,
      onClick: handleSideSwitchDoubleBeep,
      className:
        "rounded-full border border-emerald-300/80 px-5 py-2 text-left text-sm text-emerald-100 focus-ring leading-tight",
      metaClassName: "text-[11px] text-emerald-200/90",
    },
  ];

  const handleSampleLoad = (url: string) => {
    if (!url) {
      setStatus(labels.statusUrlMissing);
      return;
    }
    setCurrentTrack(url);
    setCustomUrl("");
    setStatus(labels.statusLoaded.replace("{track}", shortenAudioLabel(url)));
    setTimeline({ position: 0, duration: 0 });
  };

  const handleCustomLoad = () => {
    const next = customUrl.trim();
    if (!next) {
      setStatus(labels.statusUrlMissing);
      return;
    }
    setCurrentTrack(next);
    setStatus(labels.statusLoaded.replace("{track}", shortenAudioLabel(next)));
    setTimeline({ position: 0, duration: 0 });
  };

  const handlePlay = () => {
    if (!currentTrack) {
      setStatus(labels.statusUrlMissing);
      return;
    }
    playMusic();
    setStatus(labels.statusPlaying.replace("{track}", trackLabel));
  };

  const handlePause = () => {
    pauseMusic();
    setStatus(labels.statusPaused);
  };

  const handleStop = () => {
    pauseMusic();
    setCurrentTrack(undefined);
    setStatus(labels.statusStopped);
    setTimeline({ position: 0, duration: 0 });
  };

  return (
    <section className="space-y-6">
      {homeHref && (
        <div className="flex justify-end">
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 focus-ring"
          >
            {homeLabel ?? "Home"}
          </Link>
        </div>
      )}
      <div className="glass-panel px-6 py-6 text-white">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">{labels.title}</p>
        <p className="mt-3 text-sm text-white/80">{labels.intro}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel flex flex-col gap-4 px-6 py-6 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{labels.instructionHeading}</p>
            <textarea
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder={labels.instructionPlaceholder}
              className="mt-3 min-h-[120px] w-full rounded-2xl bg-white/10 p-3 text-sm text-white placeholder:text-white/40"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSpeak}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 focus-ring"
            >
              {labels.speak}
            </button>
            {beepButtons.map((button) => (
              <button
                key={button.key}
                type="button"
                onClick={button.onClick}
                className={`${button.className} flex flex-col gap-0.5`}
              >
                <span className="font-medium">{button.label}</span>
                <span className={`block ${button.metaClassName} text-left`}>{button.meta}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="glass-panel flex flex-col gap-4 px-6 py-6 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{labels.musicHeading}</p>
            <p className="mt-2 text-sm text-white/70">{trackLabel}</p>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSampleLoad(sampleMusicUrl)}
              className="rounded-full border border-white/30 px-5 py-2 text-sm text-white focus-ring"
            >
              {labels.sampleLabel}
            </button>
            {sampleOptions && sampleOptions.length > 0 && (
              <label className="flex flex-col gap-2 text-sm text-white/80">
                <span>{labels.sampleSelectLabel}</span>
                <select
                  onChange={(event) => handleSampleLoad(event.target.value)}
                  className="rounded-2xl bg-white/10 px-3 py-2 text-white"
                  defaultValue=""
                >
                  <option value="" disabled>
                    --
                  </option>
                  {sampleOptions.map((option) => (
                    <option key={option.url} value={option.url} className="bg-slate-900 text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <label className="flex flex-col gap-2 text-sm text-white/80">
            <span>{labels.customLabel}</span>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={customUrl}
                onChange={(event) => setCustomUrl(event.target.value)}
                placeholder={labels.customPlaceholder}
                className="flex-1 rounded-2xl bg-white/10 px-3 py-2 text-white placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={handleCustomLoad}
                className="rounded-full border border-white/40 px-5 py-2 text-sm text-white focus-ring"
              >
                {labels.loadCustom}
              </button>
            </div>
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePlay}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 focus-ring disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/60"
              disabled={!currentTrack}
            >
              {labels.play}
            </button>
            <button
              type="button"
              onClick={handlePause}
              className="rounded-full border border-white/40 px-5 py-2 text-sm text-white focus-ring"
            >
              {labels.pause}
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="rounded-full border border-white/40 px-5 py-2 text-sm text-white focus-ring"
            >
              {labels.stop}
            </button>
          </div>
          <label className="flex flex-col gap-2 text-sm text-white/80">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
              <span>{labels.timelineHeading}</span>
              <span className="font-mono tracking-normal text-white/80">
                {formatTime(sliderValue)} / {formatTime(timeline.duration)}
              </span>
            </div>
            <div className="px-2 w-full overflow-hidden">
              <input
                type="range"
                min={0}
                max={sliderMax}
                step={1}
                value={sliderValue}
                disabled={!timeline.duration}
                onChange={(event) => handleTimelineChange(Number(event.target.value))}
                className="mx-auto w-[calc(100%-20px)] max-w-full accent-emerald-300 disabled:opacity-30"
              />
            </div>
          </label>
          <MusicPanel
            label={labels.musicHeading}
            volumeLabel={labels.volumeLabel}
            muteLabel={labels.muteLabel}
            unmuteLabel={labels.unmuteLabel}
            volume={volume}
            isMuted={isMuted}
            onVolume={changeVolume}
            onToggleMute={toggleMute}
            musicUrl={currentTrack}
          />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{labels.statusHeading}</p>
            <p className="mt-1 text-sm text-white/80">{status}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
