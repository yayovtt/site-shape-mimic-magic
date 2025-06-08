
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
      console.log('SimpleAudioProcessor: No file selected');
      toast({
        title: "לא נבחר קובץ",
        description: "אנא בחר קובץ אודיו תחילה",
        variant: "destructive",
      });
      return;
    }

    console.log('SimpleAudioProcessor: Starting transcription with file:', selectedFile.name);
    console.log('SimpleAudioProcessor: File size:', selectedFile.size, 'bytes');
    console.log('SimpleAudioProcessor: File type:', selectedFile.type);
    console.log('SimpleAudioProcessor: Using model:', model);
    console.log('SimpleAudioProcessor: Using language:', language);
    
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('model', model);
      formData.append('language', language);
      formData.append('response_format', 'json');
      
      if (prompt.trim()) {
        formData.append('prompt', prompt);
        console.log('SimpleAudioProcessor: Using prompt:', prompt);
      }

      console.log('SimpleAudioProcessor: Calling Groq API directly...');
      console.log('SimpleAudioProcessor: API endpoint: https://api.groq.com/openai/v1/audio/transcriptions');
      
      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: formData,
      });

      console.log('SimpleAudioProcessor: Response status:', response.status);
      console.log('SimpleAudioProcessor: Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SimpleAudioProcessor: Groq API error response:', errorText);
        console.error('SimpleAudioProcessor: Response headers:', Object.fromEntries(response.headers.entries()));
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('SimpleAudioProcessor: Transcription result received');
      console.log('SimpleAudioProcessor: Result keys:', Object.keys(result));
      console.log('SimpleAudioProcessor: Text length:', result.text?.length || 0);
      console.log('SimpleAudioProcessor: First 200 chars:', result.text?.substring(0, 200) || 'No text');

      if (result.text) {
        console.log('SimpleAudioProcessor: Calling onTranscription callback');
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
        console.error('SimpleAudioProcessor: No text in result:', result);
        throw new Error('לא התקבל טקסט מהתמלול');
      }

    } catch (error) {
      console.error('SimpleAudioProcessor: Transcription error:', error);
      console.error('SimpleAudioProcessor: Error type:', typeof error);
      console.error('SimpleAudioProcessor: Error message:', error instanceof Error ? error.message : String(error));
      
      toast({
        title: "שגיאה בתמלול",
        description: error instanceof Error ? error.message : "נסה שוב או שנה את ההגדרות",
        variant: "destructive",
      });
    } finally {
      console.log('SimpleAudioProcessor: Processing finished');
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
