
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, Bot } from "lucide-react";

interface SmartProcessorProps {
  transcriptionId: string;
  originalText: string;
  onProcessingComplete: (transcriptionId: string, processedText: string, options: any) => void;
}

const PROCESSING_CATEGORIES = [
  { id: 'summary', label: 'סיכום', description: 'סיכום קצר ומקיף של התוכן' },
  { id: 'action_items', label: 'פעולות נדרשות', description: 'רשימת משימות ופעולות מהתוכן' },
  { id: 'key_points', label: 'נקודות עיקריות', description: 'הנקודות החשובות ביותר' },
  { id: 'questions', label: 'שאלות ותשובות', description: 'שאלות וטעמים שעלו בתוכן' },
  { id: 'decisions', label: 'החלטות', description: 'החלטות שהתקבלו במהלך השיחה' },
  { id: 'formatting', label: 'עיצוב וארגון', description: 'ארגון הטקסט עם כותרות ורשימות' }
];

export const SmartProcessor = ({ transcriptionId, originalText, onProcessingComplete }: SmartProcessorProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<'chatgpt' | 'claude'>('chatgpt');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === PROCESSING_CATEGORIES.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(PROCESSING_CATEGORIES.map(cat => cat.id));
    }
  };

  const processText = async () => {
    if (selectedCategories.length === 0 && !customPrompt.trim()) {
      toast({
        title: "נדרש לבחור קטגוריה",
        description: "אנא בחר לפחות קטגוריה אחת או הזן פרומט מותאם",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const categories = selectedCategories.map(id => 
        PROCESSING_CATEGORIES.find(cat => cat.id === id)?.label
      ).filter(Boolean);

      const { data, error } = await supabase.functions.invoke('smart-processing', {
        body: {
          text: originalText,
          engine: selectedEngine,
          categories,
          customPrompt: customPrompt.trim() || undefined
        }
      });

      if (error) throw error;

      if (data?.processedText) {
        onProcessingComplete(transcriptionId, data.processedText, {
          engine: selectedEngine,
          category: categories.join(', '),
          customPrompt: customPrompt.trim() || undefined
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
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
          <Sparkles className="w-5 h-5" />
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
            className="flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            ChatGPT
          </Button>
          <Button
            variant={selectedEngine === 'claude' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedEngine('claude')}
            className="flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            Claude
          </Button>
        </div>

        {/* Categories Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-gray-700">בחר קטגוריות לעיבוד:</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs h-7"
            >
              {selectedCategories.length === PROCESSING_CATEGORIES.length ? 'בטל הכל' : 'בחר הכל'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PROCESSING_CATEGORIES.map((category) => (
              <div key={category.id} className="flex items-start space-x-2 space-x-reverse p-2 rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => handleCategoryChange(category.id, !!checked)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <label 
                    htmlFor={category.id} 
                    className="text-sm font-medium text-gray-700 cursor-pointer block"
                  >
                    {category.label}
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">פרומט מותאם אישית (אופציונלי):</label>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="הזן הוראות ספציפיות לעיבוד הטקסט..."
            className="min-h-20 text-sm"
          />
        </div>

        {/* Selected Categories Display */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedCategories.map(categoryId => {
              const category = PROCESSING_CATEGORIES.find(cat => cat.id === categoryId);
              return (
                <Badge key={categoryId} variant="secondary" className="text-xs">
                  {category?.label}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Process Button */}
        <Button 
          onClick={processText} 
          disabled={isProcessing}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
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
