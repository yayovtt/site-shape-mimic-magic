import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
          
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white rounded-2xl px-6"
          >
            <Plus className="w-4 h-4 ml-2" />
            אירוע חדש
          </Button>
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
