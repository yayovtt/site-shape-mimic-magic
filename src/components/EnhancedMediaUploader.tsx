
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileAudio, FileVideo, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SimpleAudioProcessor } from "./SimpleAudioProcessor";

interface EnhancedMediaUploaderProps {
  onTranscription?: (text: string, metadata?: any) => void;
}

export const EnhancedMediaUploader = ({ onTranscription }: EnhancedMediaUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showProcessor, setShowProcessor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowProcessor(true);
      
      const sizeMB = file.size / (1024 * 1024);
      
      toast({
        title: "קובץ נבחר",
        description: `${file.name} (${sizeMB.toFixed(2)} MB)`,
      });
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setShowProcessor(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSupportedFormats = () => {
    return [
      'MP3', 'WAV', 'FLAC', 'M4A', 'AAC',
      'MP4', 'MOV', 'AVI', 'MKV', 'WEBM',
      'OGG', 'WMA', '3GP'
    ];
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            העלאת קבצי אודיו ווידאו
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            
            {!selectedFile ? (
              <div
                className="cursor-pointer flex flex-col items-center gap-4 text-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    לחץ כאן להעלאת קובץ אודיו או וידאו
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    תומך בקבצים גדולים (ללא הגבלת גודל)
                  </p>
                  <div className="text-xs text-gray-400">
                    <p className="mb-1">פורמטים נתמכים:</p>
                    <p>{getSupportedFormats().join(', ')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedFile.type.startsWith('audio/') ? (
                    <FileAudio className="w-8 h-8 text-blue-500" />
                  ) : (
                    <FileVideo className="w-8 h-8 text-purple-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    החלף קובץ
                  </Button>
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showProcessor && selectedFile && (
        <SimpleAudioProcessor 
          onTranscription={onTranscription}
          selectedFile={selectedFile}
        />
      )}
    </div>
  );
};
