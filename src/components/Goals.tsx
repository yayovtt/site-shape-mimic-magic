
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit, Check, X, Target, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_date?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({ title: "", description: "", target_date: "" });
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: "", description: "", target_date: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      console.error("Error fetching goals:", error);
      toast({
        title: "שגיאה בטעינת היעדים",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          description: newGoal.description || null,
          target_date: newGoal.target_date || null,
        });

      if (error) throw error;

      setNewGoal({ title: "", description: "", target_date: "" });
      fetchGoals();
      
      toast({
        title: "היעד נוצר בהצלחה",
      });
    } catch (error: any) {
      console.error("Error creating goal:", error);
      toast({
        title: "שגיאה ביצירת היעד",
        description: error.message,
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
      fetchGoals();
    } catch (error: any) {
      console.error("Error updating goal:", error);
      toast({
        title: "שגיאה בעדכון היעד",
        description: error.message,
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
      fetchGoals();
      
      toast({
        title: "היעד נמחק בהצלחה",
      });
    } catch (error: any) {
      console.error("Error deleting goal:", error);
      toast({
        title: "שגיאה במחיקת היעד",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startEdit = (goal: Goal) => {
    setEditingGoal(goal.id);
    setEditData({ 
      title: goal.title, 
      description: goal.description || "", 
      target_date: goal.target_date || "" 
    });
  };

  const saveEdit = async (id: string) => {
    if (!editData.title.trim()) return;

    try {
      const { error } = await supabase
        .from("goals")
        .update({
          title: editData.title,
          description: editData.description || null,
          target_date: editData.target_date || null,
        })
        .eq("id", id);

      if (error) throw error;

      setEditingGoal(null);
      setEditData({ title: "", description: "", target_date: "" });
      fetchGoals();
      
      toast({
        title: "היעד עודכן בהצלחה",
      });
    } catch (error: any) {
      console.error("Error updating goal:", error);
      toast({
        title: "שגיאה בעדכון היעד",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingGoal(null);
    setEditData({ title: "", description: "", target_date: "" });
  };

  const shareGoal = (goal: Goal) => {
    const text = `יעד שלי: ${goal.title}${goal.description ? `\n${goal.description}` : ''}${goal.target_date ? `\nתאריך יעד: ${new Date(goal.target_date).toLocaleDateString('he-IL')}` : ''}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64" dir="rtl">
        <div className="text-gray-500">טוען יעדים...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
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
            />
            <Textarea
              placeholder="תיאור היעד (אופציונלי)"
              value={newGoal.description}
              onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
            />
            <Input
              type="date"
              placeholder="תאריך יעד"
              value={newGoal.target_date}
              onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
            />
            <Button 
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              הוסף יעד
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {goals.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              אין יעדים עדיין. הוסף יעד ראשון!
            </CardContent>
          </Card>
        )}
        
        {goals.map((goal) => (
          <Card key={goal.id} className={goal.completed ? "opacity-75 bg-green-50" : ""}>
            <CardContent className="p-4">
              {editingGoal === goal.id ? (
                <form onSubmit={(e) => { e.preventDefault(); saveEdit(goal.id); }} className="space-y-3">
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                  <Textarea
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Input
                    type="date"
                    value={editData.target_date}
                    onChange={(e) => setEditData(prev => ({ ...prev, target_date: e.target.value }))}
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
                      checked={goal.completed}
                      onCheckedChange={() => toggleGoal(goal.id, goal.completed)}
                    />
                    <div className={goal.completed ? "line-through" : ""}>
                      <h3 className="font-medium">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-gray-600 text-sm mt-1">{goal.description}</p>
                      )}
                      {goal.target_date && (
                        <p className="text-blue-600 text-sm mt-1">
                          תאריך יעד: {new Date(goal.target_date).toLocaleDateString('he-IL')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => shareGoal(goal)}
                      title="שתף ב-WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(goal)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteGoal(goal.id)}
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
