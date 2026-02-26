"use client";

import { slideOutIn } from "@/lib/transition";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { flushSync } from "react-dom";

export default function useNavigateTransition() {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  function navigateTo(
    path: string,
    isLoader?: boolean,
    beforeNavigate?: () => void,
    afterNavigate?: () => void
  ) {
    const isSamePath = pathname === path;
    if (isSamePath && !isLoader) {
      return;
    }
    lenis?.stop();
    beforeNavigate?.();
    router.push(path, {
      onTransitionReady: () => slideOutIn(),
    });
    afterNavigate?.();
    setTimeout(() => {
      lenis?.start();
    }, 1500);
  }

  /**
   * Completes the loader transition without triggering a navigation.
   * Used when we're already on the target path (e.g. initial load, 404 pages)
   * to avoid router.push causing a remount loop with the View Transitions API.
   */
  function completeLoaderTransition(onComplete: () => void) {
    lenis?.stop();
    if ("startViewTransition" in document) {
      (
        document as Document & {
          startViewTransition: (cb: () => void | Promise<void>) => {
            ready: Promise<void>;
          };
        }
      )
        .startViewTransition(() => {
          flushSync(() => {
            onComplete();
          });
        })
        .ready.then(() => slideOutIn());
    } else {
      onComplete();
    }
    setTimeout(() => {
      lenis?.start();
    }, 1500);
  }

  return {
    navigateTo,
    completeLoaderTransition,
  };
}
