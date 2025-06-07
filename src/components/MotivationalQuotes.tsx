
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const motivationalQuotes = [
  {
    text: "הדרך הטובה ביותר לחזות את העתיד היא ליצור אותו",
    author: "פיטר דרוקר"
  },
  {
    text: "הצלחה היא לעבור מכשלון לכשלון בלי לאבד את ההתלהבות",
    author: "וינסטון צ'רצ'יל"
  },
  {
    text: "התחלה היא החלק החשוב ביותר בכל עבודה",
    author: "אפלטון"
  },
  {
    text: "אל תחכה לתנאים המושלמים, התחל עכשיו עם מה שיש לך",
    author: "נפוליאון היל"
  },
  {
    text: "כל מסע של אלף מיל מתחיל בצעד אחד",
    author: "לאו צה"
  },
  {
    text: "הגלים הגדולים ביותר מתחילים כטיפות קטנות",
    author: "פתגם יפני"
  }
];

export const MotivationalQuotes = () => {
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setCurrentQuote(motivationalQuotes[randomIndex]);
    }, 10000); // Change quote every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" dir="rtl">
      <CardContent className="p-8">
        <div className="flex items-center gap-4">
          <Quote className="w-12 h-12 text-blue-200 flex-shrink-0" />
          <div className="text-center flex-1">
            <p className="text-2xl font-medium leading-relaxed mb-3">
              {currentQuote.text}
            </p>
            <p className="text-xl text-blue-100">
              — {currentQuote.author}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
