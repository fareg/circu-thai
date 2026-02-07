const fs = require("fs");
const path = require("path");

const sampleRate = 44100;
const duration = 4; // seconds
const tones = [
  { freq: 432, name: "test-tone-a.wav" },
  { freq: 528, name: "test-tone-b.wav" },
  { freq: 660, name: "test-tone-c.wav" },
];
const outDir = path.join(process.cwd(), "public", "audio");
fs.mkdirSync(outDir, { recursive: true });

function createTone(freq) {
  const samples = sampleRate * duration;
  const dataLength = samples * 2;
  const buffer = Buffer.alloc(44 + dataLength);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * freq * t);
    const clamped = Math.max(-1, Math.min(1, sample));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  return buffer;
}

for (const tone of tones) {
  const filePath = path.join(outDir, tone.name);
  fs.writeFileSync(filePath, createTone(tone.freq));
  console.log(`Wrote ${filePath}`);
}
