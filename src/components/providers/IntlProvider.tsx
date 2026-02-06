"use client";

import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";

interface IntlProviderProps {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}

export function IntlProvider({ children, locale, messages }: IntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Paris">
      {children}
    </NextIntlClientProvider>
  );
}
