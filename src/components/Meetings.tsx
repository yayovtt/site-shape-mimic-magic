
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Trash2, Edit, Check, X, CalendarIcon, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface Meeting {
  id: string;
  title: string;
  description?: string;
  meeting_date: string;
  duration: number;
  created_at: string;
  user_id: string;
}

export const Meetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    meeting_date: "",
    duration: 60
  });
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    meeting_date: "",
    duration: 60
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("09:00");
  const { toast } = useToast();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const { data: meetingsData, error } = await supabase
        .from("meetings")
        .select("*")
        .order("meeting_date", { ascending: true });

      if (error) throw error;
      setMeetings(meetingsData || []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      toast({
        title: "שגיאה בטעינת פגישות",
        variant: "destructive",
      });
    }
  };

  const addMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title.trim() || !selectedDate) return;

    try {
      const meetingDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      meetingDateTime.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase
        .from("meetings")
        .insert({
          title: newMeeting.title,
          description: newMeeting.description,
          meeting_date: meetingDateTime.toISOString(),
          duration: newMeeting.duration,
          user_id: 'temp-user-id' // Adding user_id temporarily
        });

      if (error) throw error;

      await fetchMeetings();
      setNewMeeting({ title: "", description: "", meeting_date: "", duration: 60 });
      setSelectedDate(undefined);
      setSelectedTime("09:00");

      toast({
        title: "הפגישה נוצרה בהצלחה",
      });
    } catch (error) {
      console.error("Error adding meeting:", error);
      toast({
        title: "שגיאה ביצירת פגישה",
        variant: "destructive",
      });
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      const { error } = await supabase
        .from("meetings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchMeetings();
      toast({
        title: "הפגישה נמחקה בהצלחה",
      });
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast({
        title: "שגיאה במחיקת פגישה",
        variant: "destructive",
      });
    }
  };

  const startEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting.id);
    setEditData({
      title: meeting.title,
      description: meeting.description || "",
      meeting_date: meeting.meeting_date,
      duration: meeting.duration
    });
  };

  const saveEdit = async (id: string) => {
    if (!editData.title.trim()) return;

    try {
      const { error } = await supabase
        .from("meetings")
        .update({
          title: editData.title,
          description: editData.description,
          duration: editData.duration
        })
        .eq("id", id);

      if (error) throw error;

      await fetchMeetings();
      setEditingMeeting(null);
      setEditData({ title: "", description: "", meeting_date: "", duration: 60 });

      toast({
        title: "הפגישה עודכנה בהצלחה",
      });
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast({
        title: "שגיאה בעדכון פגישה",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingMeeting(null);
    setEditData({ title: "", description: "", meeting_date: "", duration: 60 });
  };

  const shareViaWhatsApp = (meeting: Meeting) => {
    const meetingDate = new Date(meeting.meeting_date);
    const message = `פגישה: ${meeting.title}\nתאריך ושעה: ${format(meetingDate, "dd/MM/yyyy HH:mm")}\nמשך: ${meeting.duration} דקות${meeting.description ? `\nתיאור: ${meeting.description}` : ''}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            הוסף פגישה חדשה
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addMeeting} className="space-y-4">
            <Input
              placeholder="כותרת הפגישה"
              value={newMeeting.title}
              onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <Textarea
              placeholder="תיאור הפגישה (אופציונלי)"
              value={newMeeting.description}
              onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-right">
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "בחר תאריך"}
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

              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>

            <Input
              type="number"
              placeholder="משך הפגישה (דקות)"
              value={newMeeting.duration}
              onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
              min="15"
              max="480"
            />

            <Button 
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600"
              disabled={!newMeeting.title.trim() || !selectedDate}
            >
              הוסף פגישה
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {meetings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              אין פגישות עדיין. הוסף פגישה ראשונה!
            </CardContent>
          </Card>
        )}
        
        {meetings.map((meeting) => (
          <Card key={meeting.id}>
            <CardContent className="p-4">
              {editingMeeting === meeting.id ? (
                <form onSubmit={(e) => { e.preventDefault(); saveEdit(meeting.id); }} className="space-y-3">
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
                    type="number"
                    value={editData.duration}
                    onChange={(e) => setEditData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    min="15"
                    max="480"
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
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{meeting.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {format(new Date(meeting.meeting_date), "dd/MM/yyyy HH:mm")} • {meeting.duration} דקות
                    </p>
                    {meeting.description && (
                      <p className="text-gray-600 text-sm mt-1">{meeting.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => shareViaWhatsApp(meeting)}
                      title="שתף ב-WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(meeting)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMeeting(meeting.id)}
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
