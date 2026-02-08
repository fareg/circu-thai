import { Howl } from "howler";

export class MusicController {
  private howl: Howl | null = null;
  private volume = 0.5;
  private duckDepth = 1;
  private duckTimeout: ReturnType<typeof setTimeout> | null = null;

  load(src?: string) {
    if (!src) {
      this.halt();
      return;
    }
    this.halt();
    this.howl = new Howl({
      src: [src],
      loop: true,
      volume: this.volume,
      html5: true,
      preload: true,
    });
  }

  play() {
    if (!this.howl) {
      return;
    }
    if (this.howl.playing()) {
      return;
    }
    this.howl.play();
  }

  pause() {
    this.howl?.pause();
  }

  halt() {
    this.clearDuck();
    if (this.howl) {
      this.howl.unload();
      this.howl = null;
    }
  }

  setVolume(next: number) {
    this.volume = Math.min(1, Math.max(0, next));
    if (this.howl) {
      this.howl.volume(this.volume * this.duckDepth);
    }
  }

  getVolume() {
    return this.volume;
  }

  getPosition() {
    if (!this.howl) {
      return 0;
    }
    const position = this.howl.seek();
    return typeof position === "number" ? position : 0;
  }

  getDuration() {
    return this.howl?.duration() ?? 0;
  }

  seek(seconds: number) {
    if (!this.howl) {
      return;
    }
    const duration = this.howl.duration();
    const target = Math.min(Math.max(seconds, 0), duration || 0);
    this.howl.seek(target);
  }

  duck(depth = 0.25, sustainMs = 400, fadeMs = 120) {
    if (!this.howl || !this.howl.playing()) {
      return;
    }
    const clampedDepth = Math.min(1, Math.max(0, depth));
    if (clampedDepth === 1) {
      return;
    }
    if (this.duckTimeout) {
      clearTimeout(this.duckTimeout);
    }
    this.duckDepth = clampedDepth;
    const target = this.volume * this.duckDepth;
    const current = this.howl.volume();
    this.howl.fade(current, target, fadeMs);
    this.duckTimeout = setTimeout(() => {
      if (!this.howl) {
        return;
      }
      this.duckDepth = 1;
      this.howl.fade(this.howl.volume(), this.volume, fadeMs);
      this.duckTimeout = null;
    }, sustainMs);
  }

  private clearDuck() {
    if (this.duckTimeout) {
      clearTimeout(this.duckTimeout);
      this.duckTimeout = null;
    }
    this.duckDepth = 1;
  }
}
