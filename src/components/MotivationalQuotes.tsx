
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Plus, Trash2, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [showAddForm, setShowAddForm] = useState(false);
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
    setShowAddForm(false);
    
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              הוסף
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* טופס הוספת משפט חדש */}
      {showAddForm && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={addQuote} className="space-y-3">
              <Input
                placeholder="הכנס משפט עידוד חדש..."
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="bg-green-500 hover:bg-green-600">
                  הוסף משפט
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  ביטול
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* רשימת כל המשפטים */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">משפטי עידוד ({quotes.length})</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={resetToDefault}
            >
              איפוס לברירת מחדל
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {quotes.map((quote, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{quote}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteQuote(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
