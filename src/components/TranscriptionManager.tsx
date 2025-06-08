
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VoiceRecorder } from "./VoiceRecorder";
import { MediaUploader } from "./MediaUploader";
import { useToast } from "@/hooks/use-toast";
import { Mic, Upload, FileText, Edit3, Save, X, Copy, Download } from "lucide-react";

interface TranscriptionItem {
  id: string;
  text: string;
  source: 'voice' | 'file';
  timestamp: Date;
  filename?: string;
}

export const TranscriptionManager = () => {
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { toast } = useToast();

  const handleTranscription = (text: string, source: 'voice' | 'file' = 'voice', filename?: string) => {
    const newTranscription: TranscriptionItem = {
      id: crypto.randomUUID(),
      text,
      source,
      timestamp: new Date(),
      filename
    };

    setTranscriptions(prev => [newTranscription, ...prev]);
    
    toast({
      title: "תמלול הושלם!",
      description: `הטקסט נוסף לרשימת התמלולים (${source === 'voice' ? 'הקלטה' : 'קובץ'})`,
    });
  };

  const handleVoiceTranscription = (text: string) => {
    handleTranscription(text, 'voice');
  };

  const handleFileTranscription = (text: string, filename?: string) => {
    handleTranscription(text, 'file', filename);
  };

  const startEdit = (transcription: TranscriptionItem) => {
    setEditingId(transcription.id);
    setEditText(transcription.text);
  };

  const saveEdit = () => {
    if (!editingId) return;
    
    setTranscriptions(prev => 
      prev.map(item => 
        item.id === editingId 
          ? { ...item, text: editText }
          : item
      )
    );
    
    setEditingId(null);
    setEditText("");
    
    toast({
      title: "הטקסט נערך בהצלחה",
      description: "השינויים נשמרו",
    });
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

  const deleteTranscription = (id: string) => {
    setTranscriptions(prev => prev.filter(item => item.id !== id));
    toast({
      title: "תמלול נמחק",
      description: "התמלול הוסר מהרשימה",
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            מרכז תמלול וניהול טקסטים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Recording Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Mic className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-800">הקלטת קול</h3>
            </div>
            <VoiceRecorder onTranscription={handleVoiceTranscription} />
          </div>

          <Separator />

          {/* File Upload Section */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-800">העלאת קבצי אודיו ווידאו</h3>
            </div>
            <MediaUploader onTranscription={handleFileTranscription} />
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
                        <div className="flex items-center gap-2">
                          <Badge variant={transcription.source === 'voice' ? 'default' : 'secondary'}>
                            {transcription.source === 'voice' ? (
                              <><Mic className="w-3 h-3 mr-1" /> הקלטה</>
                            ) : (
                              <><Upload className="w-3 h-3 mr-1" /> קובץ</>
                            )}
                          </Badge>
                          {transcription.filename && (
                            <span className="text-xs text-gray-500">{transcription.filename}</span>
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
                                onClick={() => copyToClipboard(transcription.text)}
                                className="text-gray-600 hover:text-gray-700"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => downloadText(
                                  transcription.text, 
                                  `תמלול_${transcription.timestamp.toLocaleDateString('he-IL')}.txt`
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
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {transcription.text}
                          </p>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400 mt-2">
                        {transcription.timestamp.toLocaleString('he-IL')}
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
