import { Lenis } from "lenis/react";
import Header from "./Header";
import { Scrollbar } from "./Scrollbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout-wrapper w-screen relative bg-black">
      <Header />
      <Lenis
        root
        options={{
          prevent: (node: Element | null) =>
            node?.getAttribute("data-lenis-prevent") === "true",
        }}
      />
      <Scrollbar />
      {children}
    </div>
  );
}
