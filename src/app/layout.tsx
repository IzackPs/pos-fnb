import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { I18nProvider } from "@/i18n/context";
import { DeviceProvider } from "@/components/shared/device-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "POS F&B",
  description: "POS F&B",
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <DeviceProvider>
          <I18nProvider>
            <SessionProvider>
              <TooltipProvider>
                {children}
                <Toaster position="top-center" richColors />
              </TooltipProvider>
            </SessionProvider>
          </I18nProvider>
        </DeviceProvider>
      </body>
    </html>
  );
}
