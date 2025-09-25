import { NextRequest, NextResponse } from 'next/server';
import { firebaseVideos } from '@/lib/firebase-videos';

interface RouteParams {
  params: {
    videoId: string;
  };
}

// GET /api/user/videos/[videoId] - Get specific video
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { videoId } = params;

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const video = await firebaseVideos.getVideo(videoId);

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      video
    });

  } catch (error) {
    console.error('❌ Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/user/videos/[videoId] - Update video
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { videoId } = params;
    const body = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const {
      status,
      videoUrl,
      title,
      description,
      metadata
    } = body;

    const updates: any = {};
    if (status) updates.status = status;
    if (videoUrl) updates.videoUrl = videoUrl;
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (metadata) updates.metadata = metadata;

    await firebaseVideos.updateVideo(videoId, updates);

    return NextResponse.json({
      success: true,
      message: 'Video updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating video:', error);
    return NextResponse.json(
      { error: 'Failed to update video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/videos/[videoId] - Delete video
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { videoId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await firebaseVideos.deleteVideo(videoId, userId);

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting video:', error);
    return NextResponse.json(
      { error: 'Failed to delete video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
