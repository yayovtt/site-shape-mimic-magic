
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, Circle, Plus, Square, RefreshCw } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeSelector } from "@/components/ThemeSelector";

const Index = () => {
  const [stats] = useState({
    dailyGoal: { completed: 0, total: 0 },
    dailyTasks: 0,
    completed: 0,
    tasks: 0
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50" dir="rtl">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-semibold text-sm">
            ש
          </div>
          <LanguageSelector />
        </div>
        <ThemeSelector />
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          {/* Main Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <div className="flex gap-1">
              <Calendar className="w-6 h-6 text-white" />
              <Check className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Main Title */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              מנהל משימות ופגישות
            </h1>
            <p className="text-lg text-gray-600">
              ארגן את היום שלך בצורה חכמה ויעילה
            </p>
          </div>
        </div>

        {/* Motivation Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">
                  לעולם אל תוותר! ❤️
                </h2>
                <p className="text-blue-600 flex items-center justify-center gap-2">
                  💎 כל אתגר הוא הזדמנות להתקדם
                </p>
              </div>
              <div></div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Circle className="w-5 h-5 text-orange-500 mr-2" />
                <span className="text-orange-700 font-medium">יעד היום</span>
              </div>
              <p className="text-2xl font-bold text-orange-800">
                {stats.dailyGoal.completed}/{stats.dailyGoal.total}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="w-5 h-5 text-purple-500 mr-2" />
                <span className="text-purple-700 font-medium">מטלות היום</span>
              </div>
              <p className="text-2xl font-bold text-purple-800">
                {stats.dailyTasks}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-700 font-medium">הושלמו</span>
              </div>
              <p className="text-2xl font-bold text-green-800">
                {stats.completed}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Square className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-blue-700 font-medium">משימות</span>
              </div>
              <p className="text-2xl font-bold text-blue-800">
                {stats.tasks}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" className="px-6 py-3">
            יומנים יומיים
          </Button>
          <Button variant="outline" className="px-6 py-3">
            טבלאות
          </Button>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3">
            משימות
          </Button>
        </div>

        {/* Add Task Button */}
        <div className="flex justify-center">
          <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full flex items-center gap-2">
            <Plus className="w-5 h-5" />
            הוסף משימה חדשה
          </Button>
        </div>

        {/* Bottom Navigation */}
        <div className="grid grid-cols-2 gap-4 pt-8">
          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold text-gray-800">משימות שבועיות</h3>
            </CardContent>
          </Card>
          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold text-gray-800">משימות יומיות</h3>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
