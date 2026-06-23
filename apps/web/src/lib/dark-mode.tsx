"use client";

import { createContext, useContext, useEffect, useState } from "react";

type DarkModeContextType = { isDark: boolean; toggle: () => void };

const DarkModeContext = createContext<DarkModeContextType>({ isDark: false, toggle: () => {} });

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("inote-dark-mode");
    if (stored === "true") setIsDark(true);
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      localStorage.setItem("inote-dark-mode", String(!prev));
      return !prev;
    });
  };

  return (
    <DarkModeContext.Provider value={{ isDark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  return useContext(DarkModeContext);
}
