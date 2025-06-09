
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Trash2, Edit, X } from "lucide-react";
import { useTasksWithAuth } from "@/hooks/useTasksWithAuth";
import { useAuth } from "@/contexts/AuthContext";

export const TaskManagerFixed = () => {
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasksWithAuth();
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const { user } = useAuth();

  console.log('TaskManager - Current user:', user);
  console.log('TaskManager - Tasks:', tasks);
  console.log('TaskManager - Loading:', isLoading);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    console.log('Adding new task:', newTask);
    await createTask.mutate({ title: newTask });
    setNewTask("");
  };

  const toggleTask = async (id: string, completed: boolean) => {
    console.log('Toggling task:', { id, completed });
    await updateTask.mutate({ id, completed: !completed });
  };

  const handleDeleteTask = async (id: string) => {
    console.log('Deleting task:', id);
    await deleteTask.mutate(id);
  };

  const startEdit = (id: string, title: string) => {
    console.log('Starting edit:', { id, title });
    setEditingTask(id);
    setEditTitle(title);
  };

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) return;

    console.log('Saving edit:', { id, title: editTitle });
    await updateTask.mutate({ id, title: editTitle });
    setEditingTask(null);
    setEditTitle("");
  };

  const cancelEdit = () => {
    console.log('Canceling edit');
    setEditingTask(null);
    setEditTitle("");
  };

  if (!user) {
    return (
      <div className="text-center text-gray-500 py-8 text-lg" dir="rtl">
        יש להתחבר כדי לנהל משימות
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 py-8 text-lg" dir="rtl">
        טוען משימות...
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <form onSubmit={handleAddTask} className="flex gap-2">
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
                  onClick={() => startEdit(task.id, task.title)}
                >
                  <Edit className="w-5 h-5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteTask(task.id)}
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
