
import { useState } from "react";
import { FileText } from "lucide-react";
import { TranscriptionItem } from "./TranscriptionItem";

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

interface TranscriptionHistoryProps {
  transcriptions: TranscriptionItem[];
  onTranscriptionUpdate: (transcriptions: TranscriptionItem[]) => void;
}

export const TranscriptionHistory = ({ transcriptions, onTranscriptionUpdate }: TranscriptionHistoryProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleTranscriptionUpdate = (updatedTranscription: TranscriptionItem) => {
    const updatedTranscriptions = transcriptions.map(item => 
      item.id === updatedTranscription.id ? updatedTranscription : item
    );
    onTranscriptionUpdate(updatedTranscriptions);
  };

  const handleTranscriptionDelete = (id: string) => {
    const updatedTranscriptions = transcriptions.filter(item => item.id !== id);
    onTranscriptionUpdate(updatedTranscriptions);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 h-full min-w-96 w-full" dir="rtl">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gradient-to-r from-purple-500 to-green-400 rounded-lg p-2">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">היסטוריית תמלולים ({transcriptions.length})</h2>
      </div>
      
      {transcriptions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium mb-1">עדיין לא בוצעו תמלולים</p>
          <p className="text-gray-400 text-sm">השתמש בהקלטה או העלה קובץ כדי להתחיל</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {transcriptions.map((transcription) => (
            <TranscriptionItem
              key={transcription.id}
              transcription={transcription}
              isExpanded={expandedItems.has(transcription.id)}
              onToggleExpand={() => toggleExpand(transcription.id)}
              onUpdate={handleTranscriptionUpdate}
              onDelete={handleTranscriptionDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
