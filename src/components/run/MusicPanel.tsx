"use client";

interface MusicPanelProps {
  musicUrl?: string;
  label: string;
  volumeLabel: string;
  muteLabel: string;
  unmuteLabel: string;
  volume: number;
  isMuted: boolean;
  onVolume: (value: number) => void;
  onToggleMute: () => void;
}

export function MusicPanel({
  musicUrl,
  label,
  volumeLabel,
  muteLabel,
  unmuteLabel,
  volume,
  isMuted,
  onVolume,
  onToggleMute,
}: MusicPanelProps) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">{label}</p>
          <p className="text-sm text-white/80">{musicUrl ?? "-"}</p>
        </div>
        <button type="button" onClick={onToggleMute} className="rounded-full border border-white/30 px-3 py-1 text-xs">
          {isMuted ? unmuteLabel : muteLabel}
        </button>
      </div>
      <label className="mt-4 flex flex-col gap-2 text-sm text-white/80">
        <span>{volumeLabel}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(event) => onVolume(Number(event.target.value))}
        />
      </label>
    </div>
  );
}
