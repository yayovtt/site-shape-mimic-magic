import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus, FolderDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  type: 'meeting' | 'task' | 'reminder';
}

const sampleEvents: CalendarEvent[] = [
  { id: '1', title: 'פגישת צוות', time: '10:00', date: '2025-01-08', type: 'meeting' },
  { id: '2', title: 'מצגת פרויקט', time: '14:30', date: '2025-01-08', type: 'task' },
  { id: '3', title: 'שיחה עם לקוח', time: '16:00', date: '2025-01-09', type: 'meeting' },
  { id: '4', title: 'תזכורת: דו"ח שבועי', time: '09:00', date: '2025-01-10', type: 'reminder' },
  { id: '5', title: 'סדנת פיתוח', time: '11:00', date: '2025-01-12', type: 'task' },
];

const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'meeting': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'task': return 'bg-green-100 text-green-700 border-green-200';
    case 'reminder': return 'bg-orange-100 text-orange-700 border-orange-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getEventTypeText = (type: string) => {
  switch (type) {
    case 'meeting': return 'פגישה';
    case 'task': return 'משימה';
    case 'reminder': return 'תזכורת';
    default: return 'אירוע';
  }
};

const CalendarGrid = ({ currentDate, events }: { currentDate: Date; events: CalendarEvent[] }) => {
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and calculate starting position
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  // Create array of all days to show (6 weeks * 7 days)
  const days = [];
  const currentDay = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };
  
  const hasEvents = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.some(event => event.date === dateStr);
  };
  
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day, index) => (
          <div key={index} className="text-center text-sm font-medium text-gray-500 p-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          return (
            <div
              key={index}
              className={`
                relative h-12 flex items-center justify-center text-sm rounded-xl transition-colors cursor-pointer hover:bg-blue-50
                ${isToday(date) ? 'bg-blue-500 text-white font-bold' : ''}
                ${!isCurrentMonth(date) ? 'text-gray-300' : 'text-gray-700'}
                ${isCurrentMonth(date) && !isToday(date) ? 'hover:bg-gray-100' : ''}
              `}
            >
              <span>{date.getDate()}</span>
              
              {/* Event indicators */}
              {dayEvents.length > 0 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`
                        w-2 h-2 rounded-full
                        ${event.type === 'meeting' ? 'bg-blue-500' : ''}
                        ${event.type === 'task' ? 'bg-green-500' : ''}
                        ${event.type === 'reminder' ? 'bg-orange-500' : ''}
                      `}
                      title={`${event.title} - ${event.time}`}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="w-2 h-2 rounded-full bg-gray-400" title={`+${dayEvents.length - 3} אירועים נוספים`} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const GoogleCalendarIntegration = () => {
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const { toast } = useToast();

  const formatDateHeader = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: viewType === 'day' ? 'numeric' : undefined,
    };
    
    if (viewType === 'week') {
      const startOfWeek = new Date(currentDate);
      const endOfWeek = new Date(currentDate);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}`;
    }
    
    return currentDate.toLocaleDateString('he-IL', options);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewType === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getFilteredEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentDateStr = currentDate.toISOString().split('T')[0];
    
    if (viewType === 'day') {
      return sampleEvents.filter(event => event.date === currentDateStr);
    } else if (viewType === 'week') {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      return sampleEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= weekStart && eventDate <= weekEnd;
      });
    } else {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      return sampleEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= monthStart && eventDate <= monthEnd;
      });
    }
  };

  const handleSaveToFolder = () => {
    const events = getFilteredEvents();
    const eventsText = events.map(event => 
      `${event.title}\n${event.time} - ${new Date(event.date).toLocaleDateString('he-IL')}\nסוג: ${getEventTypeText(event.type)}\n\n`
    ).join('');
    
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(
      `יומן ${viewType === 'day' ? 'יומי' : viewType === 'week' ? 'שבועי' : 'חודשי'}\n` +
      `תאריך: ${formatDateHeader()}\n\n` +
      eventsText
    );
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `יומן_${formatDateHeader().replace(/\s+/g, '_')}.txt`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "נשמר בהצלחה",
      description: "הקובץ נשמר במחשב שלך",
    });
  };

  const handleShareWhatsApp = () => {
    const events = getFilteredEvents();
    const eventsText = events.map(event => 
      `📅 ${event.title}\n🕐 ${event.time} - ${new Date(event.date).toLocaleDateString('he-IL')}\n📝 ${getEventTypeText(event.type)}`
    ).join('\n\n');
    
    const message = `יומן ${viewType === 'day' ? 'יומי' : viewType === 'week' ? 'שבועי' : 'חודשי'} 📆\n` +
                   `${formatDateHeader()}\n\n` +
                   eventsText;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "נפתח וואטסאפ",
      description: "ההודעה מוכנה לשליחה",
    });
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg rounded-3xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            יומן גוגל
            <Badge className="bg-green-100 text-green-700 border-green-200 rounded-full">
              מחובר
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Save to Folder Button */}
            <Button
              onClick={handleSaveToFolder}
              variant="outline"
              size="sm"
              className="rounded-full p-2 h-8 w-8 hover:bg-blue-50"
              title="שמור לתיקיה"
            >
              <FolderDown className="w-4 h-4" />
            </Button>
            
            {/* WhatsApp Share Button */}
            <Button
              onClick={handleShareWhatsApp}
              variant="outline"
              size="sm"
              className="rounded-full p-2 h-8 w-8 hover:bg-green-50"
              title="שלח בוואטסאפ"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </Button>
            
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white rounded-2xl px-6"
            >
              <Plus className="w-4 h-4 ml-2" />
              אירוע חדש
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* View Controls */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('prev')}
              className="rounded-full w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <div className="text-lg font-semibold min-w-[200px] text-center">
              {formatDateHeader()}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('next')}
              className="rounded-full w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
          
          <Select value={viewType} onValueChange={(value: 'day' | 'week' | 'month') => setViewType(value)}>
            <SelectTrigger className="w-[120px] rounded-2xl border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="day" className="rounded-lg">יום</SelectItem>
              <SelectItem value="week" className="rounded-lg">שבוע</SelectItem>
              <SelectItem value="month" className="rounded-lg">חודש</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Calendar Grid - Only show for month view */}
        {viewType === 'month' && (
          <CalendarGrid currentDate={currentDate} events={sampleEvents} />
        )}

        {/* Events List */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-800">
            אירועים {viewType === 'day' ? 'היום' : viewType === 'week' ? 'השבוע' : 'החודש'}
          </h4>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {getFilteredEvents().length === 0 ? (
              <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">אין אירועים מתוזמנים</p>
              </div>
            ) : (
              getFilteredEvents().map((event) => (
                <div key={event.id} className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="font-medium text-gray-900">{event.title}</h5>
                        <Badge className={`rounded-full text-xs ${getEventTypeColor(event.type)}`}>
                          {getEventTypeText(event.type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{event.time}</span>
                        <span>{new Date(event.date).toLocaleDateString('he-IL', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'short' 
                        })}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-blue-600 hover:bg-blue-50"
                    >
                      פתח
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{getFilteredEvents().length}</div>
            <div className="text-blue-700 text-sm">אירועים</div>
          </div>
          <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {getFilteredEvents().filter(e => e.type === 'meeting').length}
            </div>
            <div className="text-green-700 text-sm">פגישות</div>
          </div>
          <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
            <div className="text-2xl font-bold text-orange-600">
              {getFilteredEvents().filter(e => e.type === 'task').length}
            </div>
            <div className="text-orange-700 text-sm">משימות</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
