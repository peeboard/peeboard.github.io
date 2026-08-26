import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PeeBoard",
  description: "Minimal livestream coin progress tracker",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/app-icon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
    ],
    shortcut: "/favicon.ico",
    apple: [{
      url: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    }],
  },
  appleWebApp: {
    capable: true,
    title: "PeeBoard",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ee4d2d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
