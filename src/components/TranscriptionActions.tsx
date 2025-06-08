
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, 
  Download, 
  MessageCircle,
  FolderDown,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { downloadText, saveToFolder, shareWhatsApp, openChatGPT, copyToClipboard } from "@/utils/fileOperations";

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

interface TranscriptionActionsProps {
  transcription: TranscriptionItem;
  textToShow: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete?: () => void;
}

export const TranscriptionActions = ({ 
  transcription, 
  textToShow, 
  isExpanded, 
  onToggleExpand,
  onDelete 
}: TranscriptionActionsProps) => {
  const { toast } = useToast();

  const handleCopy = () => {
    copyToClipboard(textToShow);
    toast({
      title: "הועתק ללוח",
      description: "הטקסט הועתק ללוח העתקות",
    });
  };

  const handleDownload = () => {
    downloadText(
      textToShow, 
      `תמלול_${new Date(transcription.created_at).toLocaleDateString('he-IL')}.txt`
    );
    toast({
      title: "הורדה הושלמה",
      description: "הקובץ הורד למחשב",
    });
  };

  const handleSaveToFolder = () => {
    saveToFolder(textToShow, transcription);
    toast({
      title: "נשמר בהצלחה",
      description: "הקובץ נשמר במחשב שלך",
    });
  };

  const handleShareWhatsApp = () => {
    shareWhatsApp(textToShow, transcription);
    toast({
      title: "נפתח וואטסאפ",
      description: "ההודעה מוכנה לשליחה",
    });
  };

  const handleOpenChatGPT = () => {
    openChatGPT(textToShow);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      toast({
        title: "נמחק בהצלחה",
        description: "התמלול נמחק מההיסטוריה",
      });
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="ghost"
        onClick={handleSaveToFolder}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 h-8 w-8"
        title="שמור לתיקיה"
      >
        <FolderDown className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleShareWhatsApp}
        className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2 h-8 w-8"
        title="שלח בוואטסאפ"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleOpenChatGPT}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 h-8 w-8"
        title="התייעץ עם ChatGPT"
      >
        <MessageCircle className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCopy}
        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-2 h-8 w-8"
        title="העתק ללוח"
      >
        <Copy className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDownload}
        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-2 h-8 w-8"
        title="הורד קובץ"
      >
        <Download className="w-4 h-4" />
      </Button>
      {onDelete && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-8 w-8"
          title="מחק תמלול"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={onToggleExpand}
        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 p-2 h-8 w-8"
        title={isExpanded ? "כווץ" : "הרחב"}
      >
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>
    </div>
  );
};
