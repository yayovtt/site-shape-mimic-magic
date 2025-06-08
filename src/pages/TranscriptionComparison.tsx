
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, 
  Mic, 
  Sparkles, 
  Clock,
  FileText,
  Copy,
  Download
} from "lucide-react";
import { copyToClipboard, downloadText } from "@/utils/fileOperations";

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
        .not('processed_text', 'is', null)
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

  const handleDownload = (original: string, processed: string, filename?: string) => {
    const combinedText = `תמלול מקורי:\n${original}\n\n${'='.repeat(50)}\n\nעיבוד חכם:\n${processed}`;
    downloadText(
      combinedText, 
      `השוואה_${filename || new Date().toLocaleDateString('he-IL')}.txt`
    );
    toast({
      title: "הורדה הושלמה",
      description: "הקובץ הורד למחשב",
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
              <h3 className="text-lg font-semibold text-gray-700 mb-2">אין תמלולים מעובדים</h3>
              <p className="text-gray-500">עבד תמלולים עם Claude או ChatGPT כדי לראות השוואות כאן</p>
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
                      <Badge className="bg-purple-100 text-purple-800">
                        {transcription.processing_engine === 'chatgpt' ? 'ChatGPT' : 'Claude'}
                      </Badge>
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
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Original Text */}
                    <div className="p-6 border-l border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Mic className="w-5 h-5 text-blue-500" />
                          <h3 className="text-lg font-semibold text-blue-700">תמלול מקורי</h3>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(transcription.original_text, 'התמלול המקורי')}
                          className="p-2 h-8 w-8"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed text-right">
                          {transcription.original_text}
                        </p>
                      </div>
                    </div>

                    {/* Processed Text */}
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-green-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          <h3 className="text-lg font-semibold text-purple-700">עיבוד חכם</h3>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(transcription.processed_text!, 'העיבוד החכם')}
                          className="p-2 h-8 w-8"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="bg-gradient-to-br from-purple-100 to-green-100 p-4 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed text-right">
                          {transcription.processed_text}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Download Button */}
                  <div className="p-4 bg-gray-50 border-t">
                    <Button
                      onClick={() => handleDownload(transcription.original_text, transcription.processed_text!, transcription.filename)}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      הורד השוואה מלאה
                    </Button>
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
