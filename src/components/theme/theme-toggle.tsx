"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      className="cursor-pointer hover:scale-105 active:scale-95 hover:border-primary hover:dark:border-white"
      onClick={toggleTheme}
    >
      {theme === "light" ? <Moon /> : <Sun />}
    </Button>
  );
}
