
import { Upload } from "lucide-react";
import { EnhancedMediaUploader } from "./EnhancedMediaUploader";

interface FileUploadCardProps {
  onTranscription: (text: string, metadata?: any) => void;
}

export const FileUploadCard = ({ onTranscription }: FileUploadCardProps) => {
  return (
    <div className="bg-gradient-to-br from-green-400 to-orange-400 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-xl">העלאת קבצי אודיו ווידאו</h3>
      </div>
      <p className="text-green-100 mb-4">תמלול מתקדם לקבצים גדולים</p>
      <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
        <EnhancedMediaUploader onTranscription={onTranscription} />
      </div>
    </div>
  );
};
