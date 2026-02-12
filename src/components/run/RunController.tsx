"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Exercise, ProgramRecord } from "@/types";
import { createPreciseTimer, formatSeconds, PreciseTimer } from "@/lib/timer";
import { useAudioController } from "@/hooks/useAudioController";
import { useWakeLock } from "@/hooks/useWakeLock";
import { MusicPanel } from "./MusicPanel";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/time";
import { ArrowLeft } from "lucide-react";
import { SIDE_SWITCH_EXERCISE_IDS } from "@/data/sideSwitchDefaults";
import {
  COMPLETION_BEEP_DURATION_MS,
  COMPLETION_BEEP_FREQUENCY,
  MIN_WARNING_GAP_AFTER_SWITCH_MS,
  SIDE_SWITCH_BEEP_DURATION_MS,
  SIDE_SWITCH_BEEP_FREQUENCY,
  SIDE_SWITCH_DOUBLE_BEEP_DELAY_MS,
  SIDE_SWITCH_VISUAL_DURATION_MS,
  WARNING_BEEP_DURATION_MS,
  WARNING_BEEP_FREQUENCY,
  WARNING_THRESHOLD_MS,
} from "@/lib/audio/cueConfig";
// LocalStorage key used to persist the “Couper le descriptif audio” toggle across sessions.
const NARRATION_PREF_KEY = "circuthai.omitDescriptionNarration";

interface RunControllerProps {
  program: ProgramRecord;
  exercises: Record<string, Exercise>;
  labels: {
    start: string;
    pause: string;
    resume: string;
    skip: string;
    previous: string;
    restart: string;
    next: string;
    completed: string;
    ready: string;
    elapsed: string;
    remaining: string;
    summaryHeading: string;
    music: string;
    volume: string;
    mute: string;
    unmute: string;
    stepCount: string;
    descriptionLabel: string;
    repeatDescription: string;
    minuteSingular: string;
    minutePlural: string;
    secondSingular: string;
    secondPlural: string;
    sideSwitchCue: string;
    disableDescriptionNarration: string;
    enableDescriptionNarration: string;
  };
  onCompleted: (durationSeconds: number, interruptCount: number) => Promise<void> | void;
  homeHref?: string;
  homeLabel?: string;
}

type RunStatus = "idle" | "running" | "paused" | "completed";

export function RunController({
  program,
  exercises,
  labels,
  onCompleted,
  homeHref,
  homeLabel,
}: RunControllerProps) {
  const {
    playInstruction,
    stopInstruction,
    playBeep,
    loadMusic,
    playMusic,
    pauseMusic,
    changeVolume,
    toggleMute,
    volume,
    isMuted,
  } = useAudioController();
  const [status, setStatus] = useState<RunStatus>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stepElapsed, setStepElapsed] = useState(0);
  const [stepRemaining, setStepRemaining] = useState(0);
  const [completedSeconds, setCompletedSeconds] = useState(0);
  const [interrupts, setInterrupts] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState<string | null>(null);
  const [omitDescriptions, setOmitDescriptions] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(NARRATION_PREF_KEY) === "true";
  });
  const [sideSwitchCueActive, setSideSwitchCueActive] = useState(false);
  const timerRef = useRef<PreciseTimer | null>(null);
  const delayRef = useRef<NodeJS.Timeout | null>(null);
  const pendingStartRef = useRef<{ token: number } | null>(null);
  const pendingPayloadRef = useRef<{ index: number; announce: boolean } | null>(null);
  const pendingTokenRef = useRef(0);
  const pendingMusicUnlockRef = useRef(false);
  const userInteractedRef = useRef(false);
  const warningIssuedRef = useRef(false);
  const sideSwitchIssuedRef = useRef(false);
  const sideSwitchCueTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sideSwitchBeepTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock();

  const currentStep = program.steps[currentIndex];
  const nextStep = program.steps[currentIndex + 1];
  const currentExercise = currentStep ? exercises[currentStep.exerciseId] : undefined;
  const nextExercise = nextStep ? exercises[nextStep.exerciseId] : undefined;
  const exercisesReady = useMemo(() => {
    if (program.steps.length === 0) {
      return false;
    }
    return program.steps.every((step) => Boolean(exercises[step.exerciseId]));
  }, [exercises, program.steps]);
  const summaryItems = useMemo(() => {
    return program.steps.map((step, index) => ({
      id: step.id,
      title: exercises[step.exerciseId]?.name ?? step.exerciseId,
      duration: step.duration,
      index,
    }));
  }, [exercises, program.steps]);

  const totalSeconds = useMemo(() => program.steps.reduce((total, step) => total + step.duration, 0), [program.steps]);
  const totalElapsed = completedSeconds + stepElapsed;

  useEffect(() => {
    loadMusic(program.musicUrl);
  }, [loadMusic, program.musicUrl]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(NARRATION_PREF_KEY, String(omitDescriptions));
  }, [omitDescriptions]);

  useEffect(
    () => () => {
      timerRef.current?.stop();
      clearDelay();
      stopInstruction();
      clearSideSwitchCue();
    },
    []
  );

  const clearDelay = () => {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
  };

  const clearSideSwitchCue = () => {
    if (sideSwitchCueTimeoutRef.current) {
      clearTimeout(sideSwitchCueTimeoutRef.current);
      sideSwitchCueTimeoutRef.current = null;
    }
    if (sideSwitchBeepTimeoutRef.current) {
      clearTimeout(sideSwitchBeepTimeoutRef.current);
      sideSwitchBeepTimeoutRef.current = null;
    }
    setSideSwitchCueActive(false);
  };

  const cancelPendingStart = (options?: { keepPayload?: boolean }) => {
    pendingStartRef.current = null;
    if (!options?.keepPayload) {
      pendingPayloadRef.current = null;
    }
  };

  const requestMusicPlayback = useCallback(() => {
    if (isMuted) {
      pendingMusicUnlockRef.current = false;
      pauseMusic();
      return;
    }
    if (userInteractedRef.current) {
      playMusic();
      return;
    }
    pendingMusicUnlockRef.current = true;
    playMusic();
  }, [isMuted, pauseMusic, playMusic]);

  useEffect(() => {
    const handleUserInteract = () => {
      userInteractedRef.current = true;
      if (pendingMusicUnlockRef.current) {
        pendingMusicUnlockRef.current = false;
        requestMusicPlayback();
      }
    };
    window.addEventListener("pointerdown", handleUserInteract);
    window.addEventListener("keydown", handleUserInteract);
    return () => {
      window.removeEventListener("pointerdown", handleUserInteract);
      window.removeEventListener("keydown", handleUserInteract);
      void releaseWakeLock();
    };
  }, [releaseWakeLock, requestMusicPlayback]);

  useEffect(() => {
    if (status !== "running") {
      return;
    }
    if (isMuted) {
      pauseMusic();
    } else {
      requestMusicPlayback();
    }
  }, [status, isMuted, pauseMusic, requestMusicPlayback]);

  const startStep = (index: number, announce = true) => {
    timerRef.current?.stop();
    clearDelay();
    cancelPendingStart();
    stopInstruction();
    const step = program.steps[index];
    if (!step) {
      finishSession();
      return;
    }
    const durationMs = step.duration * 1000;
    setStepElapsed(0);
    setStepRemaining(durationMs / 1000);
    setCurrentIndex(index);
    warningIssuedRef.current = false;
    sideSwitchIssuedRef.current = false;
    clearSideSwitchCue();

    const exercise = exercises[step.exerciseId];
    const sideSwitchEnabled = exercise?.sideSwitch ?? SIDE_SWITCH_EXERCISE_IDS.has(step.exerciseId);
    const needsSideSwitch = Boolean(sideSwitchEnabled) && step.duration >= 20;
    const halfDurationMs = durationMs / 2;
    const gapAfterSwitchMs = halfDurationMs - WARNING_THRESHOLD_MS;
    const allowWarningAfterSwitch = !needsSideSwitch || gapAfterSwitchMs >= MIN_WARNING_GAP_AFTER_SWITCH_MS;
    const shouldWarnNearEnd = durationMs > WARNING_THRESHOLD_MS && allowWarningAfterSwitch;

    const beginStepTimer = () => {
      pendingPayloadRef.current = null;
      timerRef.current = createPreciseTimer({
        durationMs,
        onTick: (elapsed, remaining) => {
          setStepElapsed(elapsed / 1000);
          setStepRemaining(remaining / 1000);
          if (needsSideSwitch && !sideSwitchIssuedRef.current && elapsed >= halfDurationMs) {
            sideSwitchIssuedRef.current = true;
            playBeep(SIDE_SWITCH_BEEP_FREQUENCY, SIDE_SWITCH_BEEP_DURATION_MS / 1000);
            if (sideSwitchBeepTimeoutRef.current) {
              clearTimeout(sideSwitchBeepTimeoutRef.current);
            }
            sideSwitchBeepTimeoutRef.current = setTimeout(() => {
              playBeep(SIDE_SWITCH_BEEP_FREQUENCY, SIDE_SWITCH_BEEP_DURATION_MS / 1000);
              sideSwitchBeepTimeoutRef.current = null;
            }, SIDE_SWITCH_DOUBLE_BEEP_DELAY_MS);
            // Temporarily disable the spoken prompt to evaluate beep audibility
            // setTimeout(() => {
            //   void playInstruction(labels.sideSwitchCue);
            // }, SIDE_SWITCH_CUE_DELAY_MS);
            setSideSwitchCueActive(true);
            if (sideSwitchCueTimeoutRef.current) {
              clearTimeout(sideSwitchCueTimeoutRef.current);
            }
            sideSwitchCueTimeoutRef.current = setTimeout(() => {
              setSideSwitchCueActive(false);
              sideSwitchCueTimeoutRef.current = null;
            }, SIDE_SWITCH_VISUAL_DURATION_MS);
          }
          if (
            shouldWarnNearEnd &&
            !warningIssuedRef.current &&
            remaining <= WARNING_THRESHOLD_MS &&
            remaining > 0
          ) {
            warningIssuedRef.current = true;
            playBeep(WARNING_BEEP_FREQUENCY, WARNING_BEEP_DURATION_MS / 1000);
          }
        },
        onComplete: () => handleStepComplete(index),
      });
      timerRef.current.start();
      requestMusicPlayback();
    };

    const shouldAnnounce = announce && exercise;
    if (shouldAnnounce) {
      const stepPosition = labels.stepCount
        .replace("{current}", String(index + 1))
        .replace("{total}", String(program.steps.length));
      const instructionParts = [
        `${exercise.name}.`,
        `${stepPosition}.`,
      ];
      if (!omitDescriptions && exercise.description) {
        instructionParts.push(exercise.description);
      }
      instructionParts.push(formatSpeechDuration(step.duration, labels));
      const instruction = instructionParts.join(" ");
      setCurrentInstruction(instruction);
      const token = ++pendingTokenRef.current;
      pendingStartRef.current = { token };
      pendingPayloadRef.current = { index, announce };
      playInstruction(instruction).then(() => {
        if (pendingStartRef.current?.token === token) {
          cancelPendingStart();
          beginStepTimer();
        }
      });
    } else {
      setCurrentInstruction(null);
      beginStepTimer();
    }
    setStatus("running");
    void requestWakeLock();
  };

  useEffect(() => {
    timerRef.current?.stop();
    clearDelay();
    cancelPendingStart();
    pendingPayloadRef.current = null;
    stopInstruction();
    pauseMusic();
    pendingMusicUnlockRef.current = false;
    void releaseWakeLock();
    setStatus("idle");
    setCurrentIndex(0);
    setCompletedSeconds(0);
    setStepElapsed(0);
    setStepRemaining(0);
    setInterrupts(0);
    setCurrentInstruction(null);
    warningIssuedRef.current = false;
    sideSwitchIssuedRef.current = false;
    clearSideSwitchCue();
  }, [pauseMusic, program.id]);

  const handleStart = () => {
    if (!exercisesReady) {
      return;
    }
    startStep(0);
  };

  const handleStepComplete = (completedIndex: number) => {
    playBeep(COMPLETION_BEEP_FREQUENCY, COMPLETION_BEEP_DURATION_MS / 1000);
    const completedDuration = program.steps[completedIndex]?.duration ?? 0;
    setCompletedSeconds((prev) => prev + completedDuration);
    clearDelay();
    cancelPendingStart();
    const nextIndex = completedIndex + 1;
    if (nextIndex >= program.steps.length) {
      finishSession();
      return;
    }
    const token = ++pendingTokenRef.current;
    pendingStartRef.current = { token };
    pendingPayloadRef.current = { index: nextIndex, announce: true };
    delayRef.current = setTimeout(() => {
      if (pendingStartRef.current?.token === token) {
        cancelPendingStart();
        startStep(nextIndex, true);
      }
    }, 2000);
  };

  const finishSession = () => {
    timerRef.current?.stop();
    clearDelay();
    cancelPendingStart();
    pendingPayloadRef.current = null;
    pauseMusic();
    stopInstruction();
    pendingMusicUnlockRef.current = false;
    void releaseWakeLock();
    void playInstruction(labels.completed);
    setStatus("completed");
    void onCompleted(totalSeconds, interrupts);
    setCurrentInstruction(null);
    clearSideSwitchCue();
  };

  const handleReplayInstruction = useCallback(() => {
    if (!currentInstruction) {
      return;
    }
    stopInstruction();
    void playInstruction(currentInstruction);
  }, [currentInstruction, playInstruction, stopInstruction]);

  const handlePause = () => {
    setStatus("paused");
    if (timerRef.current) {
      timerRef.current.pause();
    }
    const hasPendingPayload = Boolean(pendingPayloadRef.current);
    if (hasPendingPayload) {
      cancelPendingStart({ keepPayload: true });
    } else {
      cancelPendingStart();
    }
    clearDelay();
    pauseMusic();
    pendingMusicUnlockRef.current = false;
    stopInstruction();
    void releaseWakeLock();
    setInterrupts((prev) => prev + 1);
  };

  const handleResume = () => {
    if (timerRef.current) {
      timerRef.current.resume();
      setStatus("running");
      requestMusicPlayback();
      return;
    }
    if (pendingPayloadRef.current) {
      const { index, announce } = pendingPayloadRef.current;
      pendingPayloadRef.current = null;
      startStep(index, announce);
    }
  };

  const handleSkip = () => {
    const completedDuration = currentStep?.duration ?? 0;
    setCompletedSeconds((prev) => prev + completedDuration);
    startStep(currentIndex + 1, true);
  };

  const handlePrevious = () => {
    if (currentIndex === 0) {
      startStep(0, true);
      return;
    }
    const previousDuration = program.steps[currentIndex - 1]?.duration ?? 0;
    setCompletedSeconds((prev) => Math.max(0, prev - previousDuration));
    startStep(currentIndex - 1, true);
  };

  const handleRestart = () => {
    if (!currentStep) {
      return;
    }
    startStep(currentIndex, true);
  };

  const progress = currentStep ? Math.min(1, stepElapsed / currentStep.duration) : 0;
  const isActiveStepContext = status === "running" || status === "paused";
  const showReplayButton = isActiveStepContext && Boolean(currentInstruction);

  return (
    <section className="glass-panel px-6 py-6 text-white">
      <header className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {homeHref && (
          <Link
            href={homeHref}
            className="absolute right-0 top-0 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white focus-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {homeLabel ?? "Home"}
          </Link>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/50">
            <span>{labels.ready}</span>
          </div>
          <h2 className="text-2xl font-semibold break-words">{program.name}</h2>
          {currentExercise && (
            <div className="space-y-2">
              <p className="text-sm text-white/70 break-words">
                {currentExercise.name} ({currentIndex + 1} / {program.steps.length})
              </p>
              {currentExercise.description && (
                <p className="text-sm text-white/60 break-words">
                  {labels.descriptionLabel}: {currentExercise.description}
                </p>
              )}
              {showReplayButton && (
                <button
                  type="button"
                  onClick={handleReplayInstruction}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:text-white focus-ring"
                >
                  {labels.repeatDescription}
                </button>
              )}
              <button
                type="button"
                onClick={() => setOmitDescriptions((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/60 transition hover:text-white focus-ring"
              >
                {omitDescriptions ? labels.enableDescriptionNarration : labels.disableDescriptionNarration}
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col items-start gap-3 text-left text-sm text-white/70 sm:items-end sm:text-right">
          <p>
            {labels.elapsed}: {formatSeconds(totalElapsed)}
          </p>
          <p>
            {labels.remaining}: {formatSeconds(Math.max(totalSeconds - totalElapsed, 0))}
          </p>
        </div>
      </header>
      {summaryItems.length > 0 && (
        <div className="mt-6 rounded-2xl bg-white/5 p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-white/60">
            <p className="text-xs uppercase tracking-[0.3em] leading-tight">
              {labels.summaryHeading}
            </p>
            <p className="text-sm font-semibold text-white/80 whitespace-nowrap text-right sm:text-base">
              {formatDuration(totalSeconds)}
            </p>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {summaryItems.map((item) => {
              const isActive = isActiveStepContext && item.index === currentIndex;
              const titleClass = cn(
                "font-medium",
                isActive ? "text-orange-200" : "text-white"
              );
              const durationClass = cn(
                isActive ? "text-orange-200/80" : "text-white/70"
              );
              return (
                <li
                  key={item.id}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-xl px-3 py-2 transition",
                    isActive ? "bg-white/10 text-white shadow-lg shadow-amber-300/25" : "bg-white/5 text-white/80"
                  )}
                >
                  <span className={titleClass}>
                    {item.index + 1}. {item.title}
                  </span>
                  <span className={durationClass}>{formatDuration(item.duration)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex w-full flex-col items-center gap-4 lg:w-auto">
          <svg className="ring-progress" viewBox="0 0 120 120" role="img" aria-label="Progression">
            <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="transparent" />
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="url(#progress)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={Math.PI * 2 * 54}
              strokeDashoffset={(1 - progress) * Math.PI * 2 * 54}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="progress" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill={sideSwitchCueActive ? "#f87171" : "#fff"}
            >
              {formatSeconds(Math.max(stepRemaining, 0))}
            </text>
          </svg>
          <div className="flex w-full flex-wrap justify-center gap-3 sm:justify-start">
            {(status === "idle" || status === "completed") && (
              <Button onClick={handleStart} disabled={!exercisesReady}>
                {labels.start}
              </Button>
            )}
            {status === "running" && (
              <Button onClick={handlePause}>{labels.pause}</Button>
            )}
            {status === "paused" && (
              <Button onClick={handleResume}>{labels.resume}</Button>
            )}
            {(status === "running" || status === "paused") && (
              <Button onClick={handleSkip} variant="ghost">
                {labels.skip}
              </Button>
            )}
            {(status === "running" || status === "paused") && (
              <Button onClick={handlePrevious} variant="ghost" disabled={currentIndex === 0}>
                {labels.previous}
              </Button>
            )}
            {(status === "running" || status === "paused") && (
              <Button
                onClick={handleRestart}
                variant="ghost"
                disabled={stepElapsed === 0 || !currentStep}
              >
                {labels.restart}
              </Button>
            )}
          </div>
        </div>
        <div className="w-full flex-1 space-y-4">
          <div className="rounded-2xl bg-white/5 p-4 break-words">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{labels.next}</p>
            {nextStep ? (
              <div className="space-y-1">
                <p className="text-lg font-semibold break-words">{nextExercise?.name ?? nextStep.exerciseId}</p>
                <p className="text-sm text-white/70">{formatDuration(nextStep.duration)}</p>
                {nextExercise?.description && (
                  <p className="text-xs text-white/60 break-words">{nextExercise.description}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/70">{labels.completed}</p>
            )}
          </div>
          <div className="w-full">
            <MusicPanel
              label={labels.music}
              volumeLabel={labels.volume}
              muteLabel={labels.mute}
              unmuteLabel={labels.unmute}
              volume={volume}
              isMuted={isMuted}
              onVolume={changeVolume}
              onToggleMute={toggleMute}
              musicUrl={program.musicUrl}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Button({
  children,
  onClick,
  variant = "solid",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "solid" | "ghost";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "rounded-full px-5 py-2 text-sm font-semibold focus-ring text-center min-w-[130px]",
        variant === "solid" ? "bg-white text-slate-900" : "border border-white/40 text-white",
        disabled && "cursor-not-allowed opacity-40"
      )}
    >
      {children}
    </button>
  );
}

function formatSpeechDuration(seconds: number, labels: RunControllerProps["labels"]) {
  if (!Number.isFinite(seconds)) {
    return `0 ${labels.secondPlural}`;
  }
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  const parts: string[] = [];
  if (minutes > 0) {
    const unit = minutes === 1 ? labels.minuteSingular : labels.minutePlural;
    parts.push(`${minutes} ${unit}`);
  }
  if (remainder > 0 || parts.length === 0) {
    const unit = remainder === 1 ? labels.secondSingular : labels.secondPlural;
    parts.push(`${remainder} ${unit}`);
  }
  return parts.join(" ");
}

