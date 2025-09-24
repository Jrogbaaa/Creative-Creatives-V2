import { NextRequest, NextResponse } from 'next/server';
import { callMarcusLLM } from '@/lib/marcus-llm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceLanguage, targetLanguage, translations } = body;

    if (!sourceLanguage || !targetLanguage || !translations) {
      return NextResponse.json({
        error: 'Missing required fields: sourceLanguage, targetLanguage, translations'
      }, { status: 400 });
    }

    console.log(`🌍 [Translate] ${sourceLanguage} → ${targetLanguage}`);

    // Use Marcus to translate the content
    const translationPrompt = createTranslationPrompt(sourceLanguage, targetLanguage, translations);
    
    const marcusResponse = await callMarcusLLM([
      { role: 'user', content: translationPrompt }
    ], {
      currentGoal: 'translation',
      extractedInfo: { sourceLanguage, targetLanguage }
    });

    // Parse the translation response
    const translatedContent = parseTranslationResponse(marcusResponse);

    return NextResponse.json({
      success: true,
      translations: translatedContent,
      sourceLanguage,
      targetLanguage
    });

  } catch (error) {
    console.error('❌ [Translate] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Translation failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}

function createTranslationPrompt(sourceLanguage: string, targetLanguage: string, translations: any): string {
  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    pt: 'Portuguese',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese'
  };

  const sourceName = languageNames[sourceLanguage] || sourceLanguage;
  const targetName = languageNames[targetLanguage] || targetLanguage;

  return `You are a professional translator specializing in software localization and creative advertising copy.

TASK: Translate the following UI strings from ${sourceName} to ${targetName}.

REQUIREMENTS:
1. Maintain the exact JSON structure
2. Keep all keys unchanged, translate only the values
3. Preserve any placeholder variables like {{variable}}
4. Use appropriate cultural context for advertising/creative terms
5. Keep technical terms consistent
6. Maintain brand voice and tone

SOURCE LANGUAGE: ${sourceName}
TARGET LANGUAGE: ${targetName}

ORIGINAL TRANSLATIONS:
${JSON.stringify(translations, null, 2)}

Please provide the translated JSON with the same structure but with values translated to ${targetName}. Respond with valid JSON only.`;
}

function parseTranslationResponse(response: string): any {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback: try parsing the entire response
    return JSON.parse(response);
  } catch (error) {
    console.warn('Failed to parse translation response, returning empty object');
    return {};
  }
}
