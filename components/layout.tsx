import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout-wrapper w-screen relative bg-black">
      <Header />
      {children}
    </div>
  );
}
