import React from "react";

/**
 * Brand mark: a crate with an overhanging lid holding a code caret, on the
 * SnippetCrate gradient tile.
 */
const Logo: React.FC = () => (
  <div
    className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
    style={{
      background:
        "linear-gradient(135deg, oklch(0.78 0.13 205), oklch(0.44 0.17 274))"
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
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <rect x="9" y="20" width="30" height="21" rx="3.5" />
        <rect x="5" y="11" width="38" height="9" rx="2.5" />
        <path d="M22 27 L18.5 30.8 L22 34.6" />
        <path d="M26 27 L29.5 30.8 L26 34.6" />
      </g>
    </svg>
  </div>
);

export default Logo;
