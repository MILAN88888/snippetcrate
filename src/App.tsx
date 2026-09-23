import React from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import MainLayout from "./components/MainLayout";
import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PortalContainerProvider } from "@/components/PortalContext";
import "./style/globals.css";

const queryClient = new QueryClient();

const App: React.FC = () => {
  // Radix overlays portal here so their content stays inside the scoped subtree.
  const portalContainer =
    typeof document !== "undefined"
      ? document.getElementById("snippetcrate-app")
      : null;

  return (
    <ErrorBoundary>
      <HashRouter>
        <QueryClientProvider client={queryClient}>
          <PortalContainerProvider value={portalContainer}>
            <TooltipProvider delayDuration={200}>
              <MainLayout />
            </TooltipProvider>
          </PortalContainerProvider>
        </QueryClientProvider>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
