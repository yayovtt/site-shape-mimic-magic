
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, ExternalLink, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  description?: string;
}

export const GoogleCalendarIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConnectToGoogle = async () => {
    setIsLoading(true);
    
    try {
      // This would normally initiate OAuth flow
      // For demo purposes, we'll simulate connection
      setTimeout(() => {
        setIsConnected(true);
        setIsLoading(false);
        
        // Sample events for demonstration
        setEvents([
          {
            id: '1',
            summary: 'פגישת צוות',
            start: { dateTime: new Date(Date.now() + 86400000).toISOString() },
            end: { dateTime: new Date(Date.now() + 90000000).toISOString() },
            description: 'פגישה שבועית עם הצוות'
          },
          {
            id: '2',
            summary: 'פרויקט חדש',
            start: { dateTime: new Date(Date.now() + 172800000).toISOString() },
            end: { dateTime: new Date(Date.now() + 176400000).toISOString() },
            description: 'דיון על פרויקט חדש'
          }
        ]);
        
        toast({
          title: "התחברות הצליחה!",
          description: "התחברת בהצלחה ליומן גוגל שלך",
        });
      }, 2000);
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error);
      toast({
        title: "שגיאה בהתחברות",
        description: "לא הצלחנו להתחבר ליומן גוגל. נסה שוב.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setEvents([]);
    toast({
      title: "התנתקות הושלמה",
      description: "התנתקת מיומן גוגל",
    });
  };

  const formatEventTime = (event: CalendarEvent) => {
    const start = event.start.dateTime || event.start.date;
    const end = event.end.dateTime || event.end.date;
    
    if (!start) return '';
    
    const startDate = new Date(start);
    const endDate = new Date(end || start);
    
    const startTime = startDate.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const endTime = endDate.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const date = startDate.toLocaleDateString('he-IL');
    
    return `${date} • ${startTime} - ${endTime}`;
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="w-6 h-6 text-blue-600" />
          יומן גוגל
          {isConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 mr-2">
              <Check className="w-3 h-3 ml-1" />
              מחובר
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected ? (
          <div className="text-center space-y-4">
            <div className="p-6 bg-white rounded-lg border-2 border-dashed border-blue-200">
              <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">התחבר ליומן גוגל שלך</h3>
              <p className="text-gray-600 mb-4">
                התחבר ליומן גוגל כדי לראות את האירועים שלך ולנהל אותם מכאן
              </p>
              <Button
                onClick={handleConnectToGoogle}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    מתחבר...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 ml-2" />
                    התחבר לגוגל
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">מחובר ליומן גוגל</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 ml-1" />
                התנתק
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white"
                onClick={() => window.open('https://calendar.google.com', '_blank')}
              >
                <Plus className="w-4 h-4 ml-2" />
                צור אירוע חדש
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('https://calendar.google.com', '_blank')}
              >
                <ExternalLink className="w-4 h-4 ml-2" />
                פתח יומן גוגל
              </Button>
            </div>

            {/* Upcoming Events */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                אירועים קרובים
              </h4>
              
              {events.length === 0 ? (
                <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">אין אירועים קרובים</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-1">{event.summary}</h5>
                          <p className="text-sm text-gray-600 mb-2">{formatEventTime(event)}</p>
                          {event.description && (
                            <p className="text-sm text-gray-500">{event.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://calendar.google.com/calendar/event?eid=${event.id}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{events.length}</div>
                <div className="text-blue-700 text-sm">אירועים השבוע</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">2</div>
                <div className="text-purple-700 text-sm">אירועים היום</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
