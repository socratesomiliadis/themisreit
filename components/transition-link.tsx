import useNavigateTransition from "@/hooks/useNavigateTransition";
import NextLink from "next/link";
import { AnchorHTMLAttributes } from "react";

export default function Link({
  children,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const { navigateTo } = useNavigateTransition();

  return (
    <NextLink
      href={href}
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigateTo(href);
      }}
      {...props}
    >
      {children}
    </NextLink>
  );
}
