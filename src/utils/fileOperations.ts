
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

export const saveToFolder = (text: string, transcription: any) => {
  const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(
    `תמלול\n` +
    `תאריך: ${new Date(transcription.created_at).toLocaleDateString('he-IL')}\n` +
    (transcription.filename ? `קובץ מקורי: ${transcription.filename}\n` : '') +
    (transcription.processing_engine ? `עובד עם: ${transcription.processing_engine === 'chatgpt' ? 'ChatGPT' : 'Claude'}\n` : '') +
    `\n${text}`
  );
  
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `תמלול_${new Date(transcription.created_at).toLocaleDateString('he-IL').replace(/\//g, '_')}.txt`);
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
