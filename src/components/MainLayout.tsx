import React from "react";
import Router from "./router/Router";
import { Toaster } from "@/components/ui/sonner";

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <main className="mx-auto w-full max-w-[1400px] px-4 py-7 md:px-8">
        <Router />
      </main>
      <Toaster position="bottom-right" richColors />
    </div>
  );
};

export default MainLayout;
