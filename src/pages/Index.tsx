
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskManager } from "@/components/TaskManager";
import { MotivationalQuotes } from "@/components/MotivationalQuotes";
import { ThemeSelector } from "@/components/ThemeSelector";
import { 
  CheckSquare, 
  Calendar, 
  Target, 
  MessageSquare, 
  Clock,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalGoals: 0,
    completedGoals: 0,
    totalMeetings: 0,
    totalSchedules: 0
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

      // Fetch meetings count
      const { data: meetings } = await supabase.from("meetings").select("id");
      const totalMeetings = meetings?.length || 0;

      // Fetch schedules count
      const { data: schedules } = await supabase.from("schedules").select("id");
      const totalSchedules = schedules?.length || 0;

      setStats({
        totalTasks,
        completedTasks,
        totalGoals,
        completedGoals,
        totalMeetings,
        totalSchedules
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const quickActions = [
    {
      title: "משימות",
      description: "נהל את המשימות שלך",
      icon: CheckSquare,
      color: "bg-blue-500",
      route: "/tasks",
      count: stats.totalTasks
    },
    {
      title: "יעדים",
      description: "עקוב אחר היעדים שלך",
      icon: Target,
      color: "bg-green-500",
      route: "/goals",
      count: stats.totalGoals
    },
    {
      title: "פגישות",
      description: "תזמן פגישות חדשות",
      icon: Calendar,
      color: "bg-purple-500",
      route: "/meetings",
      count: stats.totalMeetings
    },
    {
      title: "לוח זמנים",
      description: "תכנן את היום שלך",
      icon: Clock,
      color: "bg-orange-500",
      route: "/schedules",
      count: stats.totalSchedules
    },
    {
      title: "צ'אט AI",
      description: "שאל את העוזר החכם",
      icon: MessageSquare,
      color: "bg-pink-500",
      route: "/chat"
    }
  ];

  return (
    <div className="min-h-screen p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ברוכים הבאים למנהל המשימות שלכם
            </h1>
            <p className="text-gray-600">נהלו את היום שלכם בצורה יעילה ומאורגנת</p>
          </div>
          <ThemeSelector />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">משימות הושלמו</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.completedTasks}/{stats.totalTasks}
                  </p>
                </div>
                <CheckSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">יעדים הושגו</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.completedGoals}/{stats.totalGoals}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">פגישות השבוע</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalMeetings}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">אירועים מתוכננים</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.totalSchedules}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              פעולות מהירות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-3 hover:shadow-lg transition-shadow"
                  onClick={() => navigate(action.route)}
                >
                  <div className={`p-3 rounded-full ${action.color} text-white`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                    {action.count !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">({action.count} פריטים)</p>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>משימות אחרונות</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskManager />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>מוטיבציה יומית</CardTitle>
            </CardHeader>
            <CardContent>
              <MotivationalQuotes />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
