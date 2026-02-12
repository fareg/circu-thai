import { SoundTestLab } from "@/components/run/SoundTestLab";
import { curatedTracks } from "@/lib/audio/library";
import { getTranslations } from "next-intl/server";

interface SoundTestPageProps {
  params: Promise<{ locale: string }>;
}

const SAMPLE_TRACK = curatedTracks[0]?.url ?? "";

export default async function SoundTestPage({ params }: SoundTestPageProps) {
  const [{ locale }, soundTestT, runT, navT] = await Promise.all([
    params,
    getTranslations("soundTest"),
    getTranslations("run"),
    getTranslations("nav"),
  ]);
  const homeHref = `/${locale}`;

  return (
    <SoundTestLab
      sampleMusicUrl={SAMPLE_TRACK}
      sampleOptions={curatedTracks.map((track) => ({ label: track.label, url: track.url }))}
      homeHref={homeHref}
      homeLabel={navT("home")}
      labels={{
        title: soundTestT("title"),
        intro: soundTestT("intro"),
        instructionHeading: soundTestT("instructionHeading"),
        instructionPlaceholder: soundTestT("instructionPlaceholder"),
        defaultInstruction: soundTestT("defaultInstruction"),
        speak: soundTestT("speak"),
        completionBeep: soundTestT("completionBeep"),
        warningBeep: soundTestT("warningBeep"),
        sideSwitchBeep: soundTestT("sideSwitchBeep"),
        sideSwitchDoubleBeep: soundTestT("sideSwitchDoubleBeep"),
        musicHeading: soundTestT("musicHeading"),
        sampleLabel: soundTestT("sampleLabel"),
        sampleSelectLabel: soundTestT("sampleSelectLabel"),
        customLabel: soundTestT("customLabel"),
        customPlaceholder: soundTestT("customPlaceholder"),
        loadCustom: soundTestT("loadCustom"),
        play: soundTestT("play"),
        pause: soundTestT("pause"),
        stop: soundTestT("stop"),
        timelineHeading: soundTestT("timelineHeading"),
        statusHeading: soundTestT("statusHeading"),
        statusIdle: soundTestT("statusIdle"),
        statusLoaded: soundTestT("statusLoaded", { track: "{track}" }),
        statusStopped: soundTestT("statusStopped"),
        statusInstructionMissing: soundTestT("statusInstructionMissing"),
        statusUrlMissing: soundTestT("statusUrlMissing"),
        statusInstructionQueued: soundTestT("statusInstructionQueued"),
        statusBeepPlayed: soundTestT("statusBeepPlayed"),
        statusPlaying: soundTestT("statusPlaying", { track: "{track}" }),
        statusPaused: soundTestT("statusPaused"),
        volumeLabel: runT("volume"),
        muteLabel: runT("mute"),
        unmuteLabel: runT("unmute"),
      }}
    />
  );
}
