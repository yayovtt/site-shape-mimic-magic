
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Check, Circle, Plus, Square, MessageCircle, Target, Users, Clock } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeSelector } from "@/components/ThemeSelector";
import { MotivationalQuotes } from "@/components/MotivationalQuotes";
import { useTasks } from "@/hooks/useTasks";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    dailyGoal: { completed: 0, total: 5 },
    dailyTasks: 0,
    completed: 0,
    tasks: 0,
    goals: 0,
    meetings: 0,
    schedules: 0
  });

  useEffect(() => {
    if (tasks) {
      const completedTasks = tasks.filter(task => task.completed).length;
      const totalTasks = tasks.length;
      
      // Load goals, meetings, and schedules from localStorage
      const savedGoals = localStorage.getItem("goals");
      const savedMeetings = localStorage.getItem("meetings");
      const savedSchedules = localStorage.getItem("schedules");
      
      const goals = savedGoals ? JSON.parse(savedGoals) : [];
      const meetings = savedMeetings ? JSON.parse(savedMeetings) : [];
      const schedules = savedSchedules ? JSON.parse(savedSchedules) : [];
      
      setStats({
        dailyGoal: { completed: completedTasks, total: 5 },
        dailyTasks: totalTasks,
        completed: completedTasks,
        tasks: totalTasks,
        goals: goals.length,
        meetings: meetings.length,
        schedules: schedules.length
      });
    }
  }, [tasks]);

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
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <div className="flex gap-1">
              <Calendar className="w-6 h-6 text-white" />
              <Check className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              מנהל משימות ופגישות
            </h1>
            <p className="text-lg text-gray-600">
              ארגן את היום שלך בצורה חכמה ויעילה
            </p>
          </div>
        </div>

        {/* Motivational Quotes Component */}
        <MotivationalQuotes />

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

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-5 h-5 text-indigo-500 mr-2" />
                <span className="text-indigo-700 font-medium">יעדים</span>
              </div>
              <p className="text-2xl font-bold text-indigo-800">
                {stats.goals}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-pink-50 border-pink-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-pink-500 mr-2" />
                <span className="text-pink-700 font-medium">פגישות</span>
              </div>
              <p className="text-2xl font-bold text-pink-800">
                {stats.meetings}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-teal-50 border-teal-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-teal-500 mr-2" />
                <span className="text-teal-700 font-medium">לוח זמנים</span>
              </div>
              <p className="text-2xl font-bold text-teal-800">
                {stats.schedules}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => navigate("/tasks")}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 h-auto flex flex-col items-center gap-2"
          >
            <Square className="w-6 h-6" />
            משימות
          </Button>
          <Button 
            onClick={() => navigate("/goals")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 h-auto flex flex-col items-center gap-2"
          >
            <Target className="w-6 h-6" />
            יעדים
          </Button>
          <Button 
            onClick={() => navigate("/meetings")}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 h-auto flex flex-col items-center gap-2"
          >
            <Users className="w-6 h-6" />
            פגישות
          </Button>
          <Button 
            onClick={() => navigate("/schedules")}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 h-auto flex flex-col items-center gap-2"
          >
            <Clock className="w-6 h-6" />
            לוח זמנים
          </Button>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => navigate("/tasks")}
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            הוסף משימה חדשה
          </Button>
          <Button 
            onClick={() => navigate("/chat")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            צ'אט עם GPT
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
