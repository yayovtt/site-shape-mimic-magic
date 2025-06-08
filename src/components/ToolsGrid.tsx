
import React, { useState } from 'react';
import { ToolCard } from './ToolCard';
import { 
  CheckSquare, 
  Target, 
  Calendar, 
  MessageSquare, 
  Trophy, 
  Clock 
} from "lucide-react";

const tools = [
  {
    id: "tasks",
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
    description: "נהל את המשימות שלך בצורה יעילה ומאורגנת",
    goals: [
      "השלמת 10 משימות השבוע",
      "ארגון משימות לפי עדיפות",
      "שמירה על קצב עבודה קבוע"
    ]
  },
  {
    id: "goals",
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
    description: "הגדר והשג את היעדים שלך עם מעקב התקדמות",
    goals: [
      "הגדרת 5 יעדים חדשים החודש",
      "השגת יעד אחד לפחות השבוע",
      "מעקב יומי אחר התקדמות"
    ]
  },
  {
    id: "meetings",
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
    description: "תזמן ונהל פגישות בצורה חכמה ויעילה",
    goals: [
      "תיזמון מוקדם של כל הפגישות",
      "הכנה מקדימה לכל פגישה",
      "מעקב אחר תוצאות הפגישות"
    ]
  },
  {
    id: "chat",
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
    description: "שוחח עם עוזר AI חכם שיעזור לך בכל שאלה",
    goals: [
      "שימוש יומי ב-AI לקבלת עזרה",
      "למידת טכניקות חדשות מה-AI",
      "שיפור יעילות העבודה"
    ]
  },
  {
    id: "achievements",
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
    description: "עקוב אחר ההתקדמות שלך וקבל תגמולים",
    goals: [
      "השגת 3 הישגים חדשים החודש",
      "הגעה לרמה 10",
      "איסוף 2000 נקודות"
    ]
  },
  {
    id: "schedules",
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
    description: "תכנן את היום שלך בצורה אופטימלית",
    goals: [
      "ניצול מלא של הזמן הפנוי",
      "הגעה ל-90% יעילות זמן",
      "שמירה על איזון עבודה-חיים"
    ]
  }
];

export const ToolsGrid = () => {
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [newGoals, setNewGoals] = useState<{ [key: string]: string }>({});

  const toggleTool = (toolId: string) => {
    setExpandedTool(expandedTool === toolId ? null : toolId);
  };

  const handleAddGoal = (toolId: string) => {
    const goalText = newGoals[toolId];
    if (goalText && goalText.trim()) {
      console.log(`הוספת יעד חדש ל${toolId}: ${goalText}`);
      setNewGoals({ ...newGoals, [toolId]: '' });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          isExpanded={expandedTool === tool.id}
          onToggle={() => toggleTool(tool.id)}
          newGoal={newGoals[tool.id] || ''}
          onGoalChange={(value) => setNewGoals({ ...newGoals, [tool.id]: value })}
          onAddGoal={() => handleAddGoal(tool.id)}
        />
      ))}
    </div>
  );
};
