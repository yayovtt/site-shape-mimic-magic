
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const { toast } = useToast();

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);

    // יצירת הודעה זמנית עם ID מקומי
    const tempMessage: ChatMessage = {
      id: crypto.randomUUID(),
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      // הוספת ההודעה לרשימה המקומית
      setMessages(prev => [...prev, tempMessage]);
      const currentMessage = newMessage.trim();
      setNewMessage("");

      // קריאה לשירות OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'אתה עוזר חכם ומועיל שעונה בעברית.' },
            { role: 'user', content: currentMessage }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('שגיאה בחיבור לשירות GPT');
      }

      const data = await response.json();
      const gptResponse = data.choices[0]?.message?.content;

      if (!gptResponse) {
        throw new Error('לא התקבלה תגובה מהשירות');
      }

      // עדכון ההודעה עם התגובה
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, response: gptResponse }
            : msg
        )
      );

    } catch (error: any) {
      console.error('Chat error:', error);
      
      // הסרת ההודעה הזמנית במקרה של שגיאה
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      
      toast({
        title: "שגיאה בשליחת ההודעה",
        description: error.message || 'נסה שוב מאוחר יותר',
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
                    <p className="whitespace-pre-wrap">{message.message}</p>
                  </div>
                </div>
                {message.response && (
                  <div className="flex items-start gap-2">
                    <Bot className="w-5 h-5 mt-1 text-green-500" />
                    <div className="bg-green-50 p-3 rounded-lg flex-1">
                      <p className="whitespace-pre-wrap">{message.response}</p>
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
              className="flex-1"
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
