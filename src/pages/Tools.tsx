import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GradientButton } from "@/components/GradientButton";
import { StatusCard } from "@/components/StatusCard";
import { MotivationalQuotes } from "@/components/MotivationalQuotes";
import { 
  CheckSquare, 
  Target, 
  Calendar, 
  MessageSquare, 
  Trophy, 
  Clock, 
  ArrowRight,
  Home,
  ChevronDown,
  Plus,
  Star
} from "lucide-react";

const Tools = () => {
  const navigate = useNavigate();
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [newGoals, setNewGoals] = useState<{ [key: string]: string }>({});

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

  const getAddButtonText = (toolId: string) => {
    switch (toolId) {
      case "tasks": return "הוסף משימה חדשה";
      case "goals": return "הוסף יעד חדש";
      case "meetings": return "הוסף פגישה חדשה";
      case "chat": return "הוסף נושא לשיחה";
      case "achievements": return "הוסף הישג חדש";
      case "schedules": return "הוסף אירוע חדש";
      default: return "הוסף פריט חדש";
    }
  };

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

        {/* Motivational Quotes */}
        <div className="mb-8">
          <MotivationalQuotes />
        </div>

        {/* Tools Grid - Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tools.map((tool) => (
            <Collapsible 
              key={tool.id}
              open={expandedTool === tool.id} 
              onOpenChange={() => toggleTool(tool.id)}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`p-4 rounded-xl bg-gradient-to-r ${tool.gradient}`}>
                        <tool.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-2">{tool.title}</CardTitle>
                        <p className="text-gray-600 text-sm">{tool.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedTool === tool.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {/* Add New Item Button - Above Summary */}
                    <div className="mb-6">
                      <Button
                        onClick={() => handleAddGoal(tool.id)}
                        className={`w-full bg-gradient-to-r ${tool.gradient} hover:opacity-90 text-white flex items-center justify-center gap-2`}
                      >
                        <Plus className="w-4 h-4" />
                        {getAddButtonText(tool.id)}
                      </Button>
                    </div>

                    {/* Status Summary - Rectangle shaped and larger */}
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      {tool.stats.map((stat, index) => (
                        <div key={index} className="flex justify-between items-center p-6 bg-gray-50 rounded-lg min-h-[70px]">
                          <div className="text-right">
                            <div className="text-base text-gray-500">{stat.label}</div>
                          </div>
                          <div className={`text-2xl font-bold ${stat.color || 'text-purple-600'}`}>
                            {stat.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Goals Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                      <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        יעדים ומטרות
                      </h4>
                      <div className="space-y-2">
                        {tool.goals.map((goal, goalIndex) => (
                          <div key={goalIndex} className="flex items-center gap-2 p-3 bg-white rounded text-sm">
                            <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                            <span className="text-gray-700">{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add New Goal Section with Form */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                      <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-green-600" />
                        הוסף יעד או מטרה חדשה
                      </h4>
                      <div className="space-y-3">
                        <Textarea
                          placeholder="הזן יעד או מטרה חדשה..."
                          value={newGoals[tool.id] || ''}
                          onChange={(e) => setNewGoals({ ...newGoals, [tool.id]: e.target.value })}
                          className="resize-none h-20"
                        />
                        <Button
                          onClick={() => handleAddGoal(tool.id)}
                          size="sm"
                          className={`w-full bg-gradient-to-r ${tool.gradient} hover:opacity-90`}
                        >
                          <Plus className="w-4 h-4 ml-2" />
                          הוסף
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>

        {/* Goals and Targets Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="w-6 h-6 text-yellow-500" />
              סיכום יעדים כללי
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">18</div>
                <div className="text-green-700">יעדים הושגו השבוע</div>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">25</div>
                <div className="text-blue-700">יעדים פעילים</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">82%</div>
                <div className="text-purple-700">שיעור הצלחה</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Motivational Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Plus className="w-5 h-5" />
              הוסף משפט עידוד אישי
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                <p className="text-lg font-medium text-center">
                  "אתה יכול להשיג כל דבר שאתה שם את הדעת עליו! 💪"
                </p>
              </div>
              <div className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <p className="text-lg font-medium text-center">
                  "כל יום הוא הזדמנות חדשה להצליח! ⭐"
                </p>
              </div>
              <div className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
                <p className="text-lg font-medium text-center">
                  "התמדה היא המפתח להצלחה! 🏆"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
