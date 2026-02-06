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
    });
  }

  play() {
    this.howl?.play();
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
}
