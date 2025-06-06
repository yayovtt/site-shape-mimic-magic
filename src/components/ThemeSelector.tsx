
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Theme {
  name: string;
  gradient: string;
  preview: string;
}

export const ThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = useState("מקורי");

  const themes: Theme[] = [
    { 
      name: "מקורי", 
      gradient: "bg-gradient-to-br from-pink-50 via-white to-purple-50",
      preview: "linear-gradient(to bottom right, rgb(253, 242, 248), white, rgb(250, 245, 255))"
    },
    { 
      name: "שקיעה", 
      gradient: "bg-gradient-to-br from-orange-100 via-red-50 to-pink-100",
      preview: "linear-gradient(to bottom right, rgb(255, 237, 213), rgb(254, 242, 242), rgb(252, 231, 243))"
    },
    { 
      name: "אוקיינוס", 
      gradient: "bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100",
      preview: "linear-gradient(to bottom right, rgb(239, 246, 255), rgb(236, 254, 255), rgb(224, 231, 255))"
    },
    { 
      name: "טבע", 
      gradient: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100",
      preview: "linear-gradient(to bottom right, rgb(240, 253, 244), rgb(236, 253, 245), rgb(204, 251, 241))"
    },
    { 
      name: "סגול מלכותי", 
      gradient: "bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100",
      preview: "linear-gradient(to bottom right, rgb(237, 233, 254), rgb(250, 245, 255), rgb(243, 232, 255))"
    },
    { 
      name: "זהב", 
      gradient: "bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100",
      preview: "linear-gradient(to bottom right, rgb(254, 252, 232), rgb(255, 251, 235), rgb(255, 237, 213))"
    }
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (themeName: string) => {
    const theme = themes.find(t => t.name === themeName);
    if (theme) {
      // Apply theme to body background
      document.body.className = theme.gradient + " min-h-screen";
      
      // Store selection
      localStorage.setItem('selectedTheme', themeName);
      setSelectedTheme(themeName);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">בחר ערכת נושא</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {themes.map((theme) => (
              <div
                key={theme.name}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedTheme === theme.name 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => applyTheme(theme.name)}
              >
                <div 
                  className="w-12 h-8 rounded border shadow-sm"
                  style={{ background: theme.preview }}
                />
                <span className="font-medium text-sm">{theme.name}</span>
                {selectedTheme === theme.name && (
                  <div className="mr-auto w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
