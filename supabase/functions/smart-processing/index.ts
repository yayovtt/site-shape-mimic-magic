
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

// Function to split text into chunks more intelligently
function splitTextIntoChunks(text: string, maxChunkSize: number = 2500): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    const potentialChunk = currentChunk ? currentChunk + '. ' + trimmedSentence : trimmedSentence;
    
    if (potentialChunk.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmedSentence;
    } else {
      currentChunk = potentialChunk;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.length > 0 ? chunks : [text];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, engine, customPrompt } = await req.json();
    
    console.log('Received request:', { 
      textLength: text?.length, 
      engine, 
      hasCustomPrompt: !!customPrompt 
    });
    
    if (!text || !engine) {
      throw new Error('Missing required parameters: text and engine');
    }

    if (!customPrompt || !customPrompt.trim()) {
      throw new Error('Custom prompt is required');
    }

    console.log(`Processing with ${engine} using custom prompt`);

    let processedText = '';
    
    if (engine === 'chatgpt') {
      if (!OPENAI_API_KEY) {
        console.error('OpenAI API key not configured');
        throw new Error('מפתח OpenAI API אינו מוגדר כראוי. אנא בדוק שהמפתח תקין ומתחיל ב-sk-');
      }

      console.log('Processing with ChatGPT');

      // For ChatGPT, try to send the full text first, split only if necessary
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: customPrompt.trim()
              },
              {
                role: 'user',
                content: text
              }
            ],
            temperature: 0.7,
            max_tokens: 4000
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('OpenAI API error:', errorData);
          
          if (response.status === 401) {
            throw new Error('מפתח OpenAI API אינו תקף. אנא בדוק שהמפתח נכון ופעיל.');
          } else if (response.status === 429) {
            throw new Error('חריגה מהמכסה של OpenAI API. אנא נסה שוב מאוחר יותר או בדוק את תוכנית החיוב שלך.');
          } else if (response.status === 413 || (errorData.error && errorData.error.message.includes('token'))) {
            console.log('Text too long for single request, splitting into chunks');
            // Handle chunking for ChatGPT
            const textChunks = splitTextIntoChunks(text, 2000);
            console.log(`Split text into ${textChunks.length} chunks for ChatGPT`);
            
            const processedChunks: string[] = [];

            for (let i = 0; i < textChunks.length; i++) {
              const chunk = textChunks[i];
              console.log(`Processing ChatGPT chunk ${i + 1}/${textChunks.length}, length: ${chunk.length}`);

              let chunkPrompt = customPrompt.trim();
              if (textChunks.length > 1) {
                chunkPrompt += `\n\nזהו חלק ${i + 1} מתוך ${textChunks.length} חלקים של הטקסט המלא. עבד את החלק הזה בהתאם להוראות שלמעלה ושמור על רציפות עם החלקים הקודמים.`;
              }

              const chunkResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${OPENAI_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini',
                  messages: [
                    {
                      role: 'system',
                      content: chunkPrompt
                    },
                    {
                      role: 'user',
                      content: chunk
                    }
                  ],
                  temperature: 0.7,
                  max_tokens: 2000
                }),
              });

              if (!chunkResponse.ok) {
                const chunkErrorData = await chunkResponse.json();
                console.error(`ChatGPT chunk ${i + 1} error:`, chunkErrorData);
                throw new Error(`שגיאה בעיבוד חלק ${i + 1}: ${chunkErrorData.error?.message || 'שגיאה לא ידועה'}`);
              }

              const chunkResult = await chunkResponse.json();
              const chunkText = chunkResult.choices[0]?.message?.content || '';
              processedChunks.push(chunkText);
              console.log(`ChatGPT chunk ${i + 1} completed, length: ${chunkText.length}`);
            }

            processedText = processedChunks.join('\n\n');
            console.log(`Combined ${processedChunks.length} ChatGPT chunks, total length: ${processedText.length}`);
          } else {
            throw new Error(`שגיאה ב-OpenAI API: ${response.status} - ${errorData.error?.message || 'שגיאה לא ידועה'}`);
          }
        } else {
          const result = await response.json();
          processedText = result.choices[0]?.message?.content || '';
          console.log('ChatGPT processing completed successfully (single request)');
        }
      } catch (error) {
        console.error('ChatGPT processing error:', error);
        throw error;
      }
      
    } else if (engine === 'claude') {
      if (!CLAUDE_API_KEY) {
        console.error('Claude API key not configured');
        throw new Error('מפתח Claude API אינו מוגדר כראוי. אנא בדוק שהמפתח תקין ומתחיל ב-sk-ant-');
      }

      console.log('Claude API key found, proceeding with request');
      console.log('Processing with Claude');

      // Split text into chunks for Claude
      const textChunks = splitTextIntoChunks(text, 2500);
      console.log(`Split text into ${textChunks.length} chunks for Claude`);
      
      const processedChunks: string[] = [];

      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];
        console.log(`Processing Claude chunk ${i + 1}/${textChunks.length}, length: ${chunk.length}`);

        let chunkPrompt = customPrompt.trim();
        if (textChunks.length > 1) {
          chunkPrompt += `\n\nזהו חלק ${i + 1} מתוך ${textChunks.length} חלקים של הטקסט המלא. עבד את החלק הזה בהתאם להוראות שלמעלה ושמור על רציפות עם החלקים הקודמים.`;
        }

        const requestBody = {
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 4096,
          system: chunkPrompt,
          messages: [
            {
              role: 'user',
              content: chunk
            }
          ]
        };

        console.log(`Sending request to Claude API for chunk ${i + 1}`);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CLAUDE_API_KEY}`,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'x-api-key': CLAUDE_API_KEY,
          },
          body: JSON.stringify(requestBody),
        });

        console.log(`Claude API response status for chunk ${i + 1}:`, response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Claude API error response for chunk ${i + 1}:`, errorText);
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: { message: errorText } };
          }
          
          if (response.status === 401) {
            throw new Error('מפתח Claude API אינו תקף. אנא בדוק שהמפתח נכון ופעיל ומתחיל ב-sk-ant-api03-');
          } else if (response.status === 429) {
            throw new Error('חריגה מהמכסה של Claude API. אנא נסה שוב מאוחר יותר.');
          } else {
            throw new Error(`שגיאה ב-Claude API בחלק ${i + 1}: ${response.status} - ${errorData.error?.message || errorText || 'שגיאה לא ידועה'}`);
          }
        }

        const result = await response.json();
        console.log(`Claude API response received for chunk ${i + 1}, parsing content...`);
        const chunkResult = result.content?.[0]?.text || '';
        processedChunks.push(chunkResult);
        console.log(`Claude chunk ${i + 1} processing completed, text length:`, chunkResult.length);
      }

      // Combine all processed chunks
      processedText = processedChunks.join('\n\n');
      console.log(`Combined ${processedChunks.length} Claude processed chunks, total length:`, processedText.length);
      
      console.log('Claude processing completed successfully');
    } else {
      throw new Error('Invalid engine specified. Must be "chatgpt" or "claude"');
    }

    if (!processedText || processedText.trim() === '') {
      throw new Error('לא התקבל טקסט מעובד מהמנוע הנבחר');
    }

    console.log('Processing completed successfully, returning result');
    return new Response(
      JSON.stringify({ processedText: processedText.trim() }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in smart-processing function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
