import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VoiceRecorder } from "./VoiceRecorder";
import { EnhancedMediaUploader } from "./EnhancedMediaUploader";
import { SmartProcessor } from "./SmartProcessor";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Upload, FileText, Edit3, Save, X, Copy, Download, Clock, Settings, Sparkles, Share } from "lucide-react";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
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

  const startEdit = (transcription: TranscriptionItem) => {
    setEditingId(transcription.id);
    setEditText(transcription.processed_text || transcription.original_text);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    
    try {
      const { error } = await supabase
        .from('transcriptions')
        .update({ 
          processed_text: editText,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId);

      if (error) throw error;

      setTranscriptions(prev => 
        prev.map(item => 
          item.id === editingId 
            ? { ...item, processed_text: editText, updated_at: new Date().toISOString() }
            : item
        )
      );
      
      setEditingId(null);
      setEditText("");
      
      toast({
        title: "הטקסט נערך בהצלחה",
        description: "השינויים נשמרו",
      });
    } catch (error) {
      console.error('Error updating transcription:', error);
      toast({
        title: "שגיאה בעדכון",
        description: "לא ניתן לשמור את השינויים",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "הועתק ללוח",
      description: "הטקסט הועתק ללוח העתקות",
    });
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "הורדה הושלמה",
      description: "הקובץ הורד למחשב",
    });
  };

  const deleteTranscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transcriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTranscriptions(prev => prev.filter(item => item.id !== id));
      toast({
        title: "תמלול נמחק",
        description: "התמלול הוסר מההיסטוריה",
      });
    } catch (error) {
      console.error('Error deleting transcription:', error);
      toast({
        title: "שגיאה במחיקה",
        description: "לא ניתן למחוק את התמלול",
        variant: "destructive",
      });
    }
  };

  const handleSmartProcessing = async (transcriptionId: string, processedText: string, options: any) => {
    try {
      const { error } = await supabase
        .from('transcriptions')
        .update({
          processed_text: processedText,
          processing_engine: options.engine,
          processing_category: options.category,
          processing_prompt: options.customPrompt,
          updated_at: new Date().toISOString()
        })
        .eq('id', transcriptionId);

      if (error) throw error;

      setTranscriptions(prev => 
        prev.map(item => 
          item.id === transcriptionId 
            ? { 
                ...item, 
                processed_text: processedText,
                processing_engine: options.engine,
                processing_category: options.category,
                processing_prompt: options.customPrompt,
                updated_at: new Date().toISOString()
              }
            : item
        )
      );

      toast({
        title: "עיבוד חכם הושלם!",
        description: `הטקסט עובד בהצלחה עם ${options.engine === 'chatgpt' ? 'ChatGPT' : 'Claude'}`,
      });
    } catch (error) {
      console.error('Error saving processed text:', error);
      toast({
        title: "שגיאה בשמירה",
        description: "לא ניתן לשמור את הטקסט המעובד",
        variant: "destructive",
      });
    }
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
    <div className="space-y-8 p-6" dir="rtl">
      {/* Main Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-green-400 bg-clip-text text-transparent mb-2">מרכז תמלול וניהול טקסטים מתקדם</h1>
        <p className="text-gray-600">הקלטה, תמלול ועיבוד חכם של תוכן אודיו ווידאו</p>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Voice Recording Card */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white bg-opacity-20 rounded-xl p-3">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl">הקלטת קול מהירה</h3>
          </div>
          <p className="text-purple-100 mb-4">הקלט ותמלל ישירות מהמיקרופון</p>
          <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
            <VoiceRecorder onTranscription={handleVoiceTranscription} />
          </div>
        </div>

        {/* File Upload Card */}
        <div className="bg-gradient-to-br from-green-400 to-orange-400 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white bg-opacity-20 rounded-xl p-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl">העלאת קבצי אודיו ווידאו</h3>
          </div>
          <p className="text-green-100 mb-4">תמלול מתקדם לקבצים גדולים</p>
          <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
            <EnhancedMediaUploader onTranscription={handleFileTranscription} />
          </div>
        </div>
      </div>

      {/* Transcriptions History */}
      <div className="bg-gradient-to-r from-purple-500 to-green-400 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-white bg-opacity-20 rounded-xl p-3">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">היסטוריית תמלולים ({transcriptions.length})</h2>
        </div>
        
        {transcriptions.length === 0 ? (
          <div className="text-center py-12 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
            <div className="bg-white bg-opacity-20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <p className="text-white text-lg font-medium mb-2">עדיין לא בוצעו תמלולים</p>
            <p className="text-purple-100">השתמש בהקלטה או העלה קובץ כדי להתחיל</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {transcriptions.map((transcription) => (
              <div key={transcription.id} className="bg-white bg-opacity-90 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 text-gray-800">
                {/* Header with badges and actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant={transcription.metadata?.source === 'voice' ? 'default' : 'secondary'} 
                      className="rounded-lg bg-purple-100 text-purple-800"
                    >
                      {transcription.metadata?.source === 'voice' ? (
                        <><Mic className="w-3 h-3 mr-1" /> הקלטה</>
                      ) : (
                        <><Upload className="w-3 h-3 mr-1" /> קובץ</>
                      )}
                    </Badge>
                    {transcription.processing_engine && (
                      <Badge variant="outline" className="text-xs rounded-lg bg-green-100 text-green-800">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {transcription.processing_engine === 'chatgpt' ? 'ChatGPT' : 'Claude'}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(transcription.processed_text || transcription.original_text)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-1 h-8 w-8"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {/* Share functionality */}}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 h-8 w-8"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadText(
                        transcription.processed_text || transcription.original_text, 
                        `תמלול_${new Date(transcription.created_at).toLocaleDateString('he-IL')}.txt`
                      )}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-1 h-8 w-8"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* File info */}
                <div className="mb-3 space-y-1">
                  {transcription.filename && (
                    <p className="text-sm font-medium text-gray-700 truncate" title={transcription.filename}>
                      {transcription.filename}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {transcription.file_size_mb && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {transcription.file_size_mb.toFixed(1)} MB
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(transcription.created_at).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                </div>

                {/* Text preview */}
                <div className="mb-3">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {transcription.processed_text || transcription.original_text}
                  </p>
                </div>

                {/* Processing options */}
                {!transcription.processed_text && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <SmartProcessor
                      transcriptionId={transcription.id}
                      originalText={transcription.original_text}
                      onProcessingComplete={handleSmartProcessing}
                    />
                  </div>
                )}

                {/* Edit mode */}
                {editingId === transcription.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-24 resize-y border-gray-200 focus:border-purple-400 rounded-xl text-sm"
                      placeholder="ערוך את הטקסט כאן..."
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={saveEdit}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        שמור
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        <X className="w-4 h-4 mr-1" />
                        ביטול
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {editingId !== transcription.id && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(transcription)}
                      className="text-purple-600 border-purple-200 hover:bg-purple-50 flex-1"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      ערוך
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTranscription(transcription.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
