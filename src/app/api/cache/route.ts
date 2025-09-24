import { NextRequest, NextResponse } from 'next/server';
import { aiCache } from '@/lib/ai-cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = aiCache.getStats();
        return NextResponse.json({
          success: true,
          stats
        });

      case 'warm':
        await aiCache.warmCache();
        return NextResponse.json({
          success: true,
          message: 'Cache warming initiated'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use ?action=stats or ?action=warm'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Cache API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    const tags = searchParams.get('tags');

    if (provider) {
      await aiCache.clearProvider(provider);
      return NextResponse.json({
        success: true,
        message: `Cleared cache for provider: ${provider}`
      });
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      await aiCache.invalidateByTags(tagArray);
      return NextResponse.json({
        success: true,
        message: `Invalidated cache for tags: ${tagArray.join(', ')}`
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Specify provider or tags parameter'
    }, { status: 400 });
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear cache'
    }, { status: 500 });
  }
}
