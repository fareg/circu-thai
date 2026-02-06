import { RunScreen } from "@/components/run/RunScreen";
import { getTranslations } from "next-intl/server";

interface RunPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function RunPage({ params }: RunPageProps) {
  const [{ id, locale }, t] = await Promise.all([params, getTranslations("run")]);
  const localePrefix = `/${locale}`;
  return (
    <RunScreen
      programId={id}
      logLabel={t("log")}
      missingLabel={t("missing")}
      builderHref={`${localePrefix}/builder`}
      programsHref={`${localePrefix}/programs`}
      runBaseHref={`${localePrefix}/run`}
      labels={{
        ready: t("ready"),
        start: t("start"),
        pause: t("pause"),
        resume: t("resume"),
        skip: t("skip"),
        next: t("next"),
        completed: t("completed"),
        elapsed: t("elapsed"),
        remaining: t("remaining"),
        music: t("music"),
        volume: t("volume"),
        mute: t("mute"),
        unmute: t("unmute"),
        missingHint: t("missingHint"),
        missingEmpty: t("missingEmpty"),
        openBuilder: t("openBuilder"),
        viewPrograms: t("viewPrograms"),
      }}
    />
  );
}
