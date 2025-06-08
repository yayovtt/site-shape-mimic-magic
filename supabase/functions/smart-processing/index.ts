
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { text, engine, category, customPrompt } = await req.json();
    
    if (!text || !engine) {
      throw new Error('Missing required parameters');
    }

    console.log(`Processing with ${engine} for category: ${category}`);

    let processedText = '';
    
    if (engine === 'chatgpt') {
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

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
              content: customPrompt || getSystemPrompt(category)
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
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      processedText = result.choices[0]?.message?.content || '';
      
    } else if (engine === 'claude') {
      if (!CLAUDE_API_KEY) {
        throw new Error('Claude API key not configured');
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLAUDE_API_KEY}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 4000,
          system: customPrompt || getSystemPrompt(category),
          messages: [
            {
              role: 'user',
              content: text
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Claude API error:', errorData);
        throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      processedText = result.content[0]?.text || '';
    } else {
      throw new Error('Invalid engine specified');
    }

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

function getSystemPrompt(category: string): string {
  const prompts = {
    'summary': 'אתה עוזר AI מומחה בסיכום טקסטים בעברית. תפקידך לסכם את הטקסט הנתון בצורה ברורה ותמציתית, תוך שמירה על הנקודות החשובות והמידע המרכזי. הסיכום יהיה בעברית ויכלול את העיקרים בלבד.',
    'meeting': 'אתה עוזר AI מומחה בעיבוד פרוטוקולי פגישות. תפקידך לארגן את תוכן הפגישה בצורה מובנית: נושאים עיקריים, החלטות שהתקבלו, משימות לביצוע, ומשתתפים. הציג את התוצאה בעברית בפורמט ברור ומסודר.',
    'lecture': 'אתה עוזר AI מומחה בעיבוד תוכן לימודי והרצאות. תפקידך לארגן את תוכן ההרצאה לנקודות עיקריות, מושגי מפתח, ודוגמאות חשובות. הציג את התוכן בצורה מסודרת וקלה ללמידה בעברית.',
    'interview': 'אתה עוזר AI מומחה בעיבוד ראיונות. תפקידך לארגן את הראיון לתשובות מובנות לפי נושאים, להדגיש נקודות מעניינות וחשובות, ולסכם את העיקרים. הציג בעברית בפורמט ברור.',
    'creative': 'אתה עוזר AI יצירתי. תפקידך לקחת את הטקסט ולשפר אותו מבחינה יצירתית - לשפר את הניסוח, להוסיף אלמנטים ספרותיים, ולהפוך אותו למעניין ומושך יותר. שמור על התוכן המקורי אך הפוך אותו ליצירתי יותר בעברית.',
    'grammar': 'אתה עוזר AI מומחה בתיקון דקדוק ועריכה בעברית. תפקידך לתקן שגיאות דקדוק, איות וסגנון, לשפר את הזרימה והבהירות של הטקסט. החזר את הטקסט המתוקן בעברית תקנית וברורה.'
  };
  
  return prompts[category] || prompts['summary'];
}
