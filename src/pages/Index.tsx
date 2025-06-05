
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskManager } from "@/components/TaskManager";
import { MotivationalQuotes } from "@/components/MotivationalQuotes";
import { ChatGPT } from "@/components/ChatGPT";
import { CheckSquare, Target, Calendar, Clock, MessageCircle, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalGoals: 0,
    completedGoals: 0,
    upcomingMeetings: 0,
    todaySchedules: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch tasks stats
      const { data: tasks } = await supabase.from("tasks").select("completed");
      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(task => task.completed).length || 0;

      // Fetch goals stats
      const { data: goals } = await supabase.from("goals").select("completed");
      const totalGoals = goals?.length || 0;
      const completedGoals = goals?.filter(goal => goal.completed).length || 0;

      // Fetch upcoming meetings (next 7 days)
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const { data: meetings } = await supabase
        .from("meetings")
        .select("id")
        .gte("meeting_date", now.toISOString())
        .lte("meeting_date", nextWeek.toISOString());
      const upcomingMeetings = meetings?.length || 0;

      // Fetch today's schedules
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      const { data: schedules } = await supabase
        .from("schedules")
        .select("id")
        .gte("start_time", todayStart.toISOString())
        .lt("start_time", todayEnd.toISOString());
      const todaySchedules = schedules?.length || 0;

      setStats({
        totalTasks,
        completedTasks,
        totalGoals,
        completedGoals,
        upcomingMeetings,
        todaySchedules
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const taskCompletionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const goalCompletionRate = stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            מערכת ניהול אישית חכמה
          </h1>
          <p className="text-gray-600">
            נהל את המשימות, היעדים, הפגישות ולוח הזמנים שלך במקום אחד
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">משימות</p>
                  <p className="text-2xl font-bold">{stats.completedTasks}/{stats.totalTasks}</p>
                  <p className="text-blue-100 text-xs">{taskCompletionRate}% הושלמו</p>
                </div>
                <CheckSquare className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">יעדים</p>
                  <p className="text-2xl font-bold">{stats.completedGoals}/{stats.totalGoals}</p>
                  <p className="text-green-100 text-xs">{goalCompletionRate}% הושגו</p>
                </div>
                <Target className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">פגישות השבוע</p>
                  <p className="text-2xl font-bold">{stats.upcomingMeetings}</p>
                  <p className="text-purple-100 text-xs">7 ימים הקרובים</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">אירועי היום</p>
                  <p className="text-2xl font-bold">{stats.todaySchedules}</p>
                  <p className="text-orange-100 text-xs">בלוח הזמנים</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/tasks")}>
            <CardHeader className="text-center">
              <CheckSquare className="w-12 h-12 mx-auto text-blue-500 mb-2" />
              <CardTitle className="text-lg">ניהול משימות</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 text-sm">צור, ערוך ועקוב אחר המשימות שלך</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/goals")}>
            <CardHeader className="text-center">
              <Target className="w-12 h-12 mx-auto text-green-500 mb-2" />
              <CardTitle className="text-lg">יעדים אישיים</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 text-sm">הגדר יעדים ועקוב אחר ההתקדמות</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/meetings")}>
            <CardHeader className="text-center">
              <Calendar className="w-12 h-12 mx-auto text-purple-500 mb-2" />
              <CardTitle className="text-lg">פגישות</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 text-sm">קבע וארגן את הפגישות שלך</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/schedules")}>
            <CardHeader className="text-center">
              <Clock className="w-12 h-12 mx-auto text-orange-500 mb-2" />
              <CardTitle className="text-lg">לוח זמנים</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 text-sm">נהל את לוח הזמנים היומי שלך</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Manager */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  ניהול משימות מהיר
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskManager />
                <div className="mt-4 text-center">
                  <Button 
                    onClick={() => navigate("/tasks")} 
                    variant="outline"
                    className="w-full"
                  >
                    <BarChart3 className="w-4 h-4 ml-2" />
                    צפה בכל המשימות
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Motivational Quotes */}
            <MotivationalQuotes />
          </div>

          {/* Chat GPT */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  עוזר אישי חכם
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChatGPT />
                <div className="mt-4 text-center">
                  <Button 
                    onClick={() => navigate("/chat")} 
                    variant="outline"
                    className="w-full"
                  >
                    <MessageCircle className="w-4 h-4 ml-2" />
                    פתח צ'אט מלא
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
