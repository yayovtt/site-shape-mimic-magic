
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TranscriptionHistory } from "./TranscriptionHistory";
import { VoiceRecordingCard } from "./VoiceRecordingCard";
import { FileUploadCard } from "./FileUploadCard";
import { FileSplitter } from "./FileSplitter";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Scissors } from "lucide-react";

interface TranscriptionItem {
  id: string;
  original_text: string;
  processed_text?: string;
  filename?: string;
  file_size_mb?: number;
  transcription_model?: string;
  language?: string;
  processing_engine?: string;
  processing_category?: string;
  processing_prompt?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const TranscriptionManager = () => {
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTranscriptions();
  }, []);

  const loadTranscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('transcriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTranscriptions(data || []);
    } catch (error) {
      console.error('Error loading transcriptions:', error);
      toast({
        title: "שגיאה בטעינת התמלולים",
        description: "לא ניתן לטעון את ההיסטוריה",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTranscription = async (text: string, metadata?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "נדרשת התחברות",
          description: "עליך להתחבר כדי לשמור תמלולים",
          variant: "destructive",
        });
        return;
      }

      const transcriptionData = {
        user_id: user.id,
        original_text: text,
        filename: metadata?.filename,
        file_size_mb: metadata?.size,
        transcription_model: metadata?.model,
        language: metadata?.language,
        metadata: metadata
      };

      const { data, error } = await supabase
        .from('transcriptions')
        .insert([transcriptionData])
        .select()
        .single();

      if (error) throw error;

      setTranscriptions(prev => [data, ...prev]);
      
      toast({
        title: "תמלול נשמר בהצלחה!",
        description: "התמלול נוסף להיסטוריה",
      });
    } catch (error) {
      console.error('Error saving transcription:', error);
      toast({
        title: "שגיאה בשמירה",
        description: "לא ניתן לשמור את התמלול",
        variant: "destructive",
      });
    }
  };

  const handleVoiceTranscription = (text: string) => {
    saveTranscription(text, { source: 'voice' });
  };

  const handleFileTranscription = (text: string, metadata?: any) => {
    saveTranscription(text, { ...metadata, source: 'file' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="mr-2">טוען תמלולים...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Main Header */}
      <div className="text-center mb-2">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 bg-clip-text text-transparent mb-2">
          מרכז תמלול וניהול טקסטים מתקדם
        </h1>
        <p className="text-gray-600">הקלטה, תמלול, עיבוד חכם וחילוק קבצים</p>
      </div>

      {/* Tabs for different functionalities */}
      <Tabs defaultValue="transcription" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-purple-100 to-green-100">
          <TabsTrigger value="transcription" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            תמלול וניתוח
          </TabsTrigger>
          <TabsTrigger value="splitting" className="flex items-center gap-2">
            <Scissors className="w-4 h-4" />
            חילוק קבצים
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transcription" className="space-y-6">
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Action Cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <VoiceRecordingCard onTranscription={handleVoiceTranscription} />
                <FileUploadCard onTranscription={handleFileTranscription} />
              </div>
            </div>

            {/* Right Side - History Panel */}
            <div className="lg:col-span-1">
              <TranscriptionHistory 
                transcriptions={transcriptions}
                onTranscriptionUpdate={setTranscriptions}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="splitting">
          <FileSplitter />
        </TabsContent>
      </Tabs>
    </div>
  );
};
