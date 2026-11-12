"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";

export function RouteProgressBar() {
  const pathname = usePathname();
  const [isPending] = useTransition();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname changes, finish and hide the progress bar
  useEffect(() => {
    if (active) {
      setProgress(100);
      const timer = setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Intercept all internal link clicks to trigger instant visual feedback (<50ms)
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor || !anchor.href) return;

      // Ignore middle clicks, ctrl/cmd/shift clicks, downloads, or target="_blank"
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if it's an internal link
      try {
        const url = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Same origin, different path or query (not just hash anchor jump)
        if (
          url.origin === currentUrl.origin &&
          (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search)
        ) {
          setActive(true);
          setProgress(15);
        }
      } catch {
        // invalid URL, ignore
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, []);

  // Simulate smooth natural progress crawl while pending
  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return prev; // stall at 88% until route load completes
        const step = Math.max(1, (88 - prev) * 0.15);
        return prev + step;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [active]);

  if (!active && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-[#d6f088] transition-[width,opacity] duration-200 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px #d6f088, 0 0 5px #d6f088",
          opacity: progress >= 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
