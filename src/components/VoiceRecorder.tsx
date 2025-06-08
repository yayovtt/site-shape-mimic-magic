
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      console.log('VoiceRecorder: Starting recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('VoiceRecorder: Got media stream');
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('VoiceRecorder: Data available, size:', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('VoiceRecorder: Recording stopped, chunks:', audioChunksRef.current.length);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('VoiceRecorder: Created blob, size:', audioBlob.size);
        await transcribeAudio(audioBlob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('VoiceRecorder: Recording started');

      toast({
        title: "מקליט...",
        description: "דבר כעת והקלטה תתמלל אוטומטית",
      });

    } catch (error) {
      console.error('VoiceRecorder: Error starting recording:', error);
      toast({
        title: "שגיאה בהקלטה",
        description: "לא ניתן לגשת למיקרופון",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    console.log('VoiceRecorder: Stopping recording...');
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      console.log('VoiceRecorder: Starting voice transcription...');
      console.log('VoiceRecorder: Audio blob size:', audioBlob.size);
      
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      console.log('VoiceRecorder: Converted to base64, length:', base64Audio.length);

      console.log('VoiceRecorder: Calling groq-transcription function...');

      // Call Groq transcription function
      const { data, error } = await supabase.functions.invoke('groq-transcription', {
        body: { audio: base64Audio }
      });

      console.log('VoiceRecorder: Supabase function response received');
      console.log('VoiceRecorder: Error:', error);
      console.log('VoiceRecorder: Data:', data);

      if (error) {
        console.error('VoiceRecorder: Supabase function error:', error);
        throw error;
      }

      if (data?.text) {
        console.log('VoiceRecorder: Voice transcription successful, text length:', data.text.length);
        console.log('VoiceRecorder: First 100 chars:', data.text.substring(0, 100));
        onTranscription(data.text);
        toast({
          title: "תמלול הושלם!",
          description: "הטקסט נוסף למערכת",
        });
      } else {
        console.error('VoiceRecorder: No text in response:', data);
        throw new Error('לא התקבל טקסט מהתמלול');
      }

    } catch (error) {
      console.error('VoiceRecorder: Transcription error:', error);
      toast({
        title: "שגיאה בתמלול",
        description: "נסה שוב או כתוב את ההודעה ידנית",
        variant: "destructive",
      });
    } finally {
      console.log('VoiceRecorder: Processing finished');
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording && !isProcessing && (
        <Button
          onClick={startRecording}
          size="sm"
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
  );
};
