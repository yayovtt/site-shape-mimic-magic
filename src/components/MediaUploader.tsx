
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileAudio, FileVideo, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MediaUploaderProps {
  onTranscription?: (text: string, filename?: string) => void;
}

export const MediaUploader = ({ onTranscription }: MediaUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: "קובץ נבחר",
        description: `נבחר: ${file.name}`,
      });
    }
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    
    try {
      console.log('Starting file transcription for:', selectedFile.name);
      
      // Convert file to base64
      const arrayBuffer = await selectedFile.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      console.log('Calling groq-transcription function...');
      
      // Call Groq transcription function
      const { data, error } = await supabase.functions.invoke('groq-transcription', {
        body: { audio: base64Audio }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.text) {
        console.log('Transcription successful:', data.text);
        if (onTranscription) {
          onTranscription(data.text, selectedFile.name);
        }
        toast({
          title: "תמלול הושלם!",
          description: "הטקסט נוצר בהצלחה",
        });
      } else {
        throw new Error('לא התקבל טקסט מהתמלול');
      }

    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "שגיאה בתמלול",
        description: "נסה שוב עם קובץ אחר",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        {!selectedFile ? (
          <div
            className="cursor-pointer flex flex-col items-center gap-2 text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Upload className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-sm text-gray-600">לחץ כאן להעלאת קובץ אודיו או וידאו</p>
            <p className="text-xs text-gray-400">תומך ב-MP3, WAV, MP4, WEBM ועוד</p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {selectedFile.type.startsWith('audio/') ? (
                <FileAudio className="w-6 h-6 text-blue-500" />
              ) : (
                <FileVideo className="w-6 h-6 text-purple-500" />
              )}
              <div>
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 w-8 h-8"
              title="מחק קובץ"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="flex gap-2">
          <Button
            onClick={processFile}
            disabled={isProcessing}
            className="flex-1"
            size="sm"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                מתמלל...
              </>
            ) : (
              'תמלל קובץ'
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            בחר קובץ אחר
          </Button>
        </div>
      )}
    </div>
  );
};
