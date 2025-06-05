
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit, Check, X, Target, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_date?: string;
  completed: boolean;
  created_at: string;
}

export const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({ title: "", description: "", target_date: "" });
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: "", description: "", target_date: "" });
  const { toast } = useToast();

  useEffect(() => {
    const savedGoals = localStorage.getItem("goals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    const goal: Goal = {
      id: crypto.randomUUID(),
      title: newGoal.title,
      description: newGoal.description,
      target_date: newGoal.target_date,
      completed: false,
      created_at: new Date().toISOString(),
    };

    setGoals(prev => [goal, ...prev]);
    setNewGoal({ title: "", description: "", target_date: "" });
    
    toast({
      title: "היעד נוצר בהצלחה",
    });
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    toast({
      title: "היעד נמחק בהצלחה",
    });
  };

  const startEdit = (goal: Goal) => {
    setEditingGoal(goal.id);
    setEditData({ 
      title: goal.title, 
      description: goal.description || "", 
      target_date: goal.target_date || "" 
    });
  };

  const saveEdit = (id: string) => {
    if (!editData.title.trim()) return;

    setGoals(prev => 
      prev.map(goal => 
        goal.id === id 
          ? { ...goal, title: editData.title, description: editData.description, target_date: editData.target_date }
          : goal
      )
    );
    
    setEditingGoal(null);
    setEditData({ title: "", description: "", target_date: "" });
    toast({
      title: "היעד עודכן בהצלחה",
    });
  };

  const cancelEdit = () => {
    setEditingGoal(null);
    setEditData({ title: "", description: "", target_date: "" });
  };

  const shareGoal = (goal: Goal) => {
    const text = `יעד שלי: ${goal.title}${goal.description ? `\n${goal.description}` : ''}${goal.target_date ? `\nתאריך יעד: ${new Date(goal.target_date).toLocaleDateString('he-IL')}` : ''}`;
    
    // WhatsApp sharing
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

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
                      onCheckedChange={() => toggleGoal(goal.id)}
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
