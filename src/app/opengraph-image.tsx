import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "linear-gradient(180deg, #D6DCF2 0%, #C8D1EC 55%, #BCC6E6 100%)",
        color: "#0B0D14",
      }}
    >
      {/* RAVENS wordmark (crossbar-less Λ), inlined because ImageResponse can't resolve currentColor. */}
      <svg width="568" height="120" viewBox="0 0 284 60" fill="none" stroke="#0B0D14" strokeWidth="2.2">
        <path d="M5 57V4h18a14 14 0 0 1 0 28H5M22 32l13 25" />
        <path d="M52 57L72 4l20 53" />
        <path d="M104 4l20 53 20-53" />
        <path d="M190 4h-30v53h30M160 30h26" />
        <path d="M204 57V4l31 53V4" />
        <path d="M277 13C272 5 249 3 249 18c0 14 28 11 28 25 0 15-24 14-29 5" />
      </svg>
      <div style={{ fontSize: 40, letterSpacing: 6, textTransform: "uppercase", color: "#2A2D3E" }}>
        {siteConfig.tagline}
      </div>
    </div>,
    size,
  );
}
