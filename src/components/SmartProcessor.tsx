
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['summary']);
  const [customPrompt, setCustomPrompt] = useState('');
  const { toast } = useToast();

  const engines = [
    { id: 'chatgpt', name: 'ChatGPT', icon: '🤖', color: 'bg-gradient-to-r from-green-500 to-blue-500' },
    { id: 'claude', name: 'Claude', icon: '🧠', color: 'bg-gradient-to-r from-purple-500 to-pink-500' }
  ];

  const categories = [
    { id: 'summary', name: 'סיכום', description: 'סיכום תמציתי של התוכן', color: 'bg-blue-100 border-blue-300' },
    { id: 'meeting', name: 'פרוטוקול פגישה', description: 'ארגון כפרוטוקול פגישה מובנה', color: 'bg-green-100 border-green-300' },
    { id: 'lecture', name: 'הרצאה', description: 'ארגון תוכן לימודי לנקודות עיקריות', color: 'bg-yellow-100 border-yellow-300' },
    { id: 'interview', name: 'ראיון', description: 'ארגון ראיון לתשובות מובנות', color: 'bg-purple-100 border-purple-300' },
    { id: 'creative', name: 'יצירתי', description: 'שיפור יצירתי של הטקסט', color: 'bg-pink-100 border-pink-300' },
    { id: 'grammar', name: 'תיקון דקדוק', description: 'תיקון דקדוק ועריכה לשונית', color: 'bg-orange-100 border-orange-300' }
  ];

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const selectAllCategories = () => {
    setSelectedCategories(categories.map(cat => cat.id));
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  const handleSmartProcessing = async () => {
    if (!originalText.trim()) {
      toast({
        title: "שגיאה",
        description: "אין טקסט לעיבוד",
        variant: "destructive",
      });
      return;
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "שגיאה",
        description: "אנא בחר לפחות קטגוריה אחת לעיבוד",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Starting smart processing...');
      
      let combinedResults = '';
      
      for (const category of selectedCategories) {
        console.log(`Processing category: ${category}`);
        
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
          const categoryName = categories.find(cat => cat.id === category)?.name || category;
          combinedResults += `\n\n### ${categoryName}\n\n${data.processedText}`;
        }
      }

      if (combinedResults) {
        console.log('Smart processing successful');
        onProcessingComplete(transcriptionId, combinedResults.trim(), {
          engine,
          categories: selectedCategories,
          customPrompt: customPrompt.trim() || undefined
        });
        
        toast({
          title: "עיבוד חכם הושלם!",
          description: `עובד ${selectedCategories.length} קטגוריות עם ${engine === 'chatgpt' ? 'ChatGPT' : 'Claude'}`,
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
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Sparkles className="w-5 h-5" />
          עיבוד חכם ומתקדם
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Engine Selection */}
        <div className="space-y-2">
          <Label className="text-purple-700 font-medium">מנוע עיבוד</Label>
          <div className="grid grid-cols-2 gap-3">
            {engines.map(eng => (
              <div
                key={eng.id}
                className={`cursor-pointer rounded-lg p-3 border-2 transition-all ${
                  engine === eng.id 
                    ? 'border-purple-500 ring-2 ring-purple-200' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => setEngine(eng.id)}
              >
                <div className={`${eng.color} text-white rounded-lg p-2 text-center mb-2`}>
                  <span className="text-lg">{eng.icon}</span>
                  <div className="font-medium">{eng.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-purple-700 font-medium">סוגי עיבוד</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAllCategories}
                className="text-xs"
              >
                בחר הכל
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearAllCategories}
                className="text-xs"
              >
                נקה הכל
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map(cat => (
              <div
                key={cat.id}
                className={`${cat.color} rounded-lg p-3 border-2 cursor-pointer transition-all ${
                  selectedCategories.includes(cat.id) 
                    ? 'ring-2 ring-purple-500 border-purple-400' 
                    : 'hover:border-purple-300'
                }`}
                onClick={() => handleCategoryToggle(cat.id)}
              >
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{cat.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{cat.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            נבחרו {selectedCategories.length} מתוך {categories.length} קטגוריות
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <Label className="text-purple-700 font-medium">הנחיות מותאמות אישית (אופציונלי)</Label>
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

        {/* Process Button */}
        <Button
          onClick={handleSmartProcessing}
          disabled={isProcessing || selectedCategories.length === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              מעבד {selectedCategories.length} קטגוריות...
            </>
          ) : (
            <>
              {engine === 'chatgpt' ? <Bot className="w-5 h-5 mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
              עבד עם {engine === 'chatgpt' ? 'ChatGPT' : 'Claude'} ({selectedCategories.length} קטגוריות)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
