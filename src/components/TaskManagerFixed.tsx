
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit, Check, X } from "lucide-react";
import { useTasksWithAuth } from "@/hooks/useTasksWithAuth";

export const TaskManagerFixed = () => {
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasksWithAuth();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  console.log('TaskManagerFixed rendered with tasks:', tasks);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) {
      return;
    }

    console.log('Adding new task:', { title: newTaskTitle, description: newTaskDescription });
    
    try {
      await createTask.mutate({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined
      });
      
      setNewTaskTitle("");
      setNewTaskDescription("");
      console.log('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleToggleComplete = async (task: any) => {
    console.log('Toggling task completion:', task.id, !task.completed);
    try {
      await updateTask.mutate({
        id: task.id,
        completed: !task.completed
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    console.log('Deleting task:', taskId);
    try {
      await deleteTask.mutate(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const startEdit = (task: any) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const saveEdit = async () => {
    if (!editTitle.trim() || !editingTask) return;

    try {
      await updateTask.mutate({
        id: editingTask,
        title: editTitle.trim(),
        description: editDescription.trim() || undefined
      });
      
      setEditingTask(null);
      setEditTitle("");
      setEditDescription("");
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditTitle("");
    setEditDescription("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">טוען משימות...</div>
      </div>
    );
  }

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
          <form onSubmit={handleAddTask} className="space-y-4">
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
              className="resize-none h-24"
            />
            <Button 
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600"
              disabled={!newTaskTitle.trim()}
            >
              <Plus className="w-4 h-4 ml-2" />
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
          <Card key={task.id} className={`transition-all ${task.completed ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              {editingTask === task.id ? (
                <form onSubmit={(e) => { e.preventDefault(); saveEdit(); }} className="space-y-3">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="כותרת המשימה"
                    required
                  />
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="תיאור המשימה"
                    className="resize-none h-20"
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
                      onCheckedChange={() => handleToggleComplete(task)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-sm text-gray-600 mt-1 ${task.completed ? 'line-through' : ''}`}>
                          {task.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        נוצר: {new Date(task.created_at).toLocaleDateString('he-IL')}
                      </p>
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
                      onClick={() => handleDeleteTask(task.id)}
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
