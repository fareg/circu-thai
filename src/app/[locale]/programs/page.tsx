import { ProgramsBoard } from "@/components/programs/ProgramsBoard";
import { getTranslations } from "next-intl/server";

interface ProgramsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProgramsPage({ params }: ProgramsPageProps) {
  const [{ locale }, t] = await Promise.all([params, getTranslations("programs")]);
  return (
    <ProgramsBoard
      locale={locale}
      labels={{
        title: t("title"),
        empty: t("empty"),
        run: t("run"),
        delete: t("delete"),
        total: t("total"),
        export: t("export"),
        import: t("import"),
        sessions: t("sessions"),
        edit: t("edit"),
        duplicate: t("duplicate"),
        copySuffix: t("copySuffix"),
        duplicateSuccess: t("duplicateSuccess"),
        duplicateError: t("duplicateError"),
      }}
    />
  );
}
