

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, Bot } from "lucide-react";

interface SmartProcessorProps {
  transcriptionId: string;
  originalText: string;
  onProcessingComplete: (transcriptionId: string, processedText: string, options: any) => void;
}

export const SmartProcessor = ({ transcriptionId, originalText, onProcessingComplete }: SmartProcessorProps) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<'chatgpt' | 'claude'>('chatgpt');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processText = async () => {
    if (!customPrompt.trim()) {
      toast({
        title: "נדרש להזין פרומט",
        description: "אנא הזן הוראות ספציפיות לעיבוד הטקסט",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const requestBody: any = {
        text: originalText,
        engine: selectedEngine,
        categories: []
      };

      // Only add customPrompt if it's not empty
      if (customPrompt.trim()) {
        requestBody.customPrompt = customPrompt.trim();
      }

      console.log('Sending request with:', requestBody);

      const { data, error } = await supabase.functions.invoke('smart-processing', {
        body: requestBody
      });

      console.log('Response received:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.processedText) {
        onProcessingComplete(transcriptionId, data.processedText, {
          engine: selectedEngine,
          category: 'פרומט מותאם',
          customPrompt: customPrompt.trim()
        });

        toast({
          title: "עיבוד חכם הושלם!",
          description: `הטקסט עובד בהצלחה עם ${selectedEngine === 'chatgpt' ? 'ChatGPT' : 'Claude'}`,
        });
      } else {
        throw new Error('לא התקבל טקסט מעובד');
      }
    } catch (error) {
      console.error('Error processing text:', error);
      toast({
        title: "שגיאה בעיבוד",
        description: error.message || "לא ניתן לעבד את הטקסט כרגע",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          <Sparkles className="w-5 h-5 text-purple-600" />
          עיבוד חכם של הטקסט
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Engine Selection */}
        <div className="flex gap-2">
          <Button
            variant={selectedEngine === 'chatgpt' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedEngine('chatgpt')}
            className={`flex items-center gap-2 ${
              selectedEngine === 'chatgpt' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'border-purple-200 text-purple-600 hover:bg-purple-50'
            }`}
          >
            <Bot className="w-4 h-4" />
            ChatGPT
          </Button>
          <Button
            variant={selectedEngine === 'claude' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedEngine('claude')}
            className={`flex items-center gap-2 ${
              selectedEngine === 'claude' 
                ? 'bg-gradient-to-r from-green-400 to-orange-400 text-white' 
                : 'border-green-200 text-green-600 hover:bg-green-50'
            }`}
          >
            <Bot className="w-4 h-4" />
            Claude
          </Button>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-700">פרומט מותאם אישית:</label>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="הזן הוראות ספציפיות לעיבוד הטקסט (לדוגמה: 'סכם את הטקסט ב-3 נקודות עיקריות' או 'חלץ את כל המשימות והפעולות מהתוכן')"
            className="min-h-20 text-sm border-purple-200 focus:border-purple-400"
          />
        </div>

        {/* Process Button */}
        <Button 
          onClick={processText} 
          disabled={isProcessing || !customPrompt.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              מעבד...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              עבד טקסט עם {selectedEngine === 'chatgpt' ? 'ChatGPT' : 'Claude'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

