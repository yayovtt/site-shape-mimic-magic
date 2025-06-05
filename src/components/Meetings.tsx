
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit, Check, X, Calendar, Share2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Meeting {
  id: string;
  title: string;
  description?: string;
  meeting_date: string;
  duration: number;
  location?: string;
  created_at: string;
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
  const { toast } = useToast();

  useEffect(() => {
    const savedMeetings = localStorage.getItem("meetings");
    if (savedMeetings) {
      setMeetings(JSON.parse(savedMeetings));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("meetings", JSON.stringify(meetings));
  }, [meetings]);

  const addMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title.trim() || !newMeeting.meeting_date) return;

    const meeting: Meeting = {
      id: crypto.randomUUID(),
      title: newMeeting.title,
      description: newMeeting.description,
      meeting_date: newMeeting.meeting_date,
      duration: newMeeting.duration,
      location: newMeeting.location,
      created_at: new Date().toISOString(),
    };

    setMeetings(prev => [meeting, ...prev].sort((a, b) => 
      new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime()
    ));
    setNewMeeting({ title: "", description: "", meeting_date: "", duration: 60, location: "" });
    
    toast({
      title: "הפגישה נוצרה בהצלחה",
    });
  };

  const deleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(meeting => meeting.id !== id));
    toast({
      title: "הפגישה נמחקה בהצלחה",
    });
  };

  const startEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting.id);
    setEditData({ 
      title: meeting.title, 
      description: meeting.description || "", 
      meeting_date: meeting.meeting_date,
      duration: meeting.duration,
      location: meeting.location || ""
    });
  };

  const saveEdit = (id: string) => {
    if (!editData.title.trim() || !editData.meeting_date) return;

    setMeetings(prev => 
      prev.map(meeting => 
        meeting.id === id 
          ? { ...meeting, ...editData }
          : meeting
      ).sort((a, b) => 
        new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime()
      )
    );
    
    setEditingMeeting(null);
    setEditData({ title: "", description: "", meeting_date: "", duration: 60, location: "" });
    toast({
      title: "הפגישה עודכנה בהצלחה",
    });
  };

  const cancelEdit = () => {
    setEditingMeeting(null);
    setEditData({ title: "", description: "", meeting_date: "", duration: 60, location: "" });
  };

  const shareMeeting = (meeting: Meeting) => {
    const meetingDate = new Date(meeting.meeting_date);
    const text = `פגישה: ${meeting.title}\nתאריך: ${meetingDate.toLocaleDateString('he-IL')} בשעה ${meetingDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}\nמשך: ${meeting.duration} דקות${meeting.location ? `\nמיקום: ${meeting.location}` : ''}${meeting.description ? `\nפרטים: ${meeting.description}` : ''}`;
    
    // WhatsApp sharing
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('he-IL'),
      time: date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    };
  };

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
              value={newMeeting.meeting_date}
              onChange={(e) => setNewMeeting(prev => ({ ...prev, meeting_date: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="משך בדקות"
                value={newMeeting.duration}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                min="15"
                step="15"
              />
              <Input
                placeholder="מיקום (אופציונלי)"
                value={newMeeting.location}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <Button 
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600"
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
        
        {meetings.map((meeting) => {
          const { date, time } = formatDateTime(meeting.meeting_date);
          const isUpcoming = new Date(meeting.meeting_date) > new Date();
          
          return (
            <Card key={meeting.id} className={isUpcoming ? "border-purple-200 bg-purple-50" : "bg-gray-50"}>
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
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        value={editData.duration}
                        onChange={(e) => setEditData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        min="15"
                        step="15"
                      />
                      <Input
                        value={editData.location}
                        onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                      />
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
                      <h3 className="font-medium text-lg">{meeting.title}</h3>
                      {meeting.description && (
                        <p className="text-gray-600 text-sm mt-1">{meeting.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {date} בשעה {time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meeting.duration} דקות
                        </span>
                        {meeting.location && (
                          <span className="text-blue-600">{meeting.location}</span>
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
          );
        })}
      </div>
    </div>
  );
};
