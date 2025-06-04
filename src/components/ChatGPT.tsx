
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User } from "lucide-react";

interface ChatMessage {
  id: string;
  message: string;
  response?: string;
  created_at: string;
}

export const ChatGPT = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setIsLoading(true);

    try {
      // שמירת ההודעה במסד הנתונים
      const { data: savedMessage, error: saveError } = await supabase
        .from('chat_messages')
        .insert([
          {
            message: newMessage,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (saveError) throw saveError;

      // הוספת ההודעה לרשימה המקומית
      setMessages(prev => [...prev, savedMessage]);

      // קריאה ל-Edge Function לקבלת תגובת GPT
      const { data, error } = await supabase.functions.invoke('chat-gpt', {
        body: { message: newMessage }
      });

      if (error) throw error;

      // עדכון ההודעה עם התגובה
      const { error: updateError } = await supabase
        .from('chat_messages')
        .update({ response: data.response })
        .eq('id', savedMessage.id);

      if (updateError) throw updateError;

      // עדכון הרשימה המקומית
      setMessages(prev => 
        prev.map(msg => 
          msg.id === savedMessage.id 
            ? { ...msg, response: data.response }
            : msg
        )
      );

      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "שגיאה בשליחת ההודעה",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          צ'אט עם GPT
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                שלח הודעה כדי להתחיל שיחה עם GPT
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="w-5 h-5 mt-1 text-blue-500" />
                  <div className="bg-blue-50 p-3 rounded-lg flex-1">
                    <p>{message.message}</p>
                  </div>
                </div>
                {message.response && (
                  <div className="flex items-start gap-2">
                    <Bot className="w-5 h-5 mt-1 text-green-500" />
                    <div className="bg-green-50 p-3 rounded-lg flex-1">
                      <p>{message.response}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2">
                <Bot className="w-5 h-5 mt-1 text-green-500" />
                <div className="bg-green-50 p-3 rounded-lg flex-1">
                  <p>GPT חושב...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              placeholder="כתוב הודעה..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !newMessage.trim()}
              className="bg-pink-500 hover:bg-pink-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
