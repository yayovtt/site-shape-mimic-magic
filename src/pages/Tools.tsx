
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/GradientButton";
import { StatusCard } from "@/components/StatusCard";
import { 
  CheckSquare, 
  Target, 
  Calendar, 
  MessageSquare, 
  Trophy, 
  Clock, 
  ArrowRight,
  Home
} from "lucide-react";

const Tools = () => {
  const navigate = useNavigate();

  const tools = [
    {
      title: "משימות",
      icon: CheckSquare,
      gradient: "from-purple-500 via-purple-600 to-pink-500",
      path: "/tasks",
      stats: [
        { label: "משימות פעילות", value: 8, color: "text-blue-600" },
        { label: "הושלמו היום", value: 3, color: "text-green-600" },
        { label: "ממתינות", value: 5, color: "text-orange-600" },
        { label: "בעדיפות גבוהה", value: 2, color: "text-red-600" }
      ],
      description: "נהל את המשימות שלך בצורה יעילה ומאורגנת"
    },
    {
      title: "יעדים",
      icon: Target,
      gradient: "from-green-400 via-green-500 to-teal-500",
      path: "/goals",
      stats: [
        { label: "יעדים פעילים", value: 4, color: "text-green-600" },
        { label: "הושגו השבוע", value: 1, color: "text-blue-600" },
        { label: "בתהליך", value: 3, color: "text-yellow-600" },
        { label: "אחוז הצלחה", value: "75%", color: "text-purple-600" }
      ],
      description: "הגדר והשג את היעדים שלך עם מעקב התקדמות"
    },
    {
      title: "פגישות",
      icon: Calendar,
      gradient: "from-blue-400 via-blue-500 to-indigo-500",
      path: "/meetings",
      stats: [
        { label: "פגישות השבוע", value: 6, color: "text-blue-600" },
        { label: "פגישות היום", value: 2, color: "text-green-600" },
        { label: "מתוזמנות", value: 4, color: "text-orange-600" },
        { label: "זמן ממוצע", value: "45 דק'", color: "text-purple-600" }
      ],
      description: "תזמן ונהל פגישות בצורה חכמה ויעילה"
    },
    {
      title: "צ'אט AI",
      icon: MessageSquare,
      gradient: "from-pink-400 via-pink-500 to-rose-500",
      path: "/chat",
      stats: [
        { label: "שיחות השבוע", value: 12, color: "text-pink-600" },
        { label: "הודעות היום", value: 8, color: "text-blue-600" },
        { label: "תשובות מועילות", value: "95%", color: "text-green-600" },
        { label: "זמן תגובה", value: "2 שנ'", color: "text-purple-600" }
      ],
      description: "שוחח עם עוזר AI חכם שיעזור לך בכל שאלה"
    },
    {
      title: "הישגים",
      icon: Trophy,
      gradient: "from-yellow-400 via-orange-400 to-red-400",
      path: "/achievements",
      stats: [
        { label: "הישגים פתוחים", value: 15, color: "text-yellow-600" },
        { label: "הושגו השבוע", value: 2, color: "text-green-600" },
        { label: "נקודות כולל", value: 1250, color: "text-blue-600" },
        { label: "רמה נוכחית", value: 7, color: "text-purple-600" }
      ],
      description: "עקוב אחר ההתקדמות שלך וקבל תגמולים"
    },
    {
      title: "לוח זמנים",
      icon: Clock,
      gradient: "from-indigo-400 via-blue-500 to-purple-500",
      path: "/schedules",
      stats: [
        { label: "אירועים השבוע", value: 18, color: "text-indigo-600" },
        { label: "זמן פנוי היום", value: "3 שעות", color: "text-green-600" },
        { label: "תזכורות", value: 5, color: "text-orange-600" },
        { label: "יעילות זמן", value: "87%", color: "text-blue-600" }
      ],
      description: "תכנן את היום שלך בצורה אופטימלית"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              כלים נוספים
            </h1>
            <p className="text-gray-600">גלה את כל הפונקציות הזמינות באפליקציה</p>
          </div>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            חזרה לבית
          </Button>
        </div>

        {/* Tools Grid */}
        <div className="space-y-12">
          {tools.map((tool, index) => (
            <div key={index} className="space-y-6">
              {/* Tool Button */}
              <div className="flex justify-center">
                <GradientButton
                  title={tool.title}
                  icon={tool.icon}
                  gradient={tool.gradient}
                  onClick={() => navigate(tool.path)}
                />
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatusCard
                  title={tool.title}
                  icon={tool.icon}
                  stats={tool.stats}
                  description={tool.description}
                />
              </div>

              {/* Divider */}
              {index < tools.length - 1 && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="text-center mt-12">
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            התחל לעבוד עם הכלים
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Tools;
