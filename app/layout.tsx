import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/providers/query-provider";

// Using CDN fonts as fallback for Turbopack compatibility
// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
//   display: "swap",
// });

// const jetbrainsMono = JetBrains_Mono({
//   subsets: ["latin"],
//   variable: "--font-jetbrains-mono",
//   display: "swap",
// });

export const metadata: Metadata = {
  title: "University Attendance System",
  description: "Modern digital attendance tracking system for universities",
  keywords: ["attendance", "university", "education", "tracking", "digital"],
  authors: [{ name: "University Attendance System" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <QueryProvider>
          <Toaster position="bottom-center" richColors expand={false} />
          <div id="root">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}
