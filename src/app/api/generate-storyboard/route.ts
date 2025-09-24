import { NextRequest, NextResponse } from 'next/server';
import { marcusStoryboard } from '@/lib/marcus-storyboard';
import { MarcusStoryboardRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: MarcusStoryboardRequest = await request.json();
    
    // Validate required fields
    if (!body.brandInfo || !body.brandInfo.name) {
      return NextResponse.json(
        { error: 'Brand information is required' },
        { status: 400 }
      );
    }

    if (!body.targetDuration || body.targetDuration < 15 || body.targetDuration > 60) {
      return NextResponse.json(
        { error: 'Target duration must be between 15-60 seconds' },
        { status: 400 }
      );
    }

    console.log('🎬 [API] Starting Marcus storyboard generation...');

    // Generate storyboard plan with Marcus
    const storyboardPlan = await marcusStoryboard.generateStoryboardPlan(body);
    
    console.log('✅ [API] Marcus storyboard generated successfully');
    
    return NextResponse.json({
      success: true,
      storyboard: storyboardPlan,
      message: `Marcus created a ${storyboardPlan.scenes.length}-scene storyboard`
    });

  } catch (error) {
    console.error('❌ [API] Storyboard generation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to generate storyboard',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
