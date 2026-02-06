import { BuilderCanvas } from "@/components/builder/BuilderCanvas";
import { getTranslations } from "next-intl/server";

interface BuilderPageProps {
  searchParams: Promise<{ programId?: string | string[] }> | { programId?: string | string[] };
}

export default async function BuilderPage({ searchParams }: BuilderPageProps) {
  const [query, t] = await Promise.all([Promise.resolve(searchParams), getTranslations("builder")]);
  const rawId = query?.programId;
  const programId = Array.isArray(rawId) ? rawId[0] : rawId;

  return (
    <BuilderCanvas
      programId={programId}
      labels={{
        title: t("title"),
        nameLabel: t("nameLabel"),
        musicLabel: t("musicLabel"),
        notes: t("notes"),
        save: t("save"),
        add: t("add"),
        total: t("total"),
        duration: t("duration"),
        duplicate: t("duplicate"),
        success: t("success"),
        error: t("error"),
        emptyTimeline: t("emptyTimeline"),
        filters: t("filters"),
        zone: t("zone"),
        intensity: t("intensity"),
        reset: t("reset"),
        search: t("search"),
      }}
    />
  );
}
