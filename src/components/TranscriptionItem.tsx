
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SmartProcessor } from "./SmartProcessor";
import { TranscriptionActions } from "./TranscriptionActions";
import { 
  FileText, 
  Edit3, 
  Save, 
  X, 
  Clock, 
  Sparkles, 
  Mic,
  Upload,
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

interface TranscriptionItemProps {
  transcription: TranscriptionItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updatedTranscription: TranscriptionItem) => void;
  onDelete: (id: string) => void;
}

export const TranscriptionItem = ({ 
  transcription, 
  isExpanded, 
  onToggleExpand, 
  onUpdate, 
  onDelete 
}: TranscriptionItemProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { toast } = useToast();

  const textToShow = transcription.processed_text || transcription.original_text;
  const previewText = textToShow.slice(0, 100) + (textToShow.length > 100 ? '...' : '');

  const startEdit = () => {
    setEditingId(transcription.id);
    setEditText(textToShow);
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

      const updatedTranscription = { 
        ...transcription, 
        processed_text: editText, 
        updated_at: new Date().toISOString() 
      };
      
      onUpdate(updatedTranscription);
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

  const deleteTranscription = async () => {
    try {
      const { error } = await supabase
        .from('transcriptions')
        .delete()
        .eq('id', transcription.id);

      if (error) throw error;

      onDelete(transcription.id);
      
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

      const updatedTranscription = { 
        ...transcription, 
        processed_text: processedText,
        processing_engine: options.engine,
        processing_category: options.category,
        processing_prompt: options.customPrompt,
        updated_at: new Date().toISOString()
      };
      
      onUpdate(updatedTranscription);

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
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow" dir="rtl">
      {/* Header with badges and actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant={transcription.metadata?.source === 'voice' ? 'default' : 'secondary'} 
            className="rounded-md bg-purple-100 text-purple-800 text-sm"
          >
            {transcription.metadata?.source === 'voice' ? (
              <><Mic className="w-3 h-3 ml-1" /> הקלטה</>
            ) : (
              <><Upload className="w-3 h-3 ml-1" /> קובץ</>
            )}
          </Badge>
          {transcription.processing_engine && (
            <Badge variant="outline" className="text-sm rounded-md bg-green-100 text-green-800">
              <Sparkles className="w-3 h-3 ml-1" />
              {transcription.processing_engine === 'chatgpt' ? 'GPT' : 'Claude'}
            </Badge>
          )}
        </div>
        
        <TranscriptionActions
          transcription={transcription}
          textToShow={textToShow}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        />
      </div>

      {/* File info */}
      {(transcription.filename || transcription.file_size_mb) && (
        <div className="mb-3 space-y-1">
          {transcription.filename && (
            <p className="text-sm font-medium text-gray-700 truncate text-right" title={transcription.filename}>
              📁 {transcription.filename}
            </p>
          )}
          <div className="flex items-center justify-end gap-4 text-sm text-gray-500">
            {transcription.file_size_mb && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {transcription.file_size_mb.toFixed(1)} MB
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(transcription.created_at).toLocaleDateString('he-IL')} {new Date(transcription.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}

      {/* Text display - preview or full */}
      <div className="mb-3">
        {editingId === transcription.id ? (
          <div className="space-y-3">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-32 resize-y border-gray-200 focus:border-purple-400 rounded-lg text-sm text-right"
              placeholder="ערוך את הטקסט כאן..."
              dir="rtl"
              style={{ textAlign: 'right' }}
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                onClick={saveEdit}
                className="bg-green-500 hover:bg-green-600 text-white text-sm h-8"
              >
                <Save className="w-4 h-4 ml-1" />
                שמור
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelEdit}
                className="text-sm h-8"
              >
                <X className="w-4 h-4 ml-1" />
                ביטול
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg border border-gray-200" dir="rtl">
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed text-right" style={{ textAlign: 'right' }}>
              {isExpanded ? textToShow : previewText}
            </p>
            {!isExpanded && textToShow.length > 100 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                className="mt-2 text-purple-600 hover:text-purple-700 p-0 h-auto"
              >
                קרא עוד...
              </Button>
            )}
          </div>
        )}
      </div>

      {!transcription.processed_text && editingId !== transcription.id && isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <SmartProcessor
            transcriptionId={transcription.id}
            originalText={transcription.original_text}
            onProcessingComplete={handleSmartProcessing}
          />
        </div>
      )}

      {editingId !== transcription.id && isExpanded && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={startEdit}
            className="text-purple-600 border-purple-200 hover:bg-purple-50 text-sm h-8"
          >
            <Edit3 className="w-4 h-4 ml-1" />
            ערוך
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={deleteTranscription}
            className="text-red-600 border-red-200 hover:bg-red-50 text-sm h-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
