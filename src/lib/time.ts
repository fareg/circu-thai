export function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "0 s";
  }
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;

  if (minutes === 0) {
    return `${remainder} s`;
  }
  if (remainder === 0) {
    return `${minutes} min`;
  }
  return `${minutes} min ${remainder.toString().padStart(2, "0")} s`;
}
