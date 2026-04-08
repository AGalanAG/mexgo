import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';

import { Providers } from "@/components/Providers";
import { LoginProvider } from "@/context/LoginContext";
import GlobalLoginModal from "@/components/tourist/GlobalLoginModal";
import GlobalRegisterModal from "@/components/tourist/GlobalRegisterModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MexGo - Mundial 2026",
  description: "Personaliza tu experiencia para el Mundial 2026",
};

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
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            <LoginProvider>
              {children}
              <GlobalLoginModal />
              <GlobalRegisterModal />
            </LoginProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}