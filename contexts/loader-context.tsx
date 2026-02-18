"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

type LoaderContextValue = {
  /** True while the loader animation is playing (including close transition) */
  isLoaderPlaying: boolean;
  /** True when the loader has fully finished - use this to defer enter animations */
  isLoaderComplete: boolean;
};

const LoaderContext = createContext<LoaderContextValue | null>(null);

export function LoaderProvider({
  isLoaderPlaying,
  children,
}: {
  isLoaderPlaying: boolean;
  children: ReactNode;
}) {
  const value = useMemo<LoaderContextValue>(
    () => ({
      isLoaderPlaying,
      isLoaderComplete: !isLoaderPlaying,
    }),
    [isLoaderPlaying]
  );

  return (
    <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>
  );
}

export function useLoaderContext(): LoaderContextValue {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error(
      "useLoaderContext must be used within a LoaderProvider. Wrap your app with LoaderProvider in the layout."
    );
  }
  return context;
}
