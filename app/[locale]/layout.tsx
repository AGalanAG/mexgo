import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Providers } from "@/components/Providers";
import { LoginProvider } from "@/context/LoginContext";
import GlobalLoginModal from "@/components/tourist/GlobalLoginModal";
import GlobalRegisterModal from "@/components/tourist/GlobalRegisterModal";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Providers>
        <LoginProvider>
          {children}
          <GlobalLoginModal />
          <GlobalRegisterModal />
        </LoginProvider>
      </Providers>
    </NextIntlClientProvider>
  );
}
