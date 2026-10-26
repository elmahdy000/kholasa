"use client";

import { useEffect } from "react";

import { PwaInstallBanner } from "./PwaInstallBanner";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("New PWA content available.");
                }
              };
            }
          };
        })
        .catch((err) => {
          console.debug("Service worker registration:", err);
        });
    }
  }, []);

  return <PwaInstallBanner />;
}
