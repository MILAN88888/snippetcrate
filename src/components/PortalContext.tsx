import * as React from "react";

/**
 * Radix overlays (Select, Popover, DropdownMenu, Tooltip) portal to
 * document.body by default — outside #snippet-master — where our
 * `important: '#snippet-master'` Tailwind utilities no longer match. We provide
 * the mount element here and pass it as each overlay's `container` so portalled
 * content stays inside the scoped subtree and is styled correctly.
 */
const PortalContainerContext = React.createContext<HTMLElement | null>(null);

export const PortalContainerProvider = PortalContainerContext.Provider;

export const usePortalContainer = (): HTMLElement | null =>
  React.useContext(PortalContainerContext);
