
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit, Check, X, Calendar, Share2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Meeting {
  id: string;
  title: string;
  description?: string;
  meeting_date: string;
  duration: number;
  location?: string;
  created_at: string;
  updated_at: string;
}

export const Meetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [newMeeting, setNewMeeting] = useState({ 
    title: "", 
    description: "", 
    meeting_date: "", 
    duration: 60,
    location: ""
  });
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null);
  const [editData, setEditData] = useState({ 
    title: "", 
    description: "", 
    meeting_date: "", 
    duration: 60,
    location: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("meeting_date", { ascending: true });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error: any) {
      console.error("Error fetching meetings:", error);
      toast({
        title: "שגיאה בטעינת הפגישות",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title.trim() || !newMeeting.meeting_date) return;

    try {
      const { error } = await supabase
        .from("meetings")
        .insert({
          title: newMeeting.title,
          description: newMeeting.description || null,
          meeting_date: newMeeting.meeting_date,
          duration: newMeeting.duration,
          location: newMeeting.location || null,
        });

      if (error) throw error;

      setNewMeeting({ title: "", description: "", meeting_date: "", duration: 60, location: "" });
      fetchMeetings();
      
      toast({
        title: "הפגישה נוצרה בהצלחה",
      });
    } catch (error: any) {
      console.error("Error creating meeting:", error);
      toast({
        title: "שגיאה ביצירת הפגישה",
        description: error.message,
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
      fetchMeetings();
      
      toast({
        title: "הפגישה נמחקה בהצלחה",
      });
    } catch (error: any) {
      console.error("Error deleting meeting:", error);
      toast({
        title: "שגיאה במחיקת הפגישה",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting.id);
    setEditData({ 
      title: meeting.title, 
      description: meeting.description || "", 
      meeting_date: meeting.meeting_date.slice(0, 16),
      duration: meeting.duration,
      location: meeting.location || ""
    });
  };

  const saveEdit = async (id: string) => {
    if (!editData.title.trim() || !editData.meeting_date) return;

    try {
      const { error } = await supabase
        .from("meetings")
        .update({
          title: editData.title,
          description: editData.description || null,
          meeting_date: editData.meeting_date,
          duration: editData.duration,
          location: editData.location || null,
        })
        .eq("id", id);

      if (error) throw error;

      setEditingMeeting(null);
      setEditData({ title: "", description: "", meeting_date: "", duration: 60, location: "" });
      fetchMeetings();
      
      toast({
        title: "הפגישה עודכנה בהצלחה",
      });
    } catch (error: any) {
      console.error("Error updating meeting:", error);
      toast({
        title: "שגיאה בעדכון הפגישה",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingMeeting(null);
    setEditData({ title: "", description: "", meeting_date: "", duration: 60, location: "" });
  };

  const shareMeeting = (meeting: Meeting) => {
    const meetingDateTime = new Date(meeting.meeting_date);
    const text = `פגישה: ${meeting.title}\nתאריך: ${meetingDateTime.toLocaleDateString('he-IL')}\nשעה: ${meetingDateTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}\nמשך: ${meeting.duration} דקות${meeting.location ? `\nמיקום: ${meeting.location}` : ''}${meeting.description ? `\nתיאור: ${meeting.description}` : ''}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64" dir="rtl">
        <div className="text-gray-500">טוען פגישות...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            קבע פגישה חדשה
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addMeeting} className="space-y-4">
            <Input
              placeholder="נושא הפגישה"
              value={newMeeting.title}
              onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <Textarea
              placeholder="תיאור הפגישה (אופציונלי)"
              value={newMeeting.description}
              onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
            />
            <Input
              type="datetime-local"
              placeholder="תאריך ושעת הפגישה"
              value={newMeeting.meeting_date}
              onChange={(e) => setNewMeeting(prev => ({ ...prev, meeting_date: e.target.value }))}
              required
            />
            <Input
              type="number"
              placeholder="משך בדקות"
              value={newMeeting.duration}
              onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
              min="15"
              max="480"
            />
            <Input
              placeholder="מיקום (אופציונלי)"
              value={newMeeting.location}
              onChange={(e) => setNewMeeting(prev => ({ ...prev, location: e.target.value }))}
            />
            <Button 
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600"
            >
              קבע פגישה
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {meetings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              אין פגישות מתוכננות. קבע פגישה ראשונה!
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
                    type="datetime-local"
                    value={editData.meeting_date}
                    onChange={(e) => setEditData(prev => ({ ...prev, meeting_date: e.target.value }))}
                    required
                  />
                  <Input
                    type="number"
                    value={editData.duration}
                    onChange={(e) => setEditData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    min="15"
                    max="480"
                  />
                  <Input
                    value={editData.location}
                    onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
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
                    {meeting.description && (
                      <p className="text-gray-600 text-sm mt-1">{meeting.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(meeting.meeting_date).toLocaleDateString('he-IL')}
                      </span>
                      <span>
                        {new Date(meeting.meeting_date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>{meeting.duration} דקות</span>
                      {meeting.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {meeting.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => shareMeeting(meeting)}
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
