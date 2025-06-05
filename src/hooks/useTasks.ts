
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  const createTask = {
    mutate: ({ title, description }: { title: string; description?: string }) => {
      const task: Task = {
        id: crypto.randomUUID(),
        title,
        description,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setTasks(prev => [task, ...prev]);
      toast({
        title: "המשימה נוצרה בהצלחה",
      });
    }
  };

  const updateTask = {
    mutate: ({ id, ...updates }: Partial<Task> & { id: string }) => {
      setTasks(prev => 
        prev.map(task => 
          task.id === id 
            ? { ...task, ...updates, updated_at: new Date().toISOString() }
            : task
        )
      );
    }
  };

  const deleteTask = {
    mutate: (id: string) => {
      setTasks(prev => prev.filter(task => task.id !== id));
      toast({
        title: "המשימה נמחקה בהצלחה",
      });
    }
  };

  return {
    tasks,
    isLoading: false,
    createTask,
    updateTask,
    deleteTask,
  };
};
