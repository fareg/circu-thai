"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Exercise, ProgramRecord } from "@/types";
import { createPreciseTimer, formatSeconds, PreciseTimer } from "@/lib/timer";
import { useAudioController } from "@/hooks/useAudioController";
import { MusicPanel } from "./MusicPanel";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/time";

interface RunControllerProps {
  program: ProgramRecord;
  exercises: Record<string, Exercise>;
  labels: {
    start: string;
    pause: string;
    resume: string;
    skip: string;
    next: string;
    completed: string;
    ready: string;
    elapsed: string;
    remaining: string;
    music: string;
    volume: string;
    mute: string;
    unmute: string;
  };
  onCompleted: (durationSeconds: number, interruptCount: number) => Promise<void> | void;
}

type RunStatus = "idle" | "running" | "paused" | "completed";

export function RunController({ program, exercises, labels, onCompleted }: RunControllerProps) {
  const { playInstruction, playBeep, loadMusic, playMusic, pauseMusic, changeVolume, toggleMute, volume, isMuted } =
    useAudioController();
  const [status, setStatus] = useState<RunStatus>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stepElapsed, setStepElapsed] = useState(0);
  const [stepRemaining, setStepRemaining] = useState(0);
  const [completedSeconds, setCompletedSeconds] = useState(0);
  const [interrupts, setInterrupts] = useState(0);
  const timerRef = useRef<PreciseTimer | null>(null);
  const delayRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = program.steps[currentIndex];
  const nextStep = program.steps[currentIndex + 1];
  const currentExercise = currentStep ? exercises[currentStep.exerciseId] : undefined;

  const totalSeconds = useMemo(() => program.steps.reduce((total, step) => total + step.duration, 0), [program.steps]);
  const totalElapsed = completedSeconds + stepElapsed;

  useEffect(() => {
    loadMusic(program.musicUrl);
  }, [loadMusic, program.musicUrl]);

  useEffect(() => () => {
    timerRef.current?.stop();
    if (delayRef.current) {
      clearTimeout(delayRef.current);
    }
  }, []);

  useEffect(() => {
    setStatus("idle");
    setCurrentIndex(0);
    setCompletedSeconds(0);
    setStepElapsed(0);
    setStepRemaining(0);
    setInterrupts(0);
  }, [program.id]);

  const startStep = (index: number, announce = true) => {
    timerRef.current?.stop();
    if (delayRef.current) {
      clearTimeout(delayRef.current);
    }
    const step = program.steps[index];
    if (!step) {
      finishSession();
      return;
    }
    const durationMs = step.duration * 1000;
    setStepElapsed(0);
    setStepRemaining(durationMs / 1000);
    setCurrentIndex(index);
    const exercise = exercises[step.exerciseId];
    if (announce && exercise) {
      playInstruction(`${exercise.name} ${formatDuration(step.duration)}`);
    }
    timerRef.current = createPreciseTimer({
      durationMs,
      onTick: (elapsed, remaining) => {
        setStepElapsed(elapsed / 1000);
        setStepRemaining(remaining / 1000);
      },
      onComplete: handleStepComplete,
    });
    timerRef.current.start();
    playMusic();
    setStatus("running");
  };

  const handleStepComplete = () => {
    playBeep();
    setCompletedSeconds((prev) => prev + (currentStep?.duration ?? 0));
    if (delayRef.current) {
      clearTimeout(delayRef.current);
    }
    delayRef.current = setTimeout(() => startStep(currentIndex + 1, false), 2000);
  };

  const finishSession = () => {
    timerRef.current?.stop();
    pauseMusic();
    setStatus("completed");
    void onCompleted(totalSeconds, interrupts);
  };

  const handleStart = () => {
    setCompletedSeconds(0);
    setStepElapsed(0);
    setInterrupts(0);
    startStep(0);
  };

  const handlePause = () => {
    setStatus("paused");
    timerRef.current?.pause();
    pauseMusic();
    setInterrupts((prev) => prev + 1);
  };

  const handleResume = () => {
    timerRef.current?.resume();
    setStatus("running");
    playMusic();
  };

  const handleSkip = () => {
    setCompletedSeconds((prev) => prev + (currentStep?.duration ?? 0));
    startStep(currentIndex + 1);
  };

  const progress = currentStep ? Math.min(1, stepElapsed / currentStep.duration) : 0;

  return (
    <section className="glass-panel px-6 py-6 text-white">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">{labels.ready}</p>
          <h2 className="text-2xl font-semibold">{program.name}</h2>
          {currentExercise && <p className="text-sm text-white/70">{currentExercise.name}</p>}
        </div>
        <div className="text-right text-sm text-white/70">
          <p>
            {labels.elapsed}: {formatSeconds(totalElapsed)}
          </p>
          <p>
            {labels.remaining}: {formatSeconds(Math.max(totalSeconds - totalElapsed, 0))}
          </p>
        </div>
      </header>
      <div className="mt-8 flex flex-col items-center gap-8 lg:flex-row">
        <div className="flex flex-col items-center gap-4">
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
                <stop offset="0%" stopColor="#6cfac4" />
                <stop offset="100%" stopColor="#ff9c73" />
              </linearGradient>
            </defs>
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#fff">
              {formatSeconds(Math.max(stepRemaining, 0))}
            </text>
          </svg>
          <div className="flex gap-3">
            {status === "idle" && (
              <Button onClick={handleStart}>{labels.start}</Button>
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
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{labels.next}</p>
            {nextStep ? (
              <div>
                <p className="text-lg font-semibold">{exercises[nextStep.exerciseId]?.name ?? nextStep.exerciseId}</p>
                <p className="text-sm text-white/70">{formatDuration(nextStep.duration)}</p>
              </div>
            ) : (
              <p className="text-sm text-white/70">{labels.completed}</p>
            )}
          </div>
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
    </section>
  );
}

function Button({ children, onClick, variant = "solid" }: { children: React.ReactNode; onClick: () => void; variant?: "solid" | "ghost" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-5 py-2 text-sm font-semibold focus-ring",
        variant === "solid" ? "bg-white text-slate-900" : "border border-white/40 text-white"
      )}
    >
      {children}
    </button>
  );
}
