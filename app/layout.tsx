// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Importamos tus Providers existentes
import { Providers } from "@/components/Providers";

// Importamos el nuevo Provider del Login y el Modal Global
import { LoginProvider } from "@/context/LoginContext";
import GlobalLoginModal from "@/components/tourist/GlobalLoginModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MexGo",
  description: "Find Your Next Adventure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Envolvemos todo en tu Provider original */}
        <Providers>
          {/* Y anidamos el nuevo LoginProvider */}
          <LoginProvider>
            {children}
            {/* Colocamos el Modal Global aquí para que flote sobre todo */}
            <GlobalLoginModal />
          </LoginProvider>
        </Providers>
      </body>
    </html>
  );
}