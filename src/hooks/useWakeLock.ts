"use client";

import { useCallback, useEffect, useRef } from "react";

interface WakeLockController {
  request: () => Promise<void>;
  release: () => Promise<void>;
}

export function useWakeLock(): WakeLockController {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const pendingRequestRef = useRef<Promise<void> | null>(null);

  const release = useCallback(async () => {
    if (!sentinelRef.current) {
      return;
    }
    try {
      await sentinelRef.current.release();
    } catch (error) {
      console.warn("Wake lock release failed", error);
    } finally {
      sentinelRef.current = null;
    }
  }, []);

  const request = useCallback(async () => {
    if (sentinelRef.current || pendingRequestRef.current) {
      return pendingRequestRef.current ?? Promise.resolve();
    }
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      return Promise.resolve();
    }
    const promise = navigator.wakeLock
      .request("screen")
      .then((sentinel) => {
        sentinelRef.current = sentinel;
        sentinel.addEventListener("release", () => {
          sentinelRef.current = null;
        });
      })
      .catch((error) => {
        console.warn("Wake lock request failed", error);
      })
      .finally(() => {
        pendingRequestRef.current = null;
      });
    pendingRequestRef.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && sentinelRef.current) {
        void request();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      void release();
    };
  }, [release, request]);

  return { request, release };
}
