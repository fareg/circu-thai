import { AppChrome } from "@/components/layout/AppChrome";
import { IntlProvider } from "@/components/providers/IntlProvider";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale || defaultLocale) as Locale;
  if (!locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <IntlProvider locale={locale} messages={messages}>
      <AppChrome locale={locale}>{children}</AppChrome>
    </IntlProvider>
  );
}
