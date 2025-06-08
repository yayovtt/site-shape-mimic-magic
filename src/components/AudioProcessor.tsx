
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Clock, FileAudio } from "lucide-react";

interface AudioProcessorProps {
  onTranscription: (text: string, metadata?: any) => void;
  selectedFile: File | null;
}

interface TranscriptionOptions {
  language?: string;
  model: string;
  prompt?: string;
  responseFormat: 'json' | 'text' | 'verbose_json';
  temperature: number;
  timestampGranularities: string[];
  enableChunking: boolean;
  chunkSize: number;
  chunkOverlap: number;
}

export const AudioProcessor = ({ onTranscription, selectedFile }: AudioProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<TranscriptionOptions>({
    model: 'whisper-large-v3',
    responseFormat: 'json',
    temperature: 0,
    timestampGranularities: ['segment'],
    enableChunking: false,
    chunkSize: 20, // MB
    chunkOverlap: 1 // seconds
  });
  const { toast } = useToast();

  const languages = [
    { code: 'auto', name: 'זיהוי אוטומטי' },
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
    { id: 'whisper-large-v3', name: 'Whisper Large v3 (מומלץ)' },
    { id: 'whisper-large-v3-turbo', name: 'Whisper Large v3 Turbo (מהיר)' }
  ];

  const processAudioChunks = async (file: File): Promise<string> => {
    const chunkSizeBytes = options.chunkSize * 1024 * 1024; // Convert MB to bytes
    const chunks: Blob[] = [];
    
    // Split file into chunks
    for (let start = 0; start < file.size; start += chunkSizeBytes) {
      const end = Math.min(start + chunkSizeBytes, file.size);
      const chunk = file.slice(start, end);
      chunks.push(chunk);
    }

    toast({
      title: "מעבד קובץ גדול",
      description: `מחלק לקובץ ל-${chunks.length} חלקים לעיבוד`,
    });

    const transcriptions: string[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      try {
        const chunk = chunks[i];
        const arrayBuffer = await chunk.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        const { data, error } = await supabase.functions.invoke('groq-transcription-advanced', {
          body: { 
            audio: base64Audio,
            options: {
              ...options,
              language: options.language === 'auto' ? undefined : options.language
            }
          }
        });

        if (error) throw error;
        
        if (data?.text) {
          transcriptions.push(data.text);
          toast({
            title: `חלק ${i + 1}/${chunks.length} הושלם`,
            description: "ממשיך לחלק הבא...",
          });
        }
      } catch (error) {
        console.error(`Error processing chunk ${i + 1}:`, error);
        toast({
          title: `שגיאה בחלק ${i + 1}`,
          description: "ממשיך לחלק הבא...",
          variant: "destructive",
        });
      }
    }

    return transcriptions.join(' ');
  };

  const processAudio = async () => {
    if (!selectedFile) {
      toast({
        title: "לא נבחר קובץ",
        description: "אנא בחר קובץ אודיו תחילה",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      
      // Check if chunking is needed
      const maxSize = 25; // 25MB for free tier
      const needsChunking = fileSizeMB > maxSize || options.enableChunking;

      let transcriptionText: string;

      if (needsChunking) {
        transcriptionText = await processAudioChunks(selectedFile);
      } else {
        // Process as single file
        const arrayBuffer = await selectedFile.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        const { data, error } = await supabase.functions.invoke('groq-transcription-advanced', {
          body: { 
            audio: base64Audio,
            options: {
              ...options,
              language: options.language === 'auto' ? undefined : options.language
            }
          }
        });

        if (error) throw error;
        transcriptionText = data?.text || '';
      }

      if (transcriptionText) {
        onTranscription(transcriptionText, {
          filename: selectedFile.name,
          size: fileSizeMB,
          options: options,
          chunked: needsChunking
        });
        
        toast({
          title: "תמלול הושלם בהצלחה!",
          description: `עובד קובץ של ${fileSizeMB.toFixed(2)} MB`,
        });
      } else {
        throw new Error('לא התקבל טקסט מהתמלול');
      }

    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "שגיאה בתמלול",
        description: "נסה שוב או שנה את ההגדרות",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateOption = (key: keyof TranscriptionOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="w-5 h-5" />
          מעבד אודיו מתקדם
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Processing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>מודל תמלול</Label>
            <Select 
              value={options.model} 
              onValueChange={(value) => updateOption('model', value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>שפה</Label>
            <Select 
              value={options.language || 'auto'} 
              onValueChange={(value) => updateOption('language', value === 'auto' ? undefined : value)}
            >
              <SelectTrigger className="w-48">
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

        <Separator />

        {/* Advanced Options Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <Label>הגדרות מתקדמות</Label>
          </div>
          <Switch 
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
          />
        </div>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* Chunking Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>חילוק קבצים גדולים</Label>
                <Switch 
                  checked={options.enableChunking}
                  onCheckedChange={(checked) => updateOption('enableChunking', checked)}
                />
              </div>
              
              {options.enableChunking && (
                <div className="space-y-2 pl-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">גודל חלק (MB):</Label>
                    <Input
                      type="number"
                      value={options.chunkSize}
                      onChange={(e) => updateOption('chunkSize', Number(e.target.value))}
                      className="w-20"
                      min="1"
                      max="25"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">חפיפה (שניות):</Label>
                    <Input
                      type="number"
                      value={options.chunkOverlap}
                      onChange={(e) => updateOption('chunkOverlap', Number(e.target.value))}
                      className="w-20"
                      min="0"
                      max="5"
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Response Format */}
            <div className="flex items-center justify-between">
              <Label>פורמט תגובה</Label>
              <Select 
                value={options.responseFormat} 
                onValueChange={(value: any) => updateOption('responseFormat', value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON רגיל</SelectItem>
                  <SelectItem value="text">טקסט בלבד</SelectItem>
                  <SelectItem value="verbose_json">JSON מפורט (עם זמנים)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {options.responseFormat === 'verbose_json' && (
              <div className="space-y-2 pl-4">
                <Label className="text-sm">רמת זמנים:</Label>
                <div className="flex gap-2">
                  <Button
                    variant={options.timestampGranularities.includes('segment') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const current = options.timestampGranularities;
                      const newGranularities = current.includes('segment')
                        ? current.filter(g => g !== 'segment')
                        : [...current, 'segment'];
                      updateOption('timestampGranularities', newGranularities);
                    }}
                  >
                    מקטעים
                  </Button>
                  <Button
                    variant={options.timestampGranularities.includes('word') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const current = options.timestampGranularities;
                      const newGranularities = current.includes('word')
                        ? current.filter(g => g !== 'word')
                        : [...current, 'word'];
                      updateOption('timestampGranularities', newGranularities);
                    }}
                  >
                    מילים
                  </Button>
                </div>
              </div>
            )}

            {/* Temperature */}
            <div className="space-y-2">
              <Label className="text-sm">טמפרטורה (יצירתיות): {options.temperature}</Label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={options.temperature}
                onChange={(e) => updateOption('temperature', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label className="text-sm">הנחיות למודל (עד 224 מילים):</Label>
              <Textarea
                value={options.prompt || ''}
                onChange={(e) => updateOption('prompt', e.target.value)}
                placeholder="לדוגמה: השתמש בכללי כתיב מדויקים, או התמחה במונחים רפואיים..."
                className="text-sm"
                maxLength={224}
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Process Button */}
        <Button
          onClick={processAudio}
          disabled={!selectedFile || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              מעבד...
            </>
          ) : (
            <>
              <Clock className="w-5 h-5 mr-2" />
              תמלל עם הגדרות מתקדמות
            </>
          )}
        </Button>

        {selectedFile && (
          <div className="text-sm text-gray-600 text-center">
            גודל קובץ: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            {selectedFile.size > 25 * 1024 * 1024 && (
              <div className="text-orange-600 mt-1">
                קובץ גדול - יחולק לחלקים אוטומטית
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
