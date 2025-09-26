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
      console.log('🚧 [DEV MODE] Google Cloud credentials not configured - using mock video generation');
      
      // Development mode: Return a mock successful response
      if (process.env.NODE_ENV === 'development') {
        const mockJobId = `dev_job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('🎬 [DEV MODE] Mock video generation started with job ID:', mockJobId);
        
        return NextResponse.json({
          success: true,
          jobId: mockJobId,
          message: 'Mock video generation started (development mode)',
          development_mode: true,
          setup_instructions: {
            description: 'To enable real video generation, configure Google Cloud credentials:',
            required_vars: [
              'GOOGLE_CLOUD_PROJECT_ID',
              'GOOGLE_CLOUD_CLIENT_EMAIL', 
              'GOOGLE_CLOUD_PRIVATE_KEY'
            ],
            docs_url: 'https://cloud.google.com/docs/authentication/getting-started'
          }
        });
      }

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
    console.error('❌ [API] Video generation error:', error);
    
    // Get detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isAuthError = errorMessage.includes('auth') || errorMessage.includes('credentials') || errorMessage.includes('permission') || errorMessage.includes('401') || errorMessage.includes('403');
    const isQuotaError = errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('Preview Access Required');
    const isNotFoundError = errorMessage.includes('404') || errorMessage.includes('not found');
    
    console.error('❌ [API] Error details:', {
      errorMessage,
      isAuthError,
      isQuotaError,
      isNotFoundError,
      errorType: typeof error
    });

    let responseError = 'Failed to generate video';
    let setupRequired = false;

    if (isAuthError) {
      responseError = 'Google Cloud authentication failed';
      setupRequired = true;
    } else if (isQuotaError) {
      responseError = 'VEO 3 access required - apply for preview access';
      setupRequired = true;
    } else if (isNotFoundError) {
      responseError = 'VEO 3 model not available in your region/project';
      setupRequired = true;
    }
    
    return NextResponse.json(
      { 
        error: responseError,
        details: errorMessage,
        setup_required: setupRequired,
        // Include additional debug info in development
        debug: process.env.NODE_ENV === 'development' ? {
          originalError: error instanceof Error ? error.stack : String(error)
        } : undefined
      },
      { status: 500 }
    );
  }
}
