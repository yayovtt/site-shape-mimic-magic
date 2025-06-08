
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
}

export const VoiceRecorder = ({ onTranscription }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptedText, setTranscriptedText] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setTranscriptedText(""); // Clear previous transcription

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "מקליט...",
        description: "דבר כעת והקלטה תתמלל אוטומטית",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "שגיאה בהקלטה",
        description: "לא ניתן לגשת למיקרופון",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      console.log('Starting voice transcription...');
      
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
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
        console.log('Voice transcription successful:', data.text);
        setTranscriptedText(data.text);
        onTranscription(data.text);
        toast({
          title: "תמלול הושלם!",
          description: "הטקסט נוסף למערכת",
        });
      } else {
        throw new Error('לא התקבל טקסט מהתמלול');
      }

    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "שגיאה בתמלול",
        description: "נסה שוב או כתוב את ההודעה ידנית",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {!isRecording && !isProcessing && (
          <Button
            onClick={startRecording}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Mic className="w-4 h-4" />
            הקלט
          </Button>
        )}
        
        {isRecording && (
          <Button
            onClick={stopRecording}
            size="sm"
            variant="destructive"
            className="flex items-center gap-2 animate-pulse"
          >
            <Square className="w-4 h-4" />
            עצור הקלטה
          </Button>
        )}
        
        {isProcessing && (
          <Button
            disabled
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            מתמלל...
          </Button>
        )}
      </div>

      {/* Display transcribed text */}
      {transcriptedText && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">תוצאת תמלול קולי:</h4>
          <p className="text-blue-700 whitespace-pre-wrap">{transcriptedText}</p>
        </div>
      )}
    </div>
  );
};
