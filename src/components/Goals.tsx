
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Target, Check, Trash2, Edit, X, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_date?: string;
  completed: boolean;
  created_at: string;
  user_id?: string;
}

export const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: ""
  });
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    title: "",
    description: ""
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data: goalsData, error } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(goalsData || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast({
        title: "שגיאה בטעינת יעדים",
        variant: "destructive",
      });
    }
  };

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    try {
      const { error } = await supabase
        .from("goals")
        .insert({
          title: newGoal.title,
          description: newGoal.description,
          target_date: selectedDate?.toISOString().split('T')[0],
          completed: false
        });

      if (error) throw error;

      await fetchGoals();
      setNewGoal({ title: "", description: "" });
      setSelectedDate(undefined);

      toast({
        title: "היעד נוצר בהצלחה",
      });
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        title: "שגיאה ביצירת יעד",
        variant: "destructive",
      });
    }
  };

  const toggleGoal = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("goals")
        .update({ completed: !completed })
        .eq("id", id);

      if (error) throw error;

      await fetchGoals();
      toast({
        title: completed ? "היעד סומן כלא הושג" : "כל הכבוד! היעד הושג",
      });
    } catch (error) {
      console.error("Error updating goal:", error);
      toast({
        title: "שגיאה בעדכון יעד",
        variant: "destructive",
      });
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchGoals();
      toast({
        title: "היעד נמחק בהצלחה",
      });
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "שגיאה במחיקת יעד",
        variant: "destructive",
      });
    }
  };

  const startEdit = (goal: Goal) => {
    setEditingGoal(goal.id);
    setEditData({
      title: goal.title,
      description: goal.description || ""
    });
  };

  const saveEdit = async (id: string) => {
    if (!editData.title.trim()) return;

    try {
      const { error } = await supabase
        .from("goals")
        .update({
          title: editData.title,
          description: editData.description
        })
        .eq("id", id);

      if (error) throw error;

      await fetchGoals();
      setEditingGoal(null);
      setEditData({ title: "", description: "" });

      toast({
        title: "היעד עודכן בהצלחה",
      });
    } catch (error) {
      console.error("Error updating goal:", error);
      toast({
        title: "שגיאה בעדכון יעד",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingGoal(null);
    setEditData({ title: "", description: "" });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Plus className="w-6 h-6" />
            הוסף יעד חדש
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addGoal} className="space-y-4">
            <Input
              placeholder="כותרת היעד"
              value={newGoal.title}
              onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
              required
              className="text-lg"
            />
            <Textarea
              placeholder="תיאור היעד (אופציונלי)"
              value={newGoal.description}
              onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              className="text-lg"
            />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-right text-lg">
                  <CalendarIcon className="ml-2 h-5 w-5" />
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "תאריך יעד (אופציונלי)"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button 
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-lg py-3"
              disabled={!newGoal.title.trim()}
            >
              הוסף יעד
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {goals.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500 text-lg">
              אין יעדים עדיין. הוסף יעד ראשון!
            </CardContent>
          </Card>
        )}
        
        {goals.map((goal) => (
          <Card key={goal.id} className={goal.completed ? "bg-green-50 border-green-200" : ""}>
            <CardContent className="p-6">
              {editingGoal === goal.id ? (
                <form onSubmit={(e) => { e.preventDefault(); saveEdit(goal.id); }} className="space-y-4">
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="text-lg"
                  />
                  <Textarea
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    className="text-lg"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" className="text-lg">
                      <Check className="w-5 h-5" />
                      שמור
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelEdit} className="text-lg">
                      <X className="w-5 h-5" />
                      ביטול
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Button
                      size="sm"
                      variant={goal.completed ? "default" : "outline"}
                      onClick={() => toggleGoal(goal.id, goal.completed)}
                      className={goal.completed ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      <Target className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                      <h3 className={`font-medium text-xl mb-2 ${goal.completed ? "line-through text-gray-500" : ""}`}>
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className={`text-lg ${goal.completed ? "text-gray-400" : "text-gray-600"}`}>
                          {goal.description}
                        </p>
                      )}
                      {goal.target_date && (
                        <p className={`mt-1 text-lg ${goal.completed ? "text-gray-400" : "text-gray-500"}`}>
                          יעד: {format(new Date(goal.target_date), "dd/MM/yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(goal)}
                    >
                      <Edit className="w-5 h-5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteGoal(goal.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
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
