import { NextRequest, NextResponse } from 'next/server';
import { googleAI } from '@/lib/google-ai';
import { VeoGenerationRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Check if Google Cloud credentials are configured
    const hasCredentials = process.env.GOOGLE_CLOUD_PROJECT_ID && 
                          process.env.GOOGLE_CLOUD_CLIENT_EMAIL && 
                          process.env.GOOGLE_CLOUD_PRIVATE_KEY;

    if (!hasCredentials) {
      return NextResponse.json(
        { 
          error: 'Google Cloud credentials not configured',
          details: 'Please set up GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_CLIENT_EMAIL, and GOOGLE_CLOUD_PRIVATE_KEY environment variables',
          setup_required: true
        },
        { status: 500 }
      );
    }

    const body: VeoGenerationRequest = await request.json();
    
    // Validate required fields
    if (!body.prompt || !body.duration || !body.aspectRatio) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, duration, aspectRatio' },
        { status: 400 }
      );
    }

    // Validate duration
    if (![15, 30, 60].includes(body.duration)) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be 15, 30, or 60 seconds' },
        { status: 400 }
      );
    }

    // Validate aspect ratio
    if (!['16:9', '9:16', '1:1'].includes(body.aspectRatio)) {
      return NextResponse.json(
        { error: 'Invalid aspect ratio. Must be 16:9, 9:16, or 1:1' },
        { status: 400 }
      );
    }

    // Generate video with VEO 3
    const result = await googleAI.generateVideo(body);
    
    return NextResponse.json({
      success: true,
      jobId: result.jobId,
      message: 'Video generation started successfully'
    });

  } catch (error) {
    console.error('Video generation API error:', error);
    
    // Check if it's an authentication error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isAuthError = errorMessage.includes('auth') || errorMessage.includes('credentials') || errorMessage.includes('permission');
    
    return NextResponse.json(
      { 
        error: isAuthError ? 'Google Cloud authentication failed' : 'Failed to generate video',
        details: errorMessage,
        setup_required: isAuthError
      },
      { status: 500 }
    );
  }
}
