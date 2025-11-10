import useNavigateTransition from "@/hooks/useNavigateTransition";
import NextLink from "next/link";
import { AnchorHTMLAttributes } from "react";

export default function Link({
  children,
  href,
  beforeNavigate,
  afterNavigate,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  beforeNavigate?: () => void;
  afterNavigate?: () => void;
}) {
  const { navigateTo } = useNavigateTransition();
  const isExternal = props.target === "_blank";

  return (
    <NextLink
      href={href}
      target={props.target}
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        if (isExternal) {
          return;
        }
        e.preventDefault();
        navigateTo(href, beforeNavigate, afterNavigate);
      }}
      {...props}
    >
      {children}
    </NextLink>
  );
}
