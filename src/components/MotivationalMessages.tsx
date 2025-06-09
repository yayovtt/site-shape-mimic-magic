
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Edit, Check, Palette } from "lucide-react";
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
  "from-teal-100 to-green-100",
  "from-orange-100 to-red-100",
  "from-indigo-100 to-blue-100"
];

const fontStyles = [
  { value: "text-base", label: "רגיל" },
  { value: "text-lg font-medium", label: "בולט" },
  { value: "text-xl font-bold", label: "גדול ובולט" },
  { value: "text-sm italic", label: "קטן ונטוי" }
];

interface CustomMessage {
  text: string;
  gradient: string;
  fontStyle: string;
}

export const MotivationalMessages = () => {
  const [customMessages, setCustomMessages] = useState<CustomMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedGradient, setSelectedGradient] = useState(gradients[0]);
  const [selectedFontStyle, setSelectedFontStyle] = useState(fontStyles[0].value);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingGradient, setEditingGradient] = useState("");
  const [editingFontStyle, setEditingFontStyle] = useState("");
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

    const newCustomMessage: CustomMessage = {
      text: newMessage.trim(),
      gradient: selectedGradient,
      fontStyle: selectedFontStyle
    };

    setCustomMessages(prev => [...prev, newCustomMessage]);
    setNewMessage("");
    setSelectedGradient(gradients[0]);
    setSelectedFontStyle(fontStyles[0].value);
    
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

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(customMessages[index].text);
    setEditingGradient(customMessages[index].gradient);
    setEditingFontStyle(customMessages[index].fontStyle);
  };

  const saveEdit = () => {
    if (!editingText.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין טקסט למשפט העידוד",
        variant: "destructive",
      });
      return;
    }

    if (editingIndex !== null) {
      setCustomMessages(prev => 
        prev.map((msg, i) => 
          i === editingIndex 
            ? { text: editingText.trim(), gradient: editingGradient, fontStyle: editingFontStyle }
            : msg
        )
      );
      
      setEditingIndex(null);
      setEditingText("");
      setEditingGradient("");
      setEditingFontStyle("");
      
      toast({
        title: "עודכן בהצלחה",
        description: "משפט העידוד עודכן",
      });
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingText("");
    setEditingGradient("");
    setEditingFontStyle("");
  };

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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">רקע</label>
                  <Select value={selectedGradient} onValueChange={setSelectedGradient}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradients.map((gradient, index) => (
                        <SelectItem key={index} value={gradient}>
                          <div className={`w-16 h-4 bg-gradient-to-r ${gradient} rounded border`}></div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">סגנון גופן</label>
                  <Select value={selectedFontStyle} onValueChange={setSelectedFontStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                onClick={handleAddMessage}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Plus className="w-4 h-4 ml-2" />
                הוסף משפט עידוד
              </Button>
            </div>
          </div>

          {/* Display Default Messages */}
          {defaultMessages.map((message, index) => {
            const gradientClass = gradients[index % gradients.length];
            
            return (
              <div key={`default-${index}`} className={`p-6 bg-gradient-to-r ${gradientClass} rounded-lg relative`}>
                <p className="text-lg font-medium text-center">
                  "{message}"
                </p>
                <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded text-xs text-gray-600">
                  ברירת מחדל
                </div>
              </div>
            );
          })}

          {/* Display Custom Messages */}
          {customMessages.map((message, index) => (
            <div key={`custom-${index}`} className={`p-6 bg-gradient-to-r ${message.gradient} rounded-lg relative group`}>
              {editingIndex === index ? (
                <div className="space-y-4">
                  <Textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="resize-none h-20"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={editingGradient} onValueChange={setEditingGradient}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {gradients.map((gradient, i) => (
                          <SelectItem key={i} value={gradient}>
                            <div className={`w-16 h-4 bg-gradient-to-r ${gradient} rounded border`}></div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={editingFontStyle} onValueChange={setEditingFontStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontStyles.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className={`text-center ${message.fontStyle}`}>
                    "{message.text}"
                  </p>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(index)}
                      className="bg-white/80 hover:bg-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveMessage(index)}
                      className="bg-white/80 hover:bg-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded text-xs text-gray-600">
                    אישי
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
