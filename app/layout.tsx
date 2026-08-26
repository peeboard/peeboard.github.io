import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://peeboard.github.io"),
  title: "PeeBoard",
  description: "PeeBoard - Tracking Lượt Nhận Xu Livestream Shopee",
  openGraph: {
    title: "PeeBoard",
    description: "PeeBoard - Tracking Lượt Nhận Xu Livestream Shopee",
    url: "https://peeboard.github.io",
    siteName: "PeeBoard",
    type: "website",
    images: [{
      url: "/app-icon-1024.png?v=2",
      width: 1024,
      height: 1024,
      alt: "PeeBoard",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PeeBoard",
    description: "PeeBoard - Tracking Lượt Nhận Xu Livestream Shopee",
    images: ["/app-icon-1024.png?v=2"],
  },
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
