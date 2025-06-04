
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const ThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = useState("Light");

  const themes = [
    { name: "Sunset", color: "bg-orange-200" },
    { name: "Nature", color: "bg-green-200" },
    { name: "Purple", color: "bg-purple-200" },
    { name: "Ocean", color: "bg-blue-200" },
    { name: "Light", color: "bg-gray-200" }
  ];

  return (
    <div className="flex gap-2 items-center">
      {themes.map((theme) => (
        <Button
          key={theme.name}
          variant={selectedTheme === theme.name ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTheme(theme.name)}
          className={`text-xs px-3 py-1 h-8 ${selectedTheme === theme.name ? '' : theme.color}`}
        >
          {theme.name}
        </Button>
      ))}
      <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
        ⚙️
      </Button>
    </div>
  );
};
