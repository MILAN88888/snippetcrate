import React from "react";

/**
 * Brand mark: angle brackets framing two code lines — a "code snippet" in a
 * soft teal gradient tile.
 */
const Logo: React.FC = () => (
  <div
    className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
    style={{
      background:
        "linear-gradient(135deg, oklch(0.63 0.13 228), oklch(0.47 0.15 236))"
    }}
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className="size-7"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke="currentColor"
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 15 L9 24 L17 33" />
        <path d="M31 15 L39 24 L31 33" />
        <path d="M21 20 H28" opacity={0.9} />
        <path d="M21 28 H26" opacity={0.9} />
      </g>
    </svg>
  </div>
);

export default Logo;
