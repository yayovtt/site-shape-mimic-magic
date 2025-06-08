
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_API_KEY = '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';

interface TranscriptionOptions {
  language?: string;
  model: string;
  prompt?: string;
  responseFormat: 'json' | 'text' | 'verbose_json';
  temperature: number;
  timestampGranularities?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio, options } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('Groq Advanced: Starting transcription with options:', options);

    // Convert base64 to binary with chunked processing for large files
    const processBase64InChunks = (base64String: string, chunkSize = 32768) => {
      const chunks: Uint8Array[] = [];
      let position = 0;
      
      while (position < base64String.length) {
        const chunk = base64String.slice(position, position + chunkSize);
        const binaryChunk = atob(chunk);
        const bytes = new Uint8Array(binaryChunk.length);
        
        for (let i = 0; i < binaryChunk.length; i++) {
          bytes[i] = binaryChunk.charCodeAt(i);
        }
        
        chunks.push(bytes);
        position += chunkSize;
      }

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;

      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      return result;
    };

    const binaryAudio = processBase64InChunks(audio);
    
    // Prepare form data for Groq API with advanced options
    const formData = new FormData();
    const audioBlob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', options.model || 'whisper-large-v3');
    formData.append('response_format', options.responseFormat || 'json');
    formData.append('temperature', options.temperature?.toString() || '0');

    // Add language if specified
    if (options.language) {
      formData.append('language', options.language);
    }

    // Add prompt if specified
    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }

    // Add timestamp granularities for verbose_json format
    if (options.responseFormat === 'verbose_json' && options.timestampGranularities) {
      options.timestampGranularities.forEach(granularity => {
        formData.append('timestamp_granularities[]', granularity);
      });
    }

    console.log('Calling Groq API with advanced parameters...');

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Groq Advanced: Transcription successful');

    // Return appropriate response based on format
    let responseData;
    if (options.responseFormat === 'text') {
      responseData = { text: result };
    } else if (options.responseFormat === 'verbose_json') {
      responseData = {
        text: result.text,
        segments: result.segments || [],
        words: result.words || [],
        duration: result.duration,
        language: result.language
      };
    } else {
      responseData = { text: result.text };
    }

    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in groq-transcription-advanced function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
