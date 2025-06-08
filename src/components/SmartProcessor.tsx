
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

const predefinedCategories = [
  {
    id: 'spelling_fix',
    name: 'תיקון שגיאות כתיב',
    prompt: 'תקן את כל שגיאות הכתיב והדקדוק בטקסט הבא. החזר את הטקסט המתוקן בלבד ללא הערות או הסברים נוספים.',
    icon: '✏️'
  },
  {
    id: 'add_sources',
    name: 'הוספת מקורות',
    prompt: 'קרא את הטקסט הבא והוסף מקורות רלוונטיים ואמינים לטענות העיקריות. הוסף את המקורות בסוף הטקסט בפורמט של רשימה מסודרת.',
    icon: '📚'
  },
  {
    id: 'expand_content',
    name: 'הרחבת התוכן',
    prompt: 'הרחב את התוכן הבא על ידי הוספת פרטים, דוגמאות והסברים נוספים. שמור על הסגנון והטון המקוריים.',
    icon: '📝'
  },
  {
    id: 'summarize',
    name: 'סיכום קצר',
    prompt: 'סכם את הטקסט הבא ב-3-5 נקודות עיקריות. השתמש בפסיקים ברורים וקצרים.',
    icon: '📋'
  },
  {
    id: 'bullet_points',
    name: 'רשימת נקודות',
    prompt: 'המר את הטקסט הבא לרשימת נקודות מסודרת וברורה. כל נקודה צריכה להיות קצרה ולהתמקד ברעיון אחד.',
    icon: '• '
  },
  {
    id: 'professional_tone',
    name: 'סגנון מקצועי',
    prompt: 'שכתב את הטקסט הבא בסגנון מקצועי ופורמלי. שמור על כל המידע אבל שפר את הניסוח והמבנה.',
    icon: '💼'
  }
];

export const SmartProcessor = ({ transcriptionId, originalText, onProcessingComplete }: SmartProcessorProps) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<'chatgpt' | 'claude'>('chatgpt');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processText = async () => {
    const activePrompt = selectedCategory 
      ? predefinedCategories.find(cat => cat.id === selectedCategory)?.prompt || ''
      : customPrompt.trim();

    if (!activePrompt) {
      toast({
        title: "נדרש להזין פרומט",
        description: "אנא בחר קטגוריה או הזן פרומט מותאם אישית",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const requestBody: any = {
        text: originalText,
        engine: selectedEngine,
        customPrompt: activePrompt
      };

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
        const categoryName = selectedCategory 
          ? predefinedCategories.find(cat => cat.id === selectedCategory)?.name || 'פרומט מותאם'
          : 'פרומט מותאם';

        onProcessingComplete(transcriptionId, data.processedText, {
          engine: selectedEngine,
          category: categoryName,
          customPrompt: activePrompt
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

  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory('');
    } else {
      setSelectedCategory(categoryId);
      setCustomPrompt(''); // Clear custom prompt when selecting predefined category
    }
  };

  const handleCustomPromptChange = (value: string) => {
    setCustomPrompt(value);
    if (value.trim()) {
      setSelectedCategory(''); // Clear selected category when typing custom prompt
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

        {/* Predefined Categories */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-700">קטגוריות מוגדרות מראש:</label>
          <div className="grid grid-cols-2 gap-2">
            {predefinedCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategorySelect(category.id)}
                className={`flex items-center gap-2 text-xs h-auto py-2 px-3 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span>{category.icon}</span>
                <span className="text-right">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-700">או פרומט מותאם אישית:</label>
          <Textarea
            value={customPrompt}
            onChange={(e) => handleCustomPromptChange(e.target.value)}
            placeholder="הזן הוראות ספציפיות לעיבוד הטקסט (לדוגמה: 'סכם את הטקסט ב-3 נקודות עיקריות')"
            className="min-h-20 text-sm border-purple-200 focus:border-purple-400"
            disabled={!!selectedCategory}
          />
          {selectedCategory && (
            <p className="text-xs text-gray-500">
              בחרת קטגוריה מוגדרת מראש: {predefinedCategories.find(cat => cat.id === selectedCategory)?.name}
            </p>
          )}
        </div>

        {/* Process Button */}
        <Button 
          onClick={processText} 
          disabled={isProcessing || (!customPrompt.trim() && !selectedCategory)}
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
