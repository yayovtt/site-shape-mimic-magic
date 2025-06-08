

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
  Upload,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  FolderDown
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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
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

  const saveToFolder = (text: string, transcription: TranscriptionItem) => {
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(
      `תמלול\n` +
      `תאריך: ${new Date(transcription.created_at).toLocaleDateString('he-IL')}\n` +
      (transcription.filename ? `קובץ מקורי: ${transcription.filename}\n` : '') +
      (transcription.processing_engine ? `עובד עם: ${transcription.processing_engine === 'chatgpt' ? 'ChatGPT' : 'Claude'}\n` : '') +
      `\n${text}`
    );
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `תמלול_${new Date(transcription.created_at).toLocaleDateString('he-IL').replace(/\//g, '_')}.txt`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "נשמר בהצלחה",
      description: "הקובץ נשמר במחשב שלך",
    });
  };

  const shareWhatsApp = (text: string, transcription: TranscriptionItem) => {
    const message = `📝 תמלול\n` +
                   `📅 ${new Date(transcription.created_at).toLocaleDateString('he-IL')}\n` +
                   (transcription.filename ? `📁 ${transcription.filename}\n` : '') +
                   (transcription.processing_engine ? `🤖 עובד עם ${transcription.processing_engine === 'chatgpt' ? 'ChatGPT' : 'Claude'}\n` : '') +
                   `\n${text}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "נפתח וואטסאפ",
      description: "ההודעה מוכנה לשליחה",
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

  const openChatGPT = (text: string) => {
    const encodedText = encodeURIComponent(`אני רוצה להתייעץ על הטקסט הבא:\n\n${text}`);
    window.open(`https://chat.openai.com/?q=${encodedText}`, '_blank');
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 h-full" dir="rtl">
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
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {transcriptions.map((transcription) => {
            const isExpanded = expandedItems.has(transcription.id);
            const textToShow = transcription.processed_text || transcription.original_text;
            const previewText = textToShow.slice(0, 100) + (textToShow.length > 100 ? '...' : '');
            
            return (
              <div key={transcription.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow" dir="rtl">
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
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => saveToFolder(textToShow, transcription)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 h-8 w-8"
                      title="שמור לתיקיה"
                    >
                      <FolderDown className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => shareWhatsApp(textToShow, transcription)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2 h-8 w-8"
                      title="שלח בוואטסאפ"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openChatGPT(textToShow)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 h-8 w-8"
                      title="התייעץ עם ChatGPT"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(textToShow)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-2 h-8 w-8"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadText(
                        textToShow, 
                        `תמלול_${new Date(transcription.created_at).toLocaleDateString('he-IL')}.txt`
                      )}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-2 h-8 w-8"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpand(transcription.id)}
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 p-2 h-8 w-8"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
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
                          onClick={() => toggleExpand(transcription.id)}
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
                      onClick={() => startEdit(transcription)}
                      className="text-purple-600 border-purple-200 hover:bg-purple-50 text-sm h-8"
                    >
                      <Edit3 className="w-4 h-4 ml-1" />
                      ערוך
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTranscription(transcription.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 text-sm h-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

