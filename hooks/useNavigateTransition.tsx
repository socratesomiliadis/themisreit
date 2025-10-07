import { scaleInOut, slideOutIn } from "@/lib/transition";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";

export default function useNavigateTransition() {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  function navigateTo(path: string) {
    const isSamePath = pathname === path;
    if (isSamePath) {
      return;
    }
    lenis?.stop();
    router.push(path, {
      onTransitionReady: () => slideOutIn(),
    });
    setTimeout(() => {
      lenis?.start();
    }, 1600);
  }

  return {
    navigateTo,
  };
}
