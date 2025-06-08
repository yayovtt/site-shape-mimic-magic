
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
import { Mic, Upload, FileText, Edit3, Save, X, Copy, Download, Clock, Settings, Sparkles } from "lucide-react";

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="mr-2">טוען תמלולים...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            מרכז תמלול וניהול טקסטים מתקדם
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Recording Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Mic className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-800">הקלטת קול מהירה</h3>
            </div>
            <VoiceRecorder onTranscription={handleVoiceTranscription} />
          </div>

          <Separator />

          {/* Enhanced File Upload Section */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-800">העלאה ותמלול מתקדם</h3>
            </div>
            <EnhancedMediaUploader onTranscription={handleFileTranscription} />
          </div>

          <Separator />

          {/* Transcriptions History */}
          <div>
            <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              היסטוריית תמלולים ({transcriptions.length})
            </h3>
            
            {transcriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>עדיין לא בוצעו תמלולים</p>
                <p className="text-sm mt-2">השתמש בהקלטה או העלה קובץ כדי להתחיל</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {transcriptions.map((transcription) => (
                  <Card key={transcription.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={transcription.metadata?.source === 'voice' ? 'default' : 'secondary'}>
                            {transcription.metadata?.source === 'voice' ? (
                              <><Mic className="w-3 h-3 mr-1" /> הקלטה</>
                            ) : (
                              <><Upload className="w-3 h-3 mr-1" /> קובץ</>
                            )}
                          </Badge>
                          {transcription.filename && (
                            <span className="text-xs text-gray-500">{transcription.filename}</span>
                          )}
                          {transcription.file_size_mb && (
                            <span className="text-xs text-gray-400">
                              {transcription.file_size_mb.toFixed(1)} MB
                            </span>
                          )}
                          {transcription.processing_engine && (
                            <Badge variant="outline" className="text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              {transcription.processing_engine === 'chatgpt' ? 'ChatGPT' : 'Claude'}
                            </Badge>
                          )}
                          {transcription.processing_category && (
                            <Badge variant="outline" className="text-xs">
                              {transcription.processing_category}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {editingId === transcription.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={saveEdit}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEdit}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEdit(transcription)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(transcription.processed_text || transcription.original_text)}
                                className="text-gray-600 hover:text-gray-700"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => downloadText(
                                  transcription.processed_text || transcription.original_text, 
                                  `תמלול_${new Date(transcription.created_at).toLocaleDateString('he-IL')}.txt`
                                )}
                                className="text-purple-600 hover:text-purple-700"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteTranscription(transcription.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {editingId === transcription.id ? (
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="min-h-24 resize-y"
                          placeholder="ערוך את הטקסט כאן..."
                        />
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-2 font-medium">טקסט מקורי:</div>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                              {transcription.original_text}
                            </p>
                          </div>
                          
                          {transcription.processed_text && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="text-xs text-green-700 mb-2 font-medium flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                טקסט מעובד:
                              </div>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                {transcription.processed_text}
                              </p>
                            </div>
                          )}
                          
                          {!transcription.processed_text && (
                            <SmartProcessor
                              transcriptionId={transcription.id}
                              originalText={transcription.original_text}
                              onProcessingComplete={handleSmartProcessing}
                            />
                          )}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(transcription.created_at).toLocaleString('he-IL')}
                        {transcription.transcription_model && (
                          <span className="text-gray-500">
                            • {transcription.transcription_model}
                            {transcription.language && ` • ${transcription.language}`}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
