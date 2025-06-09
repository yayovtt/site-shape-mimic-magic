
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckSquare, Calendar, Trophy, Plus } from "lucide-react";
import { useTasksWithAuth } from "@/hooks/useTasksWithAuth";
import { useToast } from "@/hooks/use-toast";

interface QuickStatsProps {
  onNavigate: (path: string) => void;
}

export const QuickStatsFixed = ({ onNavigate }: QuickStatsProps) => {
  const { tasks, createTask } = useTasksWithAuth();
  const { toast } = useToast();
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  // חישוב סטטיסטיקות
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  
  // סטטיסטיקות מדומות לפגישות והישגים (כי אין לנו נתונים אמיתיים עדיין)
  const meetings = 3;
  const achievements = 5;

  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    console.log('Quick add task triggered:', quickTaskTitle);
    await createTask.mutate({ title: quickTaskTitle });
    setQuickTaskTitle("");
    setIsTaskDialogOpen(false);
  };

  const stats = [
    {
      title: "משימות",
      value: `${completedTasks}/${totalTasks}`,
      icon: CheckSquare,
      color: "bg-blue-500",
      description: "משימות הושלמו",
      hasQuickAdd: true,
      quickAddDialog: (
        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="mt-2 w-full">
              <Plus className="w-4 h-4 mr-1" />
              הוסף משימה
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>הוסף משימה מהירה</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleQuickAddTask} className="space-y-4">
              <Input
                placeholder="כתוב כאן את המשימה..."
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={!quickTaskTitle.trim()}>
                  הוסף
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsTaskDialogOpen(false)}
                >
                  ביטול
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      ),
      onClick: () => onNavigate("/tasks")
    },
    {
      title: "פגישות",
      value: meetings.toString(),
      icon: Calendar,
      color: "bg-green-500", 
      description: "פגישות נקבעו",
      hasQuickAdd: false,
      onClick: () => onNavigate("/meetings")
    },
    {
      title: "הישגים",
      value: achievements.toString(),
      icon: Trophy,
      color: "bg-yellow-500",
      description: "הישגים הושגו",
      hasQuickAdd: false,
      onClick: () => onNavigate("/achievements")
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" dir="rtl">
      {stats.map((stat, index) => (
        <Card 
          key={index}
          className="hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-full flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mb-3">{stat.description}</p>
            
            <div className="space-y-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={stat.onClick}
              >
                הצג הכל
              </Button>
              
              {stat.hasQuickAdd && stat.quickAddDialog}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
