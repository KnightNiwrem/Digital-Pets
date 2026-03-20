import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SW_UPDATE_EVENT, skipWaitingAndReload } from "@/sw-register";

export function UpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const handler = () => setUpdateAvailable(true);
    window.addEventListener(SW_UPDATE_EVENT, handler);
    return () => window.removeEventListener(SW_UPDATE_EVENT, handler);
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between gap-2 shadow-md">
      <span className="text-sm font-medium">A new version is available</span>
      <Button size="sm" variant="secondary" onClick={skipWaitingAndReload}>
        Reload
      </Button>
    </div>
  );
}
