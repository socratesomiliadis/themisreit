import { scaleInOut } from "@/lib/transition";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";

export default function useNavigateTransition() {
  const router = useTransitionRouter();
  const pathname = usePathname();

  function navigateTo(path: string) {
    const isSamePath = pathname === path;
    if (isSamePath) {
      return;
    }
    router.push(path, {
      onTransitionReady: () => scaleInOut(),
    });
  }

  return {
    navigateTo,
  };
}
