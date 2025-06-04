
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const LanguageSelector = () => {
  const [selectedLang, setSelectedLang] = useState("HE");

  const languages = [
    { code: "DE", label: "DE" },
    { code: "EN", label: "EN" },
    { code: "HE", label: "עב" }
  ];

  return (
    <div className="flex gap-1">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={selectedLang === lang.code ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedLang(lang.code)}
          className="text-xs px-2 py-1 h-7"
        >
          {lang.label}
        </Button>
      ))}
    </div>
  );
};
