// app/utils/dark-mode.js
"use client";
import { useState, useEffect } from "react";

export default function DarkMode({ children, initialTheme }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const newTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    document.documentElement.style.colorScheme = newTheme;
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <>
      {children}
      <button onClick={toggleTheme} style={{ position: "fixed", top: 10, right: 10 }}>
        Toggle {theme === "light" ? "Dark" : "Light"} Mode
      </button>
    </>
  );
}