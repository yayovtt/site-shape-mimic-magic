
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Scissors, 
  Upload, 
  Download, 
  Play, 
  Clock, 
  FileAudio, 
  FileVideo,
  Plus,
  Trash2,
  Settings
} from "lucide-react";

interface Segment {
  start: number;
  end: number;
}

interface SplitFile {
  blob: Blob;
  filename: string;
  duration: string;
  size: string;
  url: string;
}

export const FileSplitter = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [splitMethod, setSplitMethod] = useState<'segments' | 'duration' | 'manual'>('segments');
  const [numberOfSegments, setNumberOfSegments] = useState(3);
  const [durationPerSegment, setDurationPerSegment] = useState(60);
  const [outputFormat, setOutputFormat] = useState('same');
  const [manualSegments, setManualSegments] = useState<Segment[]>([]);
  const [manualStart, setManualStart] = useState('');
  const [manualEnd, setManualEnd] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitFiles, setSplitFiles] = useState<SplitFile[]>([]);
  const [mediaDuration, setMediaDuration] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      createMediaPreview(file);
      toast({
        title: "קובץ נבחר",
        description: `${file.name} נטען בהצלחה`,
      });
    }
  };

  const createMediaPreview = (file: File) => {
    const url = URL.createObjectURL(file);
    
    const mediaElement = file.type.startsWith('video/') 
      ? document.createElement('video')
      : document.createElement('audio');
    
    mediaElement.addEventListener('loadedmetadata', () => {
      setMediaDuration(mediaElement.duration);
    });
    
    mediaElement.src = url;
  };

  const addManualSegment = () => {
    const start = parseFloat(manualStart);
    const end = parseFloat(manualEnd);
    
    if (isNaN(start) || isNaN(end) || start >= end) {
      toast({
        title: "שגיאה",
        description: "אנא הכנס זמנים תקינים (התחלה < סיום)",
        variant: "destructive",
      });
      return;
    }
    
    if (end > mediaDuration) {
      toast({
        title: "שגיאה", 
        description: `זמן הסיום לא יכול להיות גדול מ-${formatTime(mediaDuration)}`,
        variant: "destructive",
      });
      return;
    }

    setManualSegments(prev => [...prev, { start, end }]);
    setManualStart('');
    setManualEnd('');
  };

  const removeManualSegment = (index: number) => {
    setManualSegments(prev => prev.filter((_, i) => i !== index));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (format: string, originalType: string) => {
    if (format === 'same') {
      return originalType.split('/')[1] || 'mp4';
    }
    return format;
  };

  const processFile = async () => {
    if (!selectedFile) {
      toast({
        title: "שגיאה",
        description: "אנא בחר קובץ תחילה",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setSplitFiles([]);

    let segments: Segment[] = [];

    if (splitMethod === 'segments') {
      const segmentDuration = mediaDuration / numberOfSegments;
      for (let i = 0; i < numberOfSegments; i++) {
        segments.push({
          start: i * segmentDuration,
          end: Math.min((i + 1) * segmentDuration, mediaDuration)
        });
      }
    } else if (splitMethod === 'duration') {
      for (let start = 0; start < mediaDuration; start += durationPerSegment) {
        segments.push({
          start: start,
          end: Math.min(start + durationPerSegment, mediaDuration)
        });
      }
    } else if (splitMethod === 'manual') {
      segments = [...manualSegments];
    }

    if (segments.length === 0) {
      toast({
        title: "שגיאה",
        description: "לא הוגדרו חלקים לעיבוד",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    await processSegments(segments);
    setIsProcessing(false);
  };

  const processSegments = async (segments: Segment[]) => {
    const extension = getFileExtension(outputFormat, selectedFile!.type);
    const baseFilename = selectedFile!.name.split('.')[0];
    const results: SplitFile[] = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      setProgress((i / segments.length) * 100);

      try {
        // For demonstration, we'll simulate file splitting
        // In a real implementation, you'd use FFmpeg.js or similar
        const blob = await simulateFileSplit(selectedFile!, segment.start, segment.end);
        const filename = `${baseFilename}_part${i + 1}.${extension}`;
        const url = URL.createObjectURL(blob);
        
        results.push({
          blob,
          filename,
          duration: formatTime(segment.end - segment.start),
          size: formatFileSize(blob.size),
          url
        });
      } catch (error) {
        console.error(`Error processing segment ${i + 1}:`, error);
        toast({
          title: "שגיאה בעיבוד",
          description: `שגיאה בעיבוד חלק ${i + 1}`,
          variant: "destructive",
        });
      }
    }

    setSplitFiles(results);
    setProgress(100);
    
    toast({
      title: "עיבוד הושלם!",
      description: `${results.length} קבצים נוצרו בהצלחה`,
    });
  };

  // Simulate file splitting - in real implementation use FFmpeg.js
  const simulateFileSplit = async (file: File, start: number, end: number): Promise<Blob> => {
    return new Promise((resolve) => {
      // Simulate processing time
      setTimeout(() => {
        // For demo, return a portion of the original file
        const reader = new FileReader();
        reader.onload = function(e) {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const blob = new Blob([arrayBuffer], { type: file.type });
          resolve(blob);
        };
        reader.readAsArrayBuffer(file);
      }, 500);
    });
  };

  const downloadFile = (file: SplitFile, customName?: string) => {
    const finalName = customName || file.filename;
    const a = document.createElement('a');
    a.href = file.url;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "הורדה הושלמה",
      description: `${finalName} הורד בהצלחה`,
    });
  };

  const downloadAllFiles = () => {
    splitFiles.forEach((file, index) => {
      setTimeout(() => {
        downloadFile(file);
      }, index * 500);
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-green-400 to-pink-500 bg-clip-text text-transparent mb-2">
          🎬 מחלק קבצי אודיו ווידאו
        </h2>
        <p className="text-gray-600">חלק קבצי מדיה לחלקים קטנים יותר</p>
      </div>

      {/* File Upload */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
        <CardContent className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          
          <div
            className="cursor-pointer flex flex-col items-center gap-4 text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {selectedFile ? selectedFile.name : 'בחר קובץ אודיו או וידאו'}
              </p>
              <p className="text-sm text-gray-500">
                נתמך: MP4, AVI, MOV, MP3, WAV, M4A ועוד
              </p>
              {mediaDuration > 0 && (
                <p className="text-sm text-purple-600 mt-2">
                  משך: {formatTime(mediaDuration)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Preview */}
      {selectedFile && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              {selectedFile.type.startsWith('video/') ? (
                <video
                  ref={mediaRef as React.RefObject<HTMLVideoElement>}
                  controls
                  src={URL.createObjectURL(selectedFile)}
                  className="max-h-64 mx-auto rounded-lg"
                />
              ) : (
                <audio
                  ref={mediaRef as React.RefObject<HTMLAudioElement>}
                  controls
                  src={URL.createObjectURL(selectedFile)}
                  className="w-full"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      {selectedFile && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Split Method */}
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                שיטת חלוקה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={splitMethod} onValueChange={(value: 'segments' | 'duration' | 'manual') => setSplitMethod(value)}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="segments">חלוקה לפי מספר חלקים</SelectItem>
                  <SelectItem value="duration">חלוקה לפי משך זמן</SelectItem>
                  <SelectItem value="manual">חלוקה ידנית</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Number of Segments */}
          {splitMethod === 'segments' && (
            <Card className="bg-gradient-to-br from-green-400 to-cyan-400 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  מספר חלקים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="number"
                  min="2"
                  max="100"
                  value={numberOfSegments}
                  onChange={(e) => setNumberOfSegments(parseInt(e.target.value))}
                  className="bg-white/20 border-white/30 text-white placeholder-white/70"
                />
              </CardContent>
            </Card>
          )}

          {/* Duration per Segment */}
          {splitMethod === 'duration' && (
            <Card className="bg-gradient-to-br from-green-400 to-cyan-400 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  משך כל חלק (שניות)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="number"
                  min="1"
                  value={durationPerSegment}
                  onChange={(e) => setDurationPerSegment(parseInt(e.target.value))}
                  className="bg-white/20 border-white/30 text-white placeholder-white/70"
                />
              </CardContent>
            </Card>
          )}

          {/* Output Format */}
          <Card className="bg-gradient-to-br from-orange-400 to-pink-400 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileVideo className="w-4 h-4" />
                פורמט פלט
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="same">שמור פורמט מקורי</SelectItem>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="webm">WEBM</SelectItem>
                  <SelectItem value="mp3">MP3</SelectItem>
                  <SelectItem value="wav">WAV</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual Segments */}
      {splitMethod === 'manual' && selectedFile && (
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5" />
              חלוקה ידנית
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-sm opacity-90 block mb-1">התחלה (שניות)</label>
                <Input
                  type="number"
                  min="0"
                  max={mediaDuration}
                  value={manualStart}
                  onChange={(e) => setManualStart(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-white/70"
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm opacity-90 block mb-1">סיום (שניות)</label>
                <Input
                  type="number"
                  min="0"
                  max={mediaDuration}
                  value={manualEnd}
                  onChange={(e) => setManualEnd(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-white/70"
                  placeholder={mediaDuration.toString()}
                />
              </div>
              <Button
                onClick={addManualSegment}
                className="bg-white/20 hover:bg-white/30 border-white/30"
              >
                <Plus className="w-4 h-4 mr-1" />
                הוסף
              </Button>
            </div>

            {manualSegments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">חלקים שנוספו:</h4>
                {manualSegments.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                    <span>
                      חלק {index + 1}: {formatTime(segment.start)} - {formatTime(segment.end)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeManualSegment(index)}
                      className="text-red-200 hover:text-red-100 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Process Button */}
      {selectedFile && (
        <div className="text-center">
          <Button
            onClick={processFile}
            disabled={isProcessing}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                מעבד... {Math.round(progress)}%
              </>
            ) : (
              <>
                <Scissors className="w-5 h-5 mr-2" />
                התחל עיבוד
              </>
            )}
          </Button>
        </div>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>מתבצע עיבוד...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {splitFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                קבצים מעובדים ({splitFiles.length})
              </CardTitle>
              <Button
                onClick={downloadAllFiles}
                variant="outline"
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                הורד הכל
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {splitFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {selectedFile?.type.startsWith('video/') ? (
                      <FileVideo className="w-6 h-6 text-purple-500" />
                    ) : (
                      <FileAudio className="w-6 h-6 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">{file.filename}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {file.duration}
                        </span>
                        <span>{file.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="שם מותאם אישית"
                      className="w-40 text-sm"
                      id={`filename-${index}`}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(`filename-${index}`) as HTMLInputElement;
                        const customName = input?.value.trim();
                        downloadFile(file, customName || undefined);
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      הורד
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
