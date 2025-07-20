import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react"; // Optional: replace with emojis if you want

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-2 rounded-full shadow-md transition"
      onClick={() => setDarkMode(!darkMode)}
      title="Toggle Dark Mode"
    >
      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
