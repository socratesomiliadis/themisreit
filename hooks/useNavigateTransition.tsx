import { scaleInOut, slideOutIn } from "@/lib/transition";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";

export default function useNavigateTransition() {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  function navigateTo(
    path: string,
    beforeNavigate?: () => void,
    afterNavigate?: () => void
  ) {
    const isSamePath = pathname === path;
    if (isSamePath) {
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

  return {
    navigateTo,
  };
}
