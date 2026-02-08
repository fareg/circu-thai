import { Howl } from "howler";

export class MusicController {
  private howl: Howl | null = null;
  private volume = 0.5;

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
    if (this.howl) {
      this.howl.unload();
      this.howl = null;
    }
  }

  setVolume(next: number) {
    this.volume = Math.min(1, Math.max(0, next));
    if (this.howl) {
      this.howl.volume(this.volume);
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
}
