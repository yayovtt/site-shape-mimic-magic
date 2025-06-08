
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Bot, Zap } from "lucide-react";

interface SmartProcessorProps {
  transcriptionId: string;
  originalText: string;
  onProcessingComplete: (transcriptionId: string, processedText: string, options: any) => void;
}

export const SmartProcessor = ({ transcriptionId, originalText, onProcessingComplete }: SmartProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [engine, setEngine] = useState('chatgpt');
  const [category, setCategory] = useState('summary');
  const [customPrompt, setCustomPrompt] = useState('');
  const { toast } = useToast();

  const engines = [
    { id: 'chatgpt', name: 'ChatGPT', icon: '🤖' },
    { id: 'claude', name: 'Claude', icon: '🧠' }
  ];

  const categories = [
    { id: 'summary', name: 'סיכום', description: 'סיכום תמציתי של התוכן' },
    { id: 'meeting', name: 'פרוטוקול פגישה', description: 'ארגון כפרוטוקול פגישה מובנה' },
    { id: 'lecture', name: 'הרצאה', description: 'ארגון תוכן לימודי לנקודות עיקריות' },
    { id: 'interview', name: 'ראיון', description: 'ארגון ראיון לתשובות מובנות' },
    { id: 'creative', name: 'יצירתי', description: 'שיפור יצירתי של הטקסט' },
    { id: 'grammar', name: 'תיקון דקדוק', description: 'תיקון דקדוק ועריכה לשונית' }
  ];

  const handleSmartProcessing = async () => {
    if (!originalText.trim()) {
      toast({
        title: "שגיאה",
        description: "אין טקסט לעיבוד",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Starting smart processing...');
      
      const { data, error } = await supabase.functions.invoke('smart-processing', {
        body: {
          text: originalText,
          engine: engine,
          category: category,
          customPrompt: customPrompt.trim() || undefined
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.processedText) {
        console.log('Smart processing successful');
        onProcessingComplete(transcriptionId, data.processedText, {
          engine,
          category,
          customPrompt: customPrompt.trim() || undefined
        });
      } else {
        throw new Error('לא התקבל טקסט מעובד');
      }

    } catch (error) {
      console.error('Smart processing error:', error);
      toast({
        title: "שגיאה בעיבוד חכם",
        description: error instanceof Error ? error.message : "נסה שוב או שנה את ההגדרות",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-purple-200 bg-purple-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Sparkles className="w-5 h-5" />
          עיבוד חכם
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-purple-700">מנוע עיבוד</Label>
            <Select value={engine} onValueChange={setEngine}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {engines.map(eng => (
                  <SelectItem key={eng.id} value={eng.id}>
                    <div className="flex items-center gap-2">
                      <span>{eng.icon}</span>
                      {eng.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-purple-700">סוג עיבוד</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-xs text-gray-500">{cat.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-purple-700">הנחיות מותאמות אישית (אופציונלי)</Label>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="הוסף הנחיות מיוחדות לעיבוד הטקסט..."
            rows={2}
            maxLength={500}
            className="resize-none"
          />
          <div className="text-xs text-gray-500 text-left">
            {customPrompt.length}/500 תווים
          </div>
        </div>

        <Button
          onClick={handleSmartProcessing}
          disabled={isProcessing}
          className="w-full bg-purple-600 hover:bg-purple-700"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              מעבד בחכמה...
            </>
          ) : (
            <>
              {engine === 'chatgpt' ? <Bot className="w-5 h-5 mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
              עבד עם {engine === 'chatgpt' ? 'ChatGPT' : 'Claude'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
