
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Clock, FileAudio } from "lucide-react";

interface SimpleAudioProcessorProps {
  onTranscription: (text: string, metadata?: any) => void;
  selectedFile: File | null;
}

export const SimpleAudioProcessor = ({ onTranscription, selectedFile }: SimpleAudioProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState('he');
  const [model, setModel] = useState('whisper-large-v3-turbo');
  const [prompt, setPrompt] = useState('');
  const { toast } = useToast();

  const API_KEY = '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';

  const languages = [
    { code: 'he', name: 'עברית' },
    { code: 'en', name: 'אנגלית' },
    { code: 'ar', name: 'ערבית' },
    { code: 'es', name: 'ספרדית' },
    { code: 'fr', name: 'צרפתית' },
    { code: 'de', name: 'גרמנית' },
    { code: 'ru', name: 'רוסית' },
    { code: 'zh', name: 'סינית' }
  ];

  const models = [
    { id: 'whisper-large-v3-turbo', name: 'Whisper Large v3 Turbo (מהיר)' },
    { id: 'whisper-large-v3', name: 'Whisper Large v3 (מדויק)' }
  ];

  const handleProcessAudio = async () => {
    if (!selectedFile) {
      toast({
        title: "לא נבחר קובץ",
        description: "אנא בחר קובץ אודיו תחילה",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting transcription with file:', selectedFile.name);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('model', model);
      formData.append('language', language);
      formData.append('response_format', 'json');
      
      if (prompt.trim()) {
        formData.append('prompt', prompt);
      }

      console.log('Calling Groq API directly...');
      
      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error:', errorText);
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Transcription successful:', result.text?.substring(0, 100) + '...');

      if (result.text) {
        onTranscription(result.text, {
          filename: selectedFile.name,
          size: selectedFile.size / (1024 * 1024),
          model: model,
          language: language
        });
        
        toast({
          title: "תמלול הושלם בהצלחה!",
          description: `עובד קובץ של ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        });
      } else {
        throw new Error('לא התקבל טקסט מהתמלול');
      }

    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "שגיאה בתמלול",
        description: error instanceof Error ? error.message : "נסה שוב או שנה את ההגדרות",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="w-5 h-5" />
          מעבד אודיו מהיר
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>מודל תמלול</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>שפה</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>הנחיות למודל (אופציונלי)</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="לדוגמה: השתמש בכללי כתיב מדויקים, או התמחה במונחים רפואיים..."
            rows={2}
            maxLength={224}
          />
          <div className="text-xs text-gray-500 text-left">
            {prompt.length}/224 תווים
          </div>
        </div>

        <Button
          onClick={handleProcessAudio}
          disabled={!selectedFile || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              מתמלל...
            </>
          ) : (
            <>
              <Clock className="w-5 h-5 mr-2" />
              תמלל קובץ
            </>
          )}
        </Button>

        {selectedFile && (
          <div className="text-sm text-gray-600 text-center space-y-1">
            <div>קובץ: {selectedFile.name}</div>
            <div>גודל: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
