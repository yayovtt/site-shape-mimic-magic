
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const defaultMessages = [
  "אתה יכול להשיג כל דבר שאתה שם את הדעת עליו! 💪",
  "כל יום הוא הזדמנות חדשה להצליח! ⭐",
  "התמדה היא המפתח להצלחה! 🏆"
];

const gradients = [
  "from-green-100 to-blue-100",
  "from-purple-100 to-pink-100", 
  "from-yellow-100 to-orange-100",
  "from-blue-100 to-purple-100",
  "from-pink-100 to-red-100",
  "from-teal-100 to-green-100"
];

export const MotivationalMessages = () => {
  const [customMessages, setCustomMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  const handleAddMessage = () => {
    if (!newMessage.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין משפט עידוד",
        variant: "destructive",
      });
      return;
    }

    setCustomMessages(prev => [...prev, newMessage.trim()]);
    setNewMessage("");
    
    toast({
      title: "נוסף בהצלחה!",
      description: "משפט העידוד האישי נוסף בהצלחה",
    });
  };

  const handleRemoveMessage = (index: number) => {
    setCustomMessages(prev => prev.filter((_, i) => i !== index));
    
    toast({
      title: "נמחק בהצלחה",
      description: "משפט העידוד נמחק",
    });
  };

  const allMessages = [...defaultMessages, ...customMessages];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Plus className="w-5 h-5" />
          הוסף משפט עידוד אישי
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Add New Message Form */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-dashed border-purple-200">
            <h3 className="text-lg font-medium mb-3 text-purple-700">הוסף משפט עידוד חדש</h3>
            <div className="space-y-3">
              <Textarea
                placeholder="הזן משפט עידוד אישי שמעורר בך השראה..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="resize-none h-20"
              />
              <Button
                onClick={handleAddMessage}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Plus className="w-4 h-4 ml-2" />
                הוסף משפט עידוד
              </Button>
            </div>
          </div>

          {/* Display All Messages */}
          {allMessages.map((message, index) => {
            const isCustom = index >= defaultMessages.length;
            const gradientClass = gradients[index % gradients.length];
            
            return (
              <div key={index} className={`p-6 bg-gradient-to-r ${gradientClass} rounded-lg relative group`}>
                <p className="text-lg font-medium text-center">
                  "{message}"
                </p>
                {isCustom && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveMessage(index - defaultMessages.length)}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                {!isCustom && (
                  <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded text-xs text-gray-600">
                    ברירת מחדל
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
