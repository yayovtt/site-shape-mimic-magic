
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useTasksWithAuth = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  console.log('useTasksWithAuth - Current user:', user);
  console.log('useTasksWithAuth - Tasks:', tasks);

  const fetchTasks = async () => {
    if (!user) {
      console.log('No user found, skipping fetch tasks');
      setTasks([]);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Fetching tasks for user:', user.id);
      const { data: tasksData, error } = await supabase
        .from("tasks")
        .select("*")
        .eq('user_id', user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      
      console.log('Tasks fetched successfully:', tasksData);
      setTasks(tasksData || []);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "שגיאה בטעינת משימות",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
      setIsLoading(false);
    }
  }, [user]);

  const createTask = {
    mutate: async ({ title, description }: { title: string; description?: string }) => {
      if (!user) {
        toast({
          title: "שגיאה: משתמש לא מחובר",
          variant: "destructive",
        });
        return;
      }

      try {
        console.log('Creating task:', { title, description, user_id: user.id });
        
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            title,
            description,
            completed: false,
            user_id: user.id
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating task:', error);
          throw error;
        }

        console.log('Task created successfully:', data);
        await fetchTasks();
        
        toast({
          title: "המשימה נוצרה בהצלחה",
        });
      } catch (error: any) {
        console.error("Error creating task:", error);
        toast({
          title: "שגיאה ביצירת משימה",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const updateTask = {
    mutate: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      if (!user) {
        toast({
          title: "שגיאה: משתמש לא מחובר",
          variant: "destructive",
        });
        return;
      }

      try {
        console.log('Updating task:', { id, updates });
        
        const { error } = await supabase
          .from("tasks")
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          console.error('Error updating task:', error);
          throw error;
        }

        console.log('Task updated successfully');
        await fetchTasks();
      } catch (error: any) {
        console.error("Error updating task:", error);
        toast({
          title: "שגיאה בעדכון משימה",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const deleteTask = {
    mutate: async (id: string) => {
      if (!user) {
        toast({
          title: "שגיאה: משתמש לא מחובר",
          variant: "destructive",
        });
        return;
      }

      try {
        console.log('Deleting task:', id);
        
        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          console.error('Error deleting task:', error);
          throw error;
        }

        console.log('Task deleted successfully');
        await fetchTasks();
        
        toast({
          title: "המשימה נמחקה בהצלחה",
        });
      } catch (error: any) {
        console.error("Error deleting task:", error);
        toast({
          title: "שגיאה במחיקת משימה",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
  };
};
