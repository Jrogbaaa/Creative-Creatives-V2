import { NextRequest, NextResponse } from 'next/server';
import { featureFlags } from '@/lib/feature-flags';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');

    // Initialize feature flags with user context
    if (userId && userEmail) {
      await featureFlags.initialize(userId, userEmail);
    }

    const flags = featureFlags.getAllFlags();
    const activeFlags = featureFlags.getActiveFlags();

    return NextResponse.json({
      success: true,
      flags,
      activeFlags,
      metadata: {
        total: Object.keys(flags).length,
        enabled: activeFlags.length,
        disabled: Object.keys(flags).length - activeFlags.length
      }
    });
  } catch (error) {
    console.error('Feature flags API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch feature flags'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flag, enabled, userId } = body;

    // Validate flag exists
    const currentFlags = featureFlags.getAllFlags();
    if (!(flag in currentFlags)) {
      return NextResponse.json({
        success: false,
        error: `Unknown feature flag: ${flag}`
      }, { status: 400 });
    }

    // Override flag (for testing/admin use)
    featureFlags.override(flag as keyof typeof currentFlags, enabled);

    return NextResponse.json({
      success: true,
      message: `Feature flag ${flag} ${enabled ? 'enabled' : 'disabled'}`,
      flag,
      enabled
    });
  } catch (error) {
    console.error('Feature flag override error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update feature flag'
    }, { status: 500 });
  }
}
