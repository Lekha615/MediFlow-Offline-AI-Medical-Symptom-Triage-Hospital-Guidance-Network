import React, { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MediFlowAssistant } from "../assistant/MediFlowAssistant";
import { ErrorBoundary } from "../common/ErrorBoundary";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onToggleAssistant={() => setAssistantOpen((prev) => !prev)}
        isAssistantOpen={assistantOpen}
      />
      <div className="flex flex-1 relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main
          className={`flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto transition-all ${
            assistantOpen ? "sm:pr-80 md:pr-96" : ""
          }`}
        >
          <ErrorBoundary fallbackTitle="Workspace Section Unavailable">
            {children}
          </ErrorBoundary>
        </main>

        <MediFlowAssistant
          isOpen={assistantOpen}
          onClose={() => setAssistantOpen(false)}
        />
      </div>
    </div>
  );
};

export default DashboardLayout;
