
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Trash2, Edit, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  user_id: string;
}

export const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: tasksData, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(tasksData || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "שגיאה בטעינת משימות",
        variant: "destructive",
      });
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .insert({
          title: newTask,
          completed: false
        });

      if (error) throw error;

      await fetchTasks();
      setNewTask("");

      toast({
        title: "המשימה נוצרה בהצלחה",
      });
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "שגיאה ביצירת משימה",
        variant: "destructive",
      });
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !completed })
        .eq("id", id);

      if (error) throw error;

      await fetchTasks();
      toast({
        title: completed ? "המשימה סומנה כלא הושלמה" : "כל הכבוד! המשימה הושלמה",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "שגיאה בעדכון משימה",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchTasks();
      toast({
        title: "המשימה נמחקה בהצלחה",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "שגיאה במחיקת משימה",
        variant: "destructive",
      });
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ title: editTitle })
        .eq("id", id);

      if (error) throw error;

      await fetchTasks();
      setEditingTask(null);
      setEditTitle("");

      toast({
        title: "המשימה עודכנה בהצלחה",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "שגיאה בעדכון משימה",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditTitle("");
  };

  return (
    <div className="space-y-4" dir="rtl">
      <form onSubmit={addTask} className="flex gap-2">
        <Input
          placeholder="הוסף משימה חדשה..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 text-lg"
        />
        <Button type="submit" disabled={!newTask.trim()}>
          <Plus className="w-5 h-5" />
        </Button>
      </form>

      <div className="space-y-2">
        {tasks.length === 0 && (
          <div className="text-center text-gray-500 py-8 text-lg">
            אין משימות עדיין. הוסף משימה ראשונה!
          </div>
        )}
        
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
              task.completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
            }`}
          >
            {editingTask === task.id ? (
              <>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 text-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveEdit(task.id);
                    } else if (e.key === 'Escape') {
                      cancelEdit();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => saveEdit(task.id)}
                >
                  <Check className="w-5 h-5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelEdit}
                >
                  <X className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant={task.completed ? "default" : "outline"}
                  onClick={() => toggleTask(task.id, task.completed)}
                  className={task.completed ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  <Check className="w-5 h-5" />
                </Button>
                <span
                  className={`flex-1 text-lg ${
                    task.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {task.title}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEdit(task)}
                >
                  <Edit className="w-5 h-5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteTask(task.id)}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
