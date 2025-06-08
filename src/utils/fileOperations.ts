
export const downloadText = (text: string, filename: string) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const saveToFolder = async (text: string, transcription: any) => {
  const filename = `תמלול_${new Date(transcription.created_at).toLocaleDateString('he-IL').replace(/\//g, '_')}.txt`;
  const content = `תמלול\n` +
    `תאריך: ${new Date(transcription.created_at).toLocaleDateString('he-IL')}\n` +
    (transcription.filename ? `קובץ מקורי: ${transcription.filename}\n` : '') +
    (transcription.processing_engine ? `עובד עם: ${transcription.processing_engine === 'chatgpt' ? 'ChatGPT' : 'Claude'}\n` : '') +
    `\n${text}`;

  // Try to use File System Access API if available (Chrome, Edge)
  if ('showSaveFilePicker' in window) {
    try {
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Text files',
          accept: {
            'text/plain': ['.txt']
          }
        }]
      });
      
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      return;
    } catch (error) {
      // User cancelled or error occurred, fall back to download
      console.log('File save cancelled or error:', error);
    }
  }

  // Fallback to regular download
  const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", filename);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const shareWhatsApp = (text: string, transcription: any) => {
  const message = `📝 תמלול\n` +
                 `📅 ${new Date(transcription.created_at).toLocaleDateString('he-IL')}\n` +
                 (transcription.filename ? `📁 ${transcription.filename}\n` : '') +
                 (transcription.processing_engine ? `🤖 עובד עם ${transcription.processing_engine === 'chatgpt' ? 'ChatGPT' : 'Claude'}\n` : '') +
                 `\n${text}`;
  
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};

export const openChatGPT = (text: string) => {
  const encodedText = encodeURIComponent(`אני רוצה להתייעץ על הטקסט הבא:\n\n${text}`);
  window.open(`https://chat.openai.com/?q=${encodedText}`, '_blank');
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};
