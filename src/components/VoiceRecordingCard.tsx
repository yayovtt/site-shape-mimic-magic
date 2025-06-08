
import { Mic } from "lucide-react";
import { VoiceRecorder } from "./VoiceRecorder";

interface VoiceRecordingCardProps {
  onTranscription: (text: string) => void;
}

export const VoiceRecordingCard = ({ onTranscription }: VoiceRecordingCardProps) => {
  return (
    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <Mic className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-xl">הקלטת קול מהירה</h3>
      </div>
      <p className="text-purple-100 mb-4">הקלט ותמלל ישירות מהמיקרופון</p>
      <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
        <VoiceRecorder onTranscription={onTranscription} />
      </div>
    </div>
  );
};
