
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, engine, categories, customPrompt } = await req.json();
    
    console.log('Received request:', { 
      textLength: text?.length, 
      engine, 
      categories,
      hasCustomPrompt: !!customPrompt 
    });
    
    if (!text || !engine) {
      throw new Error('Missing required parameters: text and engine');
    }

    // Handle categories properly - they come as an array of Hebrew labels
    const categoryLabels = Array.isArray(categories) ? categories : (categories ? [categories] : []);
    console.log(`Processing with ${engine} for categories:`, categoryLabels);

    let processedText = '';
    
    if (engine === 'chatgpt') {
      if (!OPENAI_API_KEY) {
        console.error('OpenAI API key not configured');
        throw new Error('מפתח OpenAI API אינו מוגדר כראוי. אנא בדוק שהמפתח תקין ומתחיל ב-sk-');
      }

      const systemPrompt = customPrompt || getSystemPrompt(categoryLabels);
      console.log('Using system prompt for ChatGPT');

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
              content: systemPrompt
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 4000,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        
        if (response.status === 401) {
          throw new Error('מפתח OpenAI API אינו תקף. אנא בדוק שהמפתח נכון ופעיל.');
        } else if (response.status === 429) {
          throw new Error('חריגה מהמכסה של OpenAI API. אנא נסה שוב מאוחר יותר.');
        } else {
          throw new Error(`שגיאה ב-OpenAI API: ${response.status} - ${errorData.error?.message || 'שגיאה לא ידועה'}`);
        }
      }

      const result = await response.json();
      processedText = result.choices[0]?.message?.content || '';
      console.log('ChatGPT processing completed successfully');
      
    } else if (engine === 'claude') {
      if (!CLAUDE_API_KEY) {
        console.error('Claude API key not configured');
        throw new Error('מפתח Claude API אינו מוגדר כראוי. אנא בדוק שהמפתח תקין ומתחיל ב-sk-ant-');
      }

      console.log('Claude API key found, proceeding with request');
      const systemPrompt = customPrompt || getSystemPrompt(categoryLabels);
      console.log('Using system prompt for Claude');

      const requestBody = {
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: text
          }
        ]
      };

      console.log('Sending request to Claude API with model:', requestBody.model);

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

      console.log('Claude API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error response:', errorText);
        
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
          throw new Error(`שגיאה ב-Claude API: ${response.status} - ${errorData.error?.message || errorText || 'שגיאה לא ידועה'}`);
        }
      }

      const result = await response.json();
      console.log('Claude API response received, parsing content...');
      processedText = result.content?.[0]?.text || '';
      console.log('Claude processing completed successfully, text length:', processedText.length);
    } else {
      throw new Error('Invalid engine specified. Must be "chatgpt" or "claude"');
    }

    if (!processedText) {
      throw new Error('No processed text received from AI service');
    }

    console.log('Processing completed, returning result');
    return new Response(
      JSON.stringify({ processedText }),
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

function getSystemPrompt(categories: string[]): string {
  if (!categories || categories.length === 0) {
    return 'אתה עוזר AI מומחה בעיבוד טקסטים בעברית. תפקידך לשפר ולארגן את הטקסט הנתון בצורה ברורה ומועילת. הציג את התוצאה בעברית בפורמט ברור ומסודר.';
  }

  const categoryPrompts: Record<string, string> = {
    'סיכום': 'אתה עוזר AI מומחה בסיכום טקסטים בעברית. תפקידך לסכם את הטקסט הנתון בצורה ברורה ותמציתית, תוך שמירה על הנקודות החשובות והמידע המרכזי. הסיכום יהיה בעברית ויכלול את העיקרים בלבד.',
    'פעולות נדרשות': 'אתה עוזר AI מומחה בזיהוי משימות ופעולות. תפקידך לחלץ מהטקסט את כל המשימות, הפעולות והדברים שצריך לעשות. ארגן אותם ברשימה ברורה ומסודרת בעברית.',
    'נקודות עיקריות': 'אתה עוזר AI מומחה בזיהוי נקודות מפתח. תפקידך לחלץ ולהדגיש את הנקודות החשובות והמרכזיות ביותר מהטקסט. הציג אותם בצורה מסודרת בעברית.',
    'שאלות ותשובות': 'אתה עוזר AI מומחה בזיהוי שאלות ותשובות. תפקידך לחלץ מהטקסט שאלות שנשאלו ותשובות שניתנו, או ליצור שאלות רלוונטיות על סמך התוכן. הציג בפורמט שאלה-תשובה בעברית.',
    'החלטות': 'אתה עוזר AI מומחה בזיהוי החלטות. תפקידך לחלץ מהטקסט את כל החלטות שהתקבלו, הסכמות שהושגו והמסקנות. ארגן אותם ברשימה ברורה בעברית.',
    'עיצוב וארגון': 'אתה עוזר AI מומחה בעיצוב וארגון טקסט. תפקידך לארגן את הטקסט עם כותרות, תת-כותרות, רשימות ופסקאות מסודרות. שפר את הקריאות והבהירות בעברית.',
    'תוספת מקורות': 'אתה עוזר AI מומחה בהוספת מקורות ומידע נוסף. תפקידך להציע מקורות רלוונטיים, קישורים לקריאה נוספת והפניות שיכולות להעשיר את התוכן. הוסף הצעות למקורות אמינים בעברית.',
    'תיקון שגיאות כתיב ועריכה לשונית': 'אתה עוזר AI מומחה בתיקון דקדוק ועריכה בעברית. תפקידך לתקן שגיאות כתיב, דקדוק ואיות, לשפר את הניסוח והזרימה של הטקסט. החזר טקסט מתוקן ומעורך בעברית תקנית וברורה.'
  };

  if (categories.length === 1) {
    return categoryPrompts[categories[0]] || categoryPrompts['סיכום'];
  }

  const categoryString = categories.join(', ');
  return `אתה עוזר AI מומחה בעיבוד טקסטים בעברית. תפקידך לעבד את הטקסט הנתון על פי הקטגוריות הבאות: ${categoryString}. 
  
עבור כל קטגוריה, בצע את המשימה המתאימה והציג את התוצאות בפורמט ברור ומסודר בעברית. אם יש מספר קטגוריות, ארגן את התוצאה עם כותרות נפרדות לכל קטגוריה.`;
}
