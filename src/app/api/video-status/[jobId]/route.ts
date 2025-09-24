import { NextRequest, NextResponse } from 'next/server';
import { googleAI } from '@/lib/google-ai';

interface RouteParams {
  params: {
    jobId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { jobId } = params;
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Check video generation status
    const status = await googleAI.checkVideoStatus(jobId);
    
    return NextResponse.json({
      success: true,
      jobId,
      status: status.status,
      videoUrl: status.videoUrl,
      error: status.error,
      message: getStatusMessage(status.status)
    });

  } catch (error) {
    console.error('Video status check API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check video status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

const getStatusMessage = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Video generation is queued';
    case 'processing':
      return 'VEO 3 is creating your video...';
    case 'completed':
      return 'Your video is ready!';
    case 'failed':
      return 'Video generation failed';
    default:
      return 'Unknown status';
  }
};
