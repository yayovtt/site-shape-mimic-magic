
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SmartProcessor } from "@/components/SmartProcessor";
import { 
  ArrowRight, 
  Mic, 
  Sparkles, 
  Clock,
  FileText,
  Copy,
  Download,
  AlertCircle,
  Edit3,
  Save,
  X,
  Trash,
  MessageCircle,
  FolderDown
} from "lucide-react";
import { copyToClipboard, downloadText, saveToFolder, shareWhatsApp } from "@/utils/fileOperations";

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

const TranscriptionComparison = () => {
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editType, setEditType] = useState<'original' | 'processed'>('original');
  const navigate = useNavigate();
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

  const handleCopy = (text: string, type: string) => {
    copyToClipboard(text);
    toast({
      title: "הועתק ללוח",
      description: `${type} הועתק ללוח העתקות`,
    });
  };

  const handleDownload = (original: string, processed: string | undefined, filename?: string) => {
    const combinedText = processed 
      ? `תמלול מקורי:\n${original}\n\n${'='.repeat(50)}\n\nעיבוד חכם:\n${processed}`
      : `תמלול מקורי:\n${original}`;
    
    downloadText(
      combinedText, 
      `השוואה_${filename || new Date().toLocaleDateString('he-IL')}.txt`
    );
    toast({
      title: "הורדה הושלמה",
      description: "הקובץ הורד למחשב",
    });
  };

  const startEdit = (transcription: TranscriptionItem, type: 'original' | 'processed') => {
    setEditingId(transcription.id);
    setEditType(type);
    setEditText(type === 'original' ? transcription.original_text : (transcription.processed_text || ''));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    
    try {
      const updateData = editType === 'original' 
        ? { original_text: editText }
        : { processed_text: editText };

      const { error } = await supabase
        .from('transcriptions')
        .update({ 
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId);

      if (error) throw error;

      // Update local state
      setTranscriptions(prev => prev.map(item => 
        item.id === editingId 
          ? { ...item, ...updateData, updated_at: new Date().toISOString() }
          : item
      ));
      
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

      // Update local state
      setTranscriptions(prev => prev.map(item => 
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
      ));

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

  const handleSaveToFolder = (transcription: TranscriptionItem) => {
    const textToSave = transcription.processed_text || transcription.original_text;
    saveToFolder(textToSave, transcription);
    toast({
      title: "נשמר בהצלחה",
      description: "הקובץ נשמר במחשב שלך",
    });
  };

  const handleShareWhatsApp = (transcription: TranscriptionItem) => {
    const textToShare = transcription.processed_text || transcription.original_text;
    shareWhatsApp(textToShare, transcription);
    toast({
      title: "נפתח וואטסאפ",
      description: "ההודעה מוכנה לשליחה",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="mr-2">טוען תמלולים...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-6" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            חזור למרכז התמלול
          </Button>
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 bg-clip-text text-transparent mb-2">
            עמוד השוואת תמלולים
          </h1>
          <p className="text-gray-600">השוואה בין התמלול המקורי לעיבוד החכם</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {transcriptions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">אין תמלולים</h3>
              <p className="text-gray-500">צור תמלולים כדי לראות אותם כאן</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {transcriptions.map((transcription) => (
              <Card key={transcription.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">
                        {transcription.filename || 'תמלול ללא שם'}
                      </CardTitle>
                      {transcription.processing_engine ? (
                        <Badge className="bg-purple-100 text-purple-800">
                          {transcription.processing_engine === 'chatgpt' ? 'ChatGPT' : 'Claude'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-3 h-3 ml-1" />
                          ללא עיבוד חכם
                        </Badge>
                      )}
                      {transcription.processing_category && (
                        <Badge variant="outline" className="text-xs">
                          {transcription.processing_category}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {new Date(transcription.created_at).toLocaleDateString('he-IL')} {new Date(transcription.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className={`grid ${transcription.processed_text ? 'md:grid-cols-2' : 'grid-cols-1'} gap-0`}>
                    {/* Original Text */}
                    <div className="p-6 border-l border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Mic className="w-5 h-5 text-blue-500" />
                          <h3 className="text-lg font-semibold text-blue-700">תמלול מקורי</h3>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(transcription.original_text, 'התמלול המקורי')}
                            className="p-2 h-8 w-8"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(transcription, 'original')}
                            className="p-2 h-8 w-8"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {editingId === transcription.id && editType === 'original' ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="min-h-32 resize-y border-gray-200 focus:border-blue-400 rounded-lg text-sm text-right"
                            dir="rtl"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" onClick={saveEdit} className="bg-green-500 hover:bg-green-600 text-white">
                              <Save className="w-4 h-4 ml-1" />
                              שמור
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              <X className="w-4 h-4 ml-1" />
                              ביטול
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed text-right">
                            {transcription.original_text}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Processed Text or Empty State */}
                    {transcription.processed_text ? (
                      <div className="p-6 bg-gradient-to-br from-purple-50 to-green-50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            <h3 className="text-lg font-semibold text-purple-700">עיבוד חכם</h3>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopy(transcription.processed_text!, 'העיבוד החכם')}
                              className="p-2 h-8 w-8"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(transcription, 'processed')}
                              className="p-2 h-8 w-8"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {editingId === transcription.id && editType === 'processed' ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="min-h-32 resize-y border-gray-200 focus:border-purple-400 rounded-lg text-sm text-right"
                              dir="rtl"
                            />
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" onClick={saveEdit} className="bg-green-500 hover:bg-green-600 text-white">
                                <Save className="w-4 h-4 ml-1" />
                                שמור
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="w-4 h-4 ml-1" />
                                ביטול
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-br from-purple-100 to-green-100 p-4 rounded-lg border border-purple-200">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed text-right">
                              {transcription.processed_text}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">אין עיבוד חכם</h3>
                          <p className="text-gray-500 text-sm">התמלול עדיין לא עובד עם AI</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions Section */}
                  <div className="p-4 bg-gray-50 border-t space-y-4">
                    {/* Download Button */}
                    <Button
                      onClick={() => handleDownload(transcription.original_text, transcription.processed_text, transcription.filename)}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      {transcription.processed_text ? 'הורד השוואה מלאה' : 'הורד תמלול מקורי'}
                    </Button>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveToFolder(transcription)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <FolderDown className="w-4 h-4 ml-1" />
                          שמור
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShareWhatsApp(transcription)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                          וואטסאפ
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTranscription(transcription.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="w-4 h-4 ml-1" />
                          מחק
                        </Button>
                      </div>
                    </div>

                    {/* Smart Processing Section */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <SmartProcessor
                        transcriptionId={transcription.id}
                        originalText={transcription.original_text}
                        onProcessingComplete={handleSmartProcessing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionComparison;
