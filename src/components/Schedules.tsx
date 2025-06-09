import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Check, X, Clock, Share2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  { value: "work", label: "עבודה" },
  { value: "personal", label: "אישי" },
  { value: "health", label: "בריאות" },
  { value: "education", label: "לימודים" },
  { value: "family", label: "משפחה" },
  { value: "general", label: "כללי" }
];

const priorities = [
  { value: 1, label: "נמוכה", color: "text-green-600" },
  { value: 2, label: "בינונית", color: "text-yellow-600" },
  { value: 3, label: "גבוהה", color: "text-red-600" }
];

export const Schedules = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [newSchedule, setNewSchedule] = useState({ 
    title: "", 
    description: "", 
    start_time: "", 
    end_time: "",
    category: "general",
    priority: 1
  });
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [editData, setEditData] = useState({ 
    title: "", 
    description: "", 
    start_time: "", 
    end_time: "",
    category: "general",
    priority: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  console.log('Schedules - Current user:', user);
  console.log('Schedules - Schedules:', schedules);

  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user]);

  const fetchSchedules = async () => {
    if (!user) {
      console.log('No user found, skipping fetch schedules');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching schedules for user:', user.id);
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq('user_id', user.id)
        .order("start_time", { ascending: true });

      if (error) {
        console.error('Error fetching schedules:', error);
        throw error;
      }
      
      console.log('Schedules fetched successfully:', data);
      const schedulesData = data ? [...data] : [];
      setSchedules(schedulesData);
    } catch (error: any) {
      console.error("Error fetching schedules:", error);
      toast({
        title: "שגיאה בטעינת לוח הזמנים",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.title.trim() || !newSchedule.start_time || !newSchedule.end_time) return;

    if (!user) {
      toast({
        title: "שגיאה: משתמש לא מחובר",
        variant: "destructive",
      });
      return;
    }

    if (new Date(newSchedule.end_time) <= new Date(newSchedule.start_time)) {
      toast({
        title: "שגיאה",
        description: "זמן הסיום חייב להיות אחרי זמן ההתחלה",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating schedule:', { ...newSchedule, user_id: user.id });
      
      const { data, error } = await supabase
        .from("schedules")
        .insert({
          title: newSchedule.title,
          description: newSchedule.description || null,
          start_time: newSchedule.start_time,
          end_time: newSchedule.end_time,
          category: newSchedule.category,
          priority: newSchedule.priority,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating schedule:', error);
        throw error;
      }

      console.log('Schedule created successfully:', data);
      setNewSchedule({ 
        title: "", 
        description: "", 
        start_time: "", 
        end_time: "",
        category: "general",
        priority: 1
      });
      await fetchSchedules();
      
      toast({
        title: "האירוע נוצר בהצלחה",
      });
    } catch (error: any) {
      console.error("Error creating schedule:", error);
      toast({
        title: "שגיאה ביצירת האירוע",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from("schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchSchedules();
      
      toast({
        title: "האירוע נמחק בהצלחה",
      });
    } catch (error: any) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "שגיאה במחיקת האירוע",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startEdit = (schedule: any) => {
    setEditingSchedule(schedule.id);
    setEditData({ 
      title: schedule.title, 
      description: schedule.description || "", 
      start_time: schedule.start_time.slice(0, 16),
      end_time: schedule.end_time.slice(0, 16),
      category: schedule.category || "general",
      priority: schedule.priority || 1
    });
  };

  const saveEdit = async (id: string) => {
    if (!editData.title.trim() || !editData.start_time || !editData.end_time) return;

    if (new Date(editData.end_time) <= new Date(editData.start_time)) {
      toast({
        title: "שגיאה",
        description: "זמן הסיום חייב להיות אחרי זמן ההתחלה",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("schedules")
        .update({
          title: editData.title,
          description: editData.description || null,
          start_time: editData.start_time,
          end_time: editData.end_time,
          category: editData.category,
          priority: editData.priority,
        })
        .eq("id", id);

      if (error) throw error;

      setEditingSchedule(null);
      setEditData({ 
        title: "", 
        description: "", 
        start_time: "", 
        end_time: "",
        category: "general",
        priority: 1
      });
      fetchSchedules();
      
      toast({
        title: "האירוע עודכן בהצלחה",
      });
    } catch (error: any) {
      console.error("Error updating schedule:", error);
      toast({
        title: "שגיאה בעדכון האירוע",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingSchedule(null);
    setEditData({ 
      title: "", 
      description: "", 
      start_time: "", 
      end_time: "",
      category: "general",
      priority: 1
    });
  };

  const shareSchedule = (schedule: any) => {
    const startTime = new Date(schedule.start_time);
    const endTime = new Date(schedule.end_time);
    const categoryLabel = categories.find(c => c.value === schedule.category)?.label || schedule.category;
    const priorityLabel = priorities.find(p => p.value === schedule.priority)?.label || schedule.priority;
    
    const text = `אירוע: ${schedule.title}\nתאריך: ${startTime.toLocaleDateString('he-IL')}\nשעות: ${startTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}\nקטגוריה: ${categoryLabel}\nעדיפות: ${priorityLabel}${schedule.description ? `\nתיאור: ${schedule.description}` : ''}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getDuration = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}:${diffMinutes.toString().padStart(2, '0')} שעות`;
    }
    return `${diffMinutes} דקות`;
  };

  if (!user) {
    return (
      <div className="text-center text-gray-500 py-8 text-lg" dir="rtl">
        יש להתחבר כדי לנהל אירועים
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64" dir="rtl">
        <div className="text-gray-500">טוען לוח זמנים...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            הוסף אירוע חדש ללוח הזמנים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addSchedule} className="space-y-4">
            <Input
              placeholder="כותרת האירוע"
              value={newSchedule.title}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <Textarea
              placeholder="תיאור האירוע (אופציונלי)"
              value={newSchedule.description}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, description: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">זמן התחלה</label>
                <Input
                  type="datetime-local"
                  value={newSchedule.start_time}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, start_time: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">זמן סיום</label>
                <Input
                  type="datetime-local"
                  value={newSchedule.end_time}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, end_time: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">קטגוריה</label>
                <Select value={newSchedule.category} onValueChange={(value) => setNewSchedule(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">עדיפות</label>
                <Select value={newSchedule.priority.toString()} onValueChange={(value) => setNewSchedule(prev => ({ ...prev, priority: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value.toString()}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              הוסף לוח זמנים
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {schedules.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              אין אירועים מתוכננים. הוסף אירוע ראשון!
            </CardContent>
          </Card>
        )}
        
        {schedules.map((schedule) => {
          const priorityInfo = priorities.find(p => p.value === schedule.priority);
          const categoryLabel = categories.find(c => c.value === schedule.category)?.label || schedule.category;
          
          return (
            <Card key={schedule.id} className={`border-r-4 ${
              schedule.priority === 3 ? 'border-r-red-500' : 
              schedule.priority === 2 ? 'border-r-yellow-500' : 'border-r-green-500'
            }`}>
              <CardContent className="p-4">
                {editingSchedule === schedule.id ? (
                  <form onSubmit={(e) => { e.preventDefault(); saveEdit(schedule.id); }} className="space-y-3">
                    <Input
                      value={editData.title}
                      onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                    <Textarea
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="datetime-local"
                        value={editData.start_time}
                        onChange={(e) => setEditData(prev => ({ ...prev, start_time: e.target.value }))}
                        required
                      />
                      <Input
                        type="datetime-local"
                        value={editData.end_time}
                        onChange={(e) => setEditData(prev => ({ ...prev, end_time: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Select value={editData.category} onValueChange={(value) => setEditData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={editData.priority.toString()} onValueChange={(value) => setEditData(prev => ({ ...prev, priority: parseInt(value) }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value.toString()}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-lg">{schedule.title}</h3>
                        <span className={`flex items-center gap-1 text-xs ${priorityInfo?.color}`}>
                          <AlertCircle className="w-3 h-3" />
                          {priorityInfo?.label}
                        </span>
                      </div>
                      {schedule.description && (
                        <p className="text-gray-600 text-sm mb-2">{schedule.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(schedule.start_time).toLocaleDateString('he-IL')}
                        </span>
                        <span>
                          {new Date(schedule.start_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(schedule.end_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>({getDuration(schedule.start_time, schedule.end_time)})</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{categoryLabel}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => shareSchedule(schedule)}
                        title="שתף ב-WhatsApp"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(schedule)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSchedule(schedule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
