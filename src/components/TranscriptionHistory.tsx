
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SmartProcessor } from "./SmartProcessor";
import { 
  FileText, 
  Edit3, 
  Save, 
  X, 
  Copy, 
  Download, 
  Clock, 
  Sparkles, 
  Share,
  Mic,
  Upload
} from "lucide-react";

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

interface TranscriptionHistoryProps {
  transcriptions: TranscriptionItem[];
  onTranscriptionUpdate: (transcriptions: TranscriptionItem[]) => void;
}

export const TranscriptionHistory = ({ transcriptions, onTranscriptionUpdate }: TranscriptionHistoryProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { toast } = useToast();

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

      const updatedTranscriptions = transcriptions.map(item => 
        item.id === editingId 
          ? { ...item, processed_text: editText, updated_at: new Date().toISOString() }
          : item
      );
      
      onTranscriptionUpdate(updatedTranscriptions);
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

      const updatedTranscriptions = transcriptions.filter(item => item.id !== id);
      onTranscriptionUpdate(updatedTranscriptions);
      
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

      const updatedTranscriptions = transcriptions.map(item => 
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
      );
      
      onTranscriptionUpdate(updatedTranscriptions);

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

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gradient-to-r from-purple-500 to-green-400 rounded-lg p-2">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">היסטוריית תמלולים ({transcriptions.length})</h2>
      </div>
      
      {transcriptions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium mb-1">עדיין לא בוצעו תמלולים</p>
          <p className="text-gray-400 text-sm">השתמש בהקלטה או העלה קובץ כדי להתחיל</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transcriptions.map((transcription) => (
            <div key={transcription.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:shadow-md transition-shadow">
              {/* Header with badges and actions */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge 
                    variant={transcription.metadata?.source === 'voice' ? 'default' : 'secondary'} 
                    className="rounded-md bg-purple-100 text-purple-800 text-xs"
                  >
                    {transcription.metadata?.source === 'voice' ? (
                      <><Mic className="w-2 h-2 mr-1" /> הקלטה</>
                    ) : (
                      <><Upload className="w-2 h-2 mr-1" /> קובץ</>
                    )}
                  </Badge>
                  {transcription.processing_engine && (
                    <Badge variant="outline" className="text-xs rounded-md bg-green-100 text-green-800">
                      <Sparkles className="w-2 h-2 mr-1" />
                      {transcription.processing_engine === 'chatgpt' ? 'GPT' : 'Claude'}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(transcription.processed_text || transcription.original_text)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-1 h-6 w-6"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {/* Share functionality */}}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 h-6 w-6"
                  >
                    <Share className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadText(
                      transcription.processed_text || transcription.original_text, 
                      `תמלול_${new Date(transcription.created_at).toLocaleDateString('he-IL')}.txt`
                    )}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-1 h-6 w-6"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* File info */}
              <div className="mb-2 space-y-1">
                {transcription.filename && (
                  <p className="text-xs font-medium text-gray-700 truncate" title={transcription.filename}>
                    {transcription.filename}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {transcription.file_size_mb && (
                    <span className="flex items-center gap-1">
                      <FileText className="w-2 h-2" />
                      {transcription.file_size_mb.toFixed(1)} MB
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-2 h-2" />
                    {new Date(transcription.created_at).toLocaleDateString('he-IL')}
                  </span>
                </div>
              </div>

              {/* Text preview */}
              <div className="mb-2">
                <p className="text-xs text-gray-700 line-clamp-2">
                  {transcription.processed_text || transcription.original_text}
                </p>
              </div>

              {/* Processing options */}
              {!transcription.processed_text && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <SmartProcessor
                    transcriptionId={transcription.id}
                    originalText={transcription.original_text}
                    onProcessingComplete={handleSmartProcessing}
                  />
                </div>
              )}

              {/* Edit mode */}
              {editingId === transcription.id && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-20 resize-y border-gray-200 focus:border-purple-400 rounded-lg text-xs"
                    placeholder="ערוך את הטקסט כאן..."
                  />
                  <div className="flex gap-1 mt-2">
                    <Button
                      size="sm"
                      onClick={saveEdit}
                      className="bg-green-500 hover:bg-green-600 text-white text-xs h-7"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      שמור
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                      className="text-xs h-7"
                    >
                      <X className="w-3 h-3 mr-1" />
                      ביטול
                    </Button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {editingId !== transcription.id && (
                <div className="flex gap-1 mt-2 pt-2 border-t border-gray-200">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(transcription)}
                    className="text-purple-600 border-purple-200 hover:bg-purple-50 flex-1 text-xs h-7"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    ערוך
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteTranscription(transcription.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-7"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
