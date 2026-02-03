"use client";

import { useEffect, useState } from "react";
import { FSService } from "@/lib/fs-service";

/**
 * App Initializer - Initialize app data directories on startup
 * This component runs once when the app loads
 */
export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log("🚀 App starting - initializing file system...");
        await FSService.initializeAppData();
        setInitialized(true);
        console.log("✅ App initialization complete");
      } catch (err) {
        console.error("❌ App initialization failed:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    initApp();
  }, []);

  // Show loading state while initializing
  if (!initialized && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing Sermon Vault...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Initialization Failed</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render app when initialized
  return <>{children}</>;
}
