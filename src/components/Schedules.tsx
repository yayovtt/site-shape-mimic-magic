
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit, Check, X, Calendar, Share2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Schedule {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  category: string;
  priority: number;
  created_at: string;
}

const categories = [
  { value: "work", label: "עבודה", color: "bg-blue-100 text-blue-800" },
  { value: "personal", label: "אישי", color: "bg-green-100 text-green-800" },
  { value: "health", label: "בריאות", color: "bg-red-100 text-red-800" },
  { value: "study", label: "לימודים", color: "bg-purple-100 text-purple-800" },
  { value: "family", label: "משפחה", color: "bg-yellow-100 text-yellow-800" },
  { value: "general", label: "כללי", color: "bg-gray-100 text-gray-800" }
];

const priorities = [
  { value: 1, label: "נמוך", color: "text-gray-500" },
  { value: 2, label: "בינוני", color: "text-yellow-500" },
  { value: 3, label: "גבוה", color: "text-red-500" }
];

export const Schedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
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
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  useEffect(() => {
    const savedSchedules = localStorage.getItem("schedules");
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("schedules", JSON.stringify(schedules));
  }, [schedules]);

  const addSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.title.trim() || !newSchedule.start_time || !newSchedule.end_time) return;

    if (new Date(newSchedule.start_time) >= new Date(newSchedule.end_time)) {
      toast({
        title: "שגיאה",
        description: "זמן הסיום חייב להיות אחרי זמן ההתחלה",
        variant: "destructive",
      });
      return;
    }

    const schedule: Schedule = {
      id: crypto.randomUUID(),
      title: newSchedule.title,
      description: newSchedule.description,
      start_time: newSchedule.start_time,
      end_time: newSchedule.end_time,
      category: newSchedule.category,
      priority: newSchedule.priority,
      created_at: new Date().toISOString(),
    };

    setSchedules(prev => [...prev, schedule].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    ));
    setNewSchedule({ title: "", description: "", start_time: "", end_time: "", category: "general", priority: 1 });
    
    toast({
      title: "הפעילות נוספה בהצלחה",
    });
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
    toast({
      title: "הפעילות נמחקה בהצלחה",
    });
  };

  const shareSchedule = (schedule: Schedule) => {
    const startDate = new Date(schedule.start_time);
    const endDate = new Date(schedule.end_time);
    const categoryLabel = categories.find(c => c.value === schedule.category)?.label || schedule.category;
    const priorityLabel = priorities.find(p => p.value === schedule.priority)?.label || 'רגיל';
    
    const text = `פעילות: ${schedule.title}\nתאריך: ${startDate.toLocaleDateString('he-IL')}\nזמן: ${startDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}\nקטגוריה: ${categoryLabel}\nעדיפות: ${priorityLabel}${schedule.description ? `\nפרטים: ${schedule.description}` : ''}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getSchedulesForDate = (date: string) => {
    return schedules.filter(schedule => 
      schedule.start_time.startsWith(date)
    );
  };

  const getSchedulesForWeek = (date: string) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const weekSchedules = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      weekSchedules.push({
        date: dateStr,
        dayName: currentDate.toLocaleDateString('he-IL', { weekday: 'long' }),
        schedules: getSchedulesForDate(dateStr)
      });
    }
    return weekSchedules;
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryStyle = (category: string) => {
    return categories.find(c => c.value === category)?.color || "bg-gray-100 text-gray-800";
  };

  const getPriorityStyle = (priority: number) => {
    return priorities.find(p => p.value === priority)?.color || "text-gray-500";
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            הוסף פעילות לוח זמנים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addSchedule} className="space-y-4">
            <Input
              placeholder="כותרת הפעילות"
              value={newSchedule.title}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <Textarea
              placeholder="תיאור הפעילות (אופציונלי)"
              value={newSchedule.description}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, description: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="datetime-local"
                placeholder="זמן התחלה"
                value={newSchedule.start_time}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, start_time: e.target.value }))}
                required
              />
              <Input
                type="datetime-local"
                placeholder="זמן סיום"
                value={newSchedule.end_time}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, end_time: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newSchedule.category}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, category: e.target.value }))}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newSchedule.priority}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
            <Button 
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600"
            >
              הוסף לוח זמנים
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* תצוגת לוח זמנים */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>לוח זמנים מפורט</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("day")}
              >
                יום
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("week")}
              >
                שבוע
              </Button>
            </div>
          </div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </CardHeader>
        <CardContent>
          {viewMode === "day" ? (
            <div className="space-y-2">
              {getSchedulesForDate(selectedDate).length === 0 ? (
                <p className="text-center text-gray-500 py-8">אין פעילויות מתוכננות ליום זה</p>
              ) : (
                getSchedulesForDate(selectedDate).map((schedule) => (
                  <Card key={schedule.id} className="border-l-4 border-indigo-500">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{schedule.title}</h4>
                          {schedule.description && (
                            <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-sm">
                              <Clock className="w-4 h-4" />
                              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${getCategoryStyle(schedule.category)}`}>
                              {categories.find(c => c.value === schedule.category)?.label}
                            </span>
                            <span className={`text-sm font-medium ${getPriorityStyle(schedule.priority)}`}>
                              {priorities.find(p => p.value === schedule.priority)?.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => shareSchedule(schedule)}
                          >
                            <Share2 className="w-4 h-4" />
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
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {getSchedulesForWeek(selectedDate).map((day) => (
                <div key={day.date} className="border rounded p-2 min-h-[200px]">
                  <h4 className="font-medium text-center mb-2">{day.dayName}</h4>
                  <p className="text-xs text-center text-gray-500 mb-2">
                    {new Date(day.date).toLocaleDateString('he-IL')}
                  </p>
                  <div className="space-y-1">
                    {day.schedules.map((schedule) => (
                      <div key={schedule.id} className="text-xs p-1 bg-indigo-50 rounded">
                        <p className="font-medium truncate">{schedule.title}</p>
                        <p className="text-gray-600">
                          {formatTime(schedule.start_time)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
