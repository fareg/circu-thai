import { RunScreen } from "@/components/run/RunScreen";
import { getTranslations } from "next-intl/server";

interface RunPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function RunPage({ params }: RunPageProps) {
  const [{ id, locale }, tRun, tNav] = await Promise.all([params, getTranslations("run"), getTranslations("nav")]);
  const localePrefix = `/${locale}`;
  return (
    <RunScreen
      programId={id}
      logLabel={tRun("log")}
      missingLabel={tRun("missing")}
      builderHref={`${localePrefix}/builder`}
      programsHref={`${localePrefix}/programs`}
      runBaseHref={`${localePrefix}/run`}
      homeHref={localePrefix}
      homeLabel={tNav("home")}
      labels={{
        ready: tRun("ready"),
        start: tRun("start"),
        pause: tRun("pause"),
        resume: tRun("resume"),
        skip: tRun("skip"),
        previous: tRun("previous"),
        restart: tRun("restart"),
        next: tRun("next"),
        completed: tRun("completed"),
        elapsed: tRun("elapsed"),
        remaining: tRun("remaining"),
        summaryHeading: tRun("summaryHeading"),
        music: tRun("music"),
        volume: tRun("volume"),
        mute: tRun("mute"),
        unmute: tRun("unmute"),
        missingHint: tRun("missingHint"),
        missingEmpty: tRun("missingEmpty"),
        openBuilder: tRun("openBuilder"),
        viewPrograms: tRun("viewPrograms"),
        stepCount: tRun("stepCount", { current: "{current}", total: "{total}" }),
        descriptionLabel: tRun("descriptionLabel"),
        minuteSingular: tRun("minuteSingular"),
        minutePlural: tRun("minutePlural"),
        secondSingular: tRun("secondSingular"),
        secondPlural: tRun("secondPlural"),
      }}
    />
  );
}
