import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PeeBoard",
    short_name: "PeeBoard",
    description: "PeeBoard - Tracking Lượt Nhận Xu Livestream Shopee",
    start_url: "/",
    display: "standalone",
    background_color: "#ee4d2d",
    theme_color: "#ee4d2d",
    icons: [
      {
        src: "/app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
