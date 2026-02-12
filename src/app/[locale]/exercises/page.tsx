import { ExercisesManager } from "@/components/exercises/ExercisesManager";
import { defaultLocale } from "@/i18n/config";
import { getTranslations } from "next-intl/server";

interface ExercisesPageProps {
  params: Promise<{ locale?: string }> | { locale?: string };
}

export default async function ExercisesPage({ params }: ExercisesPageProps) {
  const routeParams = await Promise.resolve(params);
  const locale = routeParams?.locale ?? defaultLocale;
  const t = await getTranslations("exercises");

  return (
    <ExercisesManager
      locale={locale}
      labels={{
        title: t("title"),
        intro: t("intro"),
        countLabel: t("countLabel", { current: "{current}", total: "{total}" }),
        filters: t("filters"),
        zone: t("zone"),
        intensity: t("intensity"),
        reset: t("reset"),
        search: t("search"),
        emptyState: t("emptyState"),
        editAction: t("editAction"),
        editPanelTitle: t("editPanelTitle"),
        editNameLabel: t("editNameLabel"),
        editDescriptionLabel: t("editDescriptionLabel"),
        editPlaceholder: t("editPlaceholder"),
        lastUpdateLabel: t("lastUpdateLabel"),
        editSave: t("editSave"),
        editCancel: t("editCancel"),
        editSuccess: t("editSuccess"),
        editError: t("editError"),
        zoneOptions: {
          all: t("zoneOptions.all"),
          legs: t("zoneOptions.legs"),
          arms: t("zoneOptions.arms"),
          core: t("zoneOptions.core"),
          full: t("zoneOptions.full"),
        },
        intensityOptions: {
          all: t("intensityOptions.all"),
          low: t("intensityOptions.low"),
          medium: t("intensityOptions.medium"),
          high: t("intensityOptions.high"),
        },
      }}
    />
  );
}
