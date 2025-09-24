import { NextRequest, NextResponse } from 'next/server';

interface LogEvent {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'ai_provider' | 'auth' | 'ui' | 'performance' | 'business' | 'security';
  event: string;
  data?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  referrer?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Only process logs in production or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
      return NextResponse.json({ success: true, message: 'Analytics disabled in development' });
    }

    const logEvent: LogEvent = await request.json();
    
    // Add request metadata
    logEvent.userAgent = request.headers.get('user-agent') || undefined;
    logEvent.url = request.headers.get('referer') || undefined;
    logEvent.referrer = request.headers.get('referer') || undefined;
    
    // Validate log event
    if (!logEvent.event || !logEvent.category) {
      return NextResponse.json(
        { error: 'Missing required fields: event, category' },
        { status: 400 }
      );
    }

    // Process different log types
    await processLogEvent(logEvent);
    
    console.log(`📊 [Analytics] Processed ${logEvent.category}:${logEvent.event}`);
    
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ [Analytics] Error processing log event:', error);
    return NextResponse.json(
      { error: 'Failed to process log event' },
      { status: 500 }
    );
  }
}

async function processLogEvent(logEvent: LogEvent): Promise<void> {
  // 1. Store in database (if configured)
  if (process.env.DATABASE_URL) {
    await storeInDatabase(logEvent);
  }
  
  // 2. Send to external analytics services
  await sendToExternalServices(logEvent);
  
  // 3. Trigger alerts for critical events
  if (shouldTriggerAlert(logEvent)) {
    await triggerAlert(logEvent);
  }
}

async function storeInDatabase(logEvent: LogEvent): Promise<void> {
  try {
    // Here you would integrate with your database
    // Example: PostgreSQL, MongoDB, etc.
    console.log('📀 [Analytics] Would store in database:', logEvent.event);
  } catch (error) {
    console.error('Database storage error:', error);
  }
}

async function sendToExternalServices(logEvent: LogEvent): Promise<void> {
  try {
    // Send to different services based on log type
    const promises: Promise<void>[] = [];

    // AI Provider analytics to specialized service
    if (logEvent.category === 'ai_provider') {
      promises.push(sendToAIAnalytics(logEvent));
    }

    // Error tracking
    if (logEvent.level === 'error') {
      promises.push(sendToErrorTracking(logEvent));
    }

    // User behavior analytics
    if (logEvent.category === 'ui' || logEvent.category === 'auth') {
      promises.push(sendToUserAnalytics(logEvent));
    }

    // Business metrics
    if (logEvent.category === 'business') {
      promises.push(sendToBusinessAnalytics(logEvent));
    }

    await Promise.allSettled(promises);
  } catch (error) {
    console.error('External service error:', error);
  }
}

async function sendToAIAnalytics(logEvent: LogEvent): Promise<void> {
  // Track AI provider performance and costs
  console.log('🤖 [Analytics] AI Provider event:', {
    provider: logEvent.data?.provider,
    model: logEvent.data?.model,
    success: logEvent.data?.success,
    responseTime: logEvent.data?.responseTime
  });
}

async function sendToErrorTracking(logEvent: LogEvent): Promise<void> {
  // Send critical errors to error tracking service
  if (process.env.SENTRY_DSN) {
    console.log('🚨 [Analytics] Error tracking:', logEvent.event);
  }
}

async function sendToUserAnalytics(logEvent: LogEvent): Promise<void> {
  // Track user interactions and engagement
  console.log('👤 [Analytics] User behavior:', {
    event: logEvent.event,
    userId: logEvent.userId,
    sessionId: logEvent.sessionId
  });
}

async function sendToBusinessAnalytics(logEvent: LogEvent): Promise<void> {
  // Track business metrics like conversions, feature usage
  console.log('💼 [Analytics] Business metric:', {
    event: logEvent.event,
    value: logEvent.data?.value,
    currency: logEvent.data?.currency
  });
}

function shouldTriggerAlert(logEvent: LogEvent): boolean {
  // Define conditions for triggering alerts
  return (
    logEvent.level === 'error' ||
    logEvent.category === 'security' ||
    (logEvent.category === 'ai_provider' && logEvent.event === 'provider_error' && logEvent.data?.consecutive_failures > 3) ||
    (logEvent.category === 'performance' && logEvent.data?.value > 10000) // 10s response time
  );
}

async function triggerAlert(logEvent: LogEvent): Promise<void> {
  console.log('🚨 [Analytics] ALERT TRIGGERED:', logEvent.event);
  
  // Here you would integrate with alerting services like:
  // - Slack webhooks
  // - Email notifications  
  // - PagerDuty
  // - Discord webhooks
  
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *Creative Creatives Alert*: ${logEvent.event}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Event:* ${logEvent.event}\\n*Category:* ${logEvent.category}\\n*Level:* ${logEvent.level}\\n*User:* ${logEvent.userId || 'Anonymous'}\\n*Time:* ${logEvent.timestamp}`
              }
            }
          ]
        })
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }
}
