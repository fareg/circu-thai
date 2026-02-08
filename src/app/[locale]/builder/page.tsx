import { BuilderCanvas } from "@/components/builder/BuilderCanvas";
import { defaultLocale } from "@/i18n/config";
import { getTranslations } from "next-intl/server";

interface BuilderPageProps {
  params: Promise<{ locale?: string }> | { locale?: string };
  searchParams: Promise<{ programId?: string | string[] }> | { programId?: string | string[] };
}

export default async function BuilderPage({ searchParams, params }: BuilderPageProps) {
  const [query, routeParams, t] = await Promise.all([
    Promise.resolve(searchParams),
    Promise.resolve(params),
    getTranslations("builder"),
  ]);
  const rawId = query?.programId;
  const programId = Array.isArray(rawId) ? rawId[0] : rawId;
  const locale = routeParams?.locale ?? defaultLocale;

  return (
    <BuilderCanvas
      locale={locale}
      programId={programId}
      labels={{
        title: t("title"),
        nameLabel: t("nameLabel"),
        musicLabel: t("musicLabel"),
        musicPresetLabel: t("musicPresetLabel"),
        musicPresetPlaceholder: t("musicPresetPlaceholder"),
        musicCredit: t("musicCredit"),
        notes: t("notes"),
        save: t("save"),
        add: t("add"),
        total: t("total"),
        duration: t("duration"),
        duplicate: t("duplicate"),
        success: t("success"),
        error: t("error"),
        emptyTimeline: t("emptyTimeline"),
        lastUpdate: t("lastUpdate"),
        filters: t("filters"),
        zone: t("zone"),
        intensity: t("intensity"),
        reset: t("reset"),
        search: t("search"),
      }}
    />
  );
}
