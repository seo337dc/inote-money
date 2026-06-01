"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type DarkModeCtx = { isDark: boolean; toggle: () => void };

const Ctx = createContext<DarkModeCtx>({ isDark: false, toggle: () => {} });

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(localStorage.getItem("inote-dark") === "true");
  }, []);

  const toggle = () =>
    setIsDark((v) => {
      localStorage.setItem("inote-dark", String(!v));
      return !v;
    });

  return <Ctx.Provider value={{ isDark, toggle }}>{children}</Ctx.Provider>;
}

export const useDarkMode = () => useContext(Ctx);
