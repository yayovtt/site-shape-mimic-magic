
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useTasks } from "@/hooks/useTasks";
import { Trash2, Plus } from "lucide-react";

export const TaskManager = () => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const { tasks, createTask, updateTask, deleteTask } = useTasks();

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    createTask.mutate({
      title: newTaskTitle,
      description: newTaskDescription,
    });

    setNewTaskTitle("");
    setNewTaskDescription("");
    setShowAddForm(false);
  };

  const toggleTask = (id: string, completed: boolean) => {
    updateTask.mutate({ id, completed: !completed });
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">משימות</h2>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <Plus className="w-4 h-4 ml-2" />
          הוסף משימה
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>משימה חדשה</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <Input
                placeholder="כותרת המשימה"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder="תיאור המשימה (אופציונלי)"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={createTask.isPending}>
                  {createTask.isPending ? "יוצר..." : "צור משימה"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  ביטול
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id, task.completed)}
                />
                <div className="flex-1">
                  <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTask.mutate(task.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
