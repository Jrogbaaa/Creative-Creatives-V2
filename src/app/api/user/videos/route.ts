import { NextRequest, NextResponse } from 'next/server';
import { firebaseVideos } from '@/lib/firebase-videos';

// GET /api/user/videos - List user's videos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as 'processing' | 'completed' | 'failed' | null;
    const projectId = searchParams.get('projectId');
    const limit = searchParams.get('limit');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const filter = {
      userId,
      ...(status && { status }),
      ...(projectId && { projectId }),
      ...(limit && { limit: parseInt(limit) })
    };

    const videos = await firebaseVideos.getUserVideos(filter);

    return NextResponse.json({
      success: true,
      videos,
      count: videos.length
    });

  } catch (error) {
    console.error('❌ Error fetching user videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/user/videos - Save new video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      userId,
      title,
      description,
      jobId,
      projectId,
      storyboardId,
      metadata
    } = body;

    if (!userId || !title || !jobId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, jobId' },
        { status: 400 }
      );
    }

    const videoData = {
      userId,
      title,
      description: description || '',
      status: 'processing' as const,
      jobId,
      projectId,
      storyboardId,
      metadata: {
        duration: metadata?.duration || 30,
        resolution: metadata?.resolution || '720p',
        aspectRatio: metadata?.aspectRatio || '16:9',
        brandInfo: metadata?.brandInfo || { name: '', industry: '', targetAudience: '' },
        sceneCount: metadata?.sceneCount || 1,
        ...metadata
      }
    };

    const videoId = await firebaseVideos.saveVideo(videoData);

    return NextResponse.json({
      success: true,
      videoId,
      message: 'Video saved successfully'
    });

  } catch (error) {
    console.error('❌ Error saving video:', error);
    return NextResponse.json(
      { error: 'Failed to save video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
