
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
}

export const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: "", description: "" });
  const { toast } = useToast();

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTask.title,
      description: newTask.description,
      completed: false,
      created_at: new Date().toISOString(),
    };

    setTasks(prev => [task, ...prev]);
    setNewTask({ title: "", description: "" });
    
    toast({
      title: "המשימה נוצרה בהצלחה",
    });
  };

  const toggleTask = (id: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast({
      title: "המשימה נמחקה בהצלחה",
    });
  };

  const startEdit = (task: Task) => {
    setEditingTask(task.id);
    setEditData({ title: task.title, description: task.description || "" });
  };

  const saveEdit = (id: string) => {
    if (!editData.title.trim()) return;

    setTasks(prev => 
      prev.map(task => 
        task.id === id 
          ? { ...task, title: editData.title, description: editData.description }
          : task
      )
    );
    
    setEditingTask(null);
    setEditData({ title: "", description: "" });
    toast({
      title: "המשימה עודכנה בהצלחה",
    });
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditData({ title: "", description: "" });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            הוסף משימה חדשה
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addTask} className="space-y-4">
            <Input
              placeholder="כותרת המשימה"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <Textarea
              placeholder="תיאור המשימה (אופציונלי)"
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
            />
            <Button 
              type="submit"
              className="w-full bg-pink-500 hover:bg-pink-600"
            >
              הוסף משימה
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {tasks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              אין משימות עדיין. הוסף משימה ראשונה!
            </CardContent>
          </Card>
        )}
        
        {tasks.map((task) => (
          <Card key={task.id} className={task.completed ? "opacity-75" : ""}>
            <CardContent className="p-4">
              {editingTask === task.id ? (
                <form onSubmit={(e) => { e.preventDefault(); saveEdit(task.id); }} className="space-y-3">
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                  <Textarea
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <div className={task.completed ? "line-through" : ""}>
                      <h3 className="font-medium">{task.title}</h3>
                      {task.description && (
                        <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(task)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
