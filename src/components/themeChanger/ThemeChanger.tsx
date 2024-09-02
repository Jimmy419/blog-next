"use client";
import { themeList } from "@/constants";
import { Select, SelectItem } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useEffect } from "react";

const ThemeChanger = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <Select
      label="Select a theme"
      className="max-w-xs"
      onChange={(e) => {
        console.log("🚀 ~ ThemeChanger ~ e:", e);
        setTheme(e.target.value);
      }}
      defaultSelectedKeys={[theme as string]}
    >
      {themeList.map((theme) => (
        <SelectItem key={theme}>{theme}</SelectItem>
      ))}
    </Select>
  );
};

export default ThemeChanger;
