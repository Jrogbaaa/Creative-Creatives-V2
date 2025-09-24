import { NextRequest, NextResponse } from 'next/server';
import { ChatMessage } from '@/types';
import { logger } from '@/lib/logger';
import { callMarcusLLM } from '@/lib/marcus-llm';

export async function POST(request: NextRequest) {
  let messages: ChatMessage[] = [];
  
  try {
    const body = await request.json();
    const { messages: bodyMessages, context } = body;
    
    messages = bodyMessages; // Store for catch block

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    console.log('🔄 [API] Calling Marcus LLM...');

    // Use the shared Marcus LLM function
    const response = await callMarcusLLM(messages, context);
    
    console.log('✅ [API] Marcus LLM succeeded');
    
    return NextResponse.json({
      success: true,
      response,
      provider: 'replicate',
      model: process.env.REPLICATE_MODEL || 'meta/meta-llama-3-8b-instruct'
    });

  } catch (error: any) {
    console.error('❌ [API] Marcus LLM error:', error.message);
    
    // Fallback to simple responses
    const lastMessage = messages?.[messages.length - 1]?.content || '';
    const fallbackResponse = getFallbackResponse(lastMessage);
    
    return NextResponse.json({
      success: true,
      response: fallbackResponse,
      provider: 'fallback',
      model: 'marcus-backup'
    });
  }
}


function getFallbackResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
    return `Hi there! I'm Marcus, your creative director. I'm excited to help you create amazing advertisements! 

Tell me about your brand:
• What industry are you in?
• Who's your target audience?
• What kind of ad are you looking to create?

Let's get started! 🎬`;
  }
  
  if (message.includes('brand') || message.includes('company') || message.includes('business')) {
    return `Great! Understanding your brand is crucial for creating effective advertising. Here's what I typically help with:

**Brand Strategy:**
• Identifying your unique value proposition
• Understanding your target demographic
• Defining your brand voice and personality
• Positioning against competitors

**For a strong 30-second ad, I usually recommend:**
1. **Hook (0-5s):** Grab attention immediately
2. **Story (5-20s):** Show your product/service benefit
3. **Call-to-Action (20-30s):** Clear next step for viewers

What specific aspect of your brand would you like to explore first?`;
  }
  
  return `Thanks for that! I'm Marcus, and I'd love to help you with your creative project.

I'm currently experiencing some technical issues with my main AI backend, but my creative expertise is always available! Here's what I can definitely help with:

**Immediate Support:**
• Brand strategy and positioning
• Creative concept development  
• 30-second ad structure and flow
• Visual storytelling techniques
• Target audience insights

What's your biggest creative challenge right now? Let's tackle it together! 🎯`;
}
