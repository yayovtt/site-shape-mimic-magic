
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Settings, Heart, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const defaultQuotes = [
  "לעולם אל תוותר! ❤️",
  "💎 כל אתגר הוא הזדמנות להתקדם",
  "🌟 אתה יותר חזק ממה שאתה חושב",
  "🚀 כל יום הוא התחלה חדשה",
  "💪 הצלחה היא סכום של מאמצים קטנים שחוזרים על עצמם",
  "🎯 המטרה שלך קרובה יותר ממה שנראה",
  "⭐ אתה בדרך הנכונה, המשך ללכת",
  "🔥 הכח שלך הוא בפנים, השתמש בו"
];

export const MotivationalQuotes = () => {
  const [quotes, setQuotes] = useState<string[]>([]);
  const [currentQuote, setCurrentQuote] = useState("");
  const [newQuote, setNewQuote] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // טעינת משפטים מ-localStorage או שימוש בברירת המחדל
    const savedQuotes = localStorage.getItem("motivational-quotes");
    if (savedQuotes) {
      const parsedQuotes = JSON.parse(savedQuotes);
      setQuotes(parsedQuotes);
      setCurrentQuote(parsedQuotes[Math.floor(Math.random() * parsedQuotes.length)]);
    } else {
      setQuotes(defaultQuotes);
      setCurrentQuote(defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)]);
    }
  }, []);

  const saveQuotes = (newQuotes: string[]) => {
    localStorage.setItem("motivational-quotes", JSON.stringify(newQuotes));
    setQuotes(newQuotes);
  };

  const addQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.trim()) return;

    const updatedQuotes = [...quotes, newQuote.trim()];
    saveQuotes(updatedQuotes);
    setNewQuote("");
    
    toast({
      title: "משפט עידוד חדש נוסף!",
    });
  };

  const deleteQuote = (index: number) => {
    const updatedQuotes = quotes.filter((_, i) => i !== index);
    saveQuotes(updatedQuotes);
    
    // אם המשפט הנוכחי נמחק, בחר משפט חדש
    if (updatedQuotes.length > 0 && currentQuote === quotes[index]) {
      setCurrentQuote(updatedQuotes[Math.floor(Math.random() * updatedQuotes.length)]);
    }
    
    toast({
      title: "משפט עידוד נמחק",
    });
  };

  const getRandomQuote = () => {
    if (quotes.length === 0) return;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(randomQuote);
  };

  const resetToDefault = () => {
    saveQuotes(defaultQuotes);
    setCurrentQuote(defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)]);
    setIsSettingsOpen(false);
    toast({
      title: "חזרה למשפטי ברירת המחדל",
    });
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* משפט עידוד נוכחי */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={getRandomQuote}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              משפט חדש
            </Button>
            <div className="text-center space-y-2 flex-1">
              <h2 className="text-xl font-semibold text-gray-800">
                {currentQuote}
              </h2>
              <p className="text-blue-600 flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" />
                תמשיך ללכת קדימה!
              </p>
            </div>
            <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" dir="rtl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">ניהול משפטי עידוד</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSettingsOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* טופס הוספת משפט חדש */}
                  <form onSubmit={addQuote} className="space-y-3">
                    <Input
                      placeholder="הכנס משפט עידוד חדש..."
                      value={newQuote}
                      onChange={(e) => setNewQuote(e.target.value)}
                      required
                    />
                    <Button type="submit" size="sm" className="w-full bg-green-500 hover:bg-green-600">
                      <Plus className="w-4 h-4 ml-1" />
                      הוסף משפט
                    </Button>
                  </form>

                  {/* רשימת משפטים */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">משפטים ({quotes.length})</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={resetToDefault}
                      >
                        איפוס
                      </Button>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {quotes.map((quote, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <span className="flex-1 truncate">{quote}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteQuote(index)}
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
