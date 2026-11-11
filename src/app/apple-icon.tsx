import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS home-screen icon: same mark as app/icon.svg, rendered to PNG. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#16181d",
        }}
      >
        <svg width="110" height="110" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" fill="none" stroke="#fafaf9" strokeWidth="2" />
          <path d="M3 21 L21 3 L21 21 Z" fill="#1f4fff" />
        </svg>
      </div>
    ),
    size,
  );
}
