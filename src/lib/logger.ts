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

class Logger {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(level: LogEvent['level'], category: LogEvent['category'], event: string, data?: Record<string, any>, userId?: string): void {
    const logEvent: LogEvent = {
      timestamp: new Date().toISOString(),
      level,
      category,
      event,
      data,
      userId,
      sessionId: this.sessionId,
    };

    // Console logging for development
    const logMethod = level === 'error' ? console.error : 
                     level === 'warn' ? console.warn : 
                     level === 'debug' ? console.debug : console.log;
    
    logMethod('[CreativeCreatives]', logEvent);

    // In production, you might want to send to a logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logEvent);
    }
  }

  private sendToLoggingService(logEvent: LogEvent): void {
    // Send to multiple logging services in production
    try {
      // 1. Send to internal analytics API
      this.sendToInternalAPI(logEvent).catch(console.error);
      
      // 2. Send to Vercel Analytics (if available)
      this.sendToVercelAnalytics(logEvent).catch(console.error);
      
      // 3. Send to Sentry (for errors)
      if (logEvent.level === 'error') {
        this.sendToSentry(logEvent).catch(console.error);
      }
      
      // 4. Send to PostHog (for user analytics)
      if (logEvent.category === 'ui' || logEvent.category === 'auth') {
        this.sendToPostHog(logEvent).catch(console.error);
      }
      
    } catch (error) {
      console.error('Failed to send log to services:', error);
    }
  }

  private async sendToInternalAPI(logEvent: LogEvent): Promise<void> {
    if (!process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) return;
    
    await fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEvent),
    });
  }

  private async sendToVercelAnalytics(logEvent: LogEvent): Promise<void> {
    // Check if Vercel Analytics is available
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', `${logEvent.category}_${logEvent.event}`, {
        level: logEvent.level,
        sessionId: logEvent.sessionId,
        ...logEvent.data
      });
    }
  }

  private async sendToSentry(logEvent: LogEvent): Promise<void> {
    // Check if Sentry is available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;
      
      if (logEvent.level === 'error') {
        Sentry.captureException(new Error(logEvent.event), {
          tags: {
            category: logEvent.category,
            sessionId: logEvent.sessionId,
          },
          extra: logEvent.data
        });
      } else {
        Sentry.addBreadcrumb({
          message: logEvent.event,
          category: logEvent.category,
          level: logEvent.level as any,
          data: logEvent.data
        });
      }
    }
  }

  private async sendToPostHog(logEvent: LogEvent): Promise<void> {
    // Check if PostHog is available
    if (typeof window !== 'undefined' && (window as any).posthog) {
      const posthog = (window as any).posthog;
      
      posthog.capture(`${logEvent.category}_${logEvent.event}`, {
        level: logEvent.level,
        sessionId: logEvent.sessionId,
        userId: logEvent.userId,
        ...logEvent.data
      });
    }
  }

  // AI Provider specific logging methods
  aiProviderAttempt(provider: string, model: string, userId?: string): void {
    this.log('info', 'ai_provider', 'provider_attempt', {
      provider,
      model,
      attemptTime: Date.now()
    }, userId);
  }

  aiProviderSuccess(provider: string, model: string, responseTime: number, tokenCount?: number, userId?: string): void {
    this.log('info', 'ai_provider', 'provider_success', {
      provider,
      model,
      responseTime,
      tokenCount,
      success: true
    }, userId);
  }

  aiProviderError(provider: string, model: string, error: string, responseTime: number, userId?: string): void {
    this.log('error', 'ai_provider', 'provider_error', {
      provider,
      model,
      error: error.substring(0, 500), // Limit error message length
      responseTime,
      success: false
    }, userId);
  }

  aiProviderFallback(fromProvider: string, toProvider: string, reason: string, userId?: string): void {
    this.log('warn', 'ai_provider', 'provider_fallback', {
      fromProvider,
      toProvider,
      reason,
      fallbackTime: Date.now()
    }, userId);
  }

  // Authentication logging
  authAttempt(method: string, userId?: string): void {
    this.log('info', 'auth', 'auth_attempt', {
      method,
      attemptTime: Date.now()
    }, userId);
  }

  authSuccess(method: string, userId: string): void {
    this.log('info', 'auth', 'auth_success', {
      method,
      successTime: Date.now()
    }, userId);
  }

  authError(method: string, error: string, userId?: string): void {
    this.log('error', 'auth', 'auth_error', {
      method,
      error: error.substring(0, 200),
      errorTime: Date.now()
    }, userId);
  }

  // Performance logging
  performanceMetric(metric: string, value: number, unit: string, additionalData?: Record<string, any>): void {
    this.log('info', 'performance', 'metric', {
      metric,
      value,
      unit,
      ...additionalData
    });
  }

  // UI interaction logging
  uiInteraction(component: string, action: string, userId?: string, additionalData?: Record<string, any>): void {
    this.log('debug', 'ui', 'interaction', {
      component,
      action,
      interactionTime: Date.now(),
      ...additionalData
    }, userId);
  }

  // Error boundary logging
  errorBoundary(componentStack: string, error: Error, userId?: string): void {
    this.log('error', 'ui', 'error_boundary', {
      componentStack,
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 1000), // Limit stack trace
      errorTime: Date.now()
    }, userId);
  }

  // General purpose logging
  info(category: LogEvent['category'], event: string, data?: Record<string, any>, userId?: string): void {
    this.log('info', category, event, data, userId);
  }

  warn(category: LogEvent['category'], event: string, data?: Record<string, any>, userId?: string): void {
    this.log('warn', category, event, data, userId);
  }

  error(category: LogEvent['category'], event: string, data?: Record<string, any>, userId?: string): void {
    this.log('error', category, event, data, userId);
  }

  debug(category: LogEvent['category'], event: string, data?: Record<string, any>, userId?: string): void {
    this.log('debug', category, event, data, userId);
  }
}

export const logger = new Logger();

// Helper function to get user ID from context if available
export const getUserId = (): string | undefined => {
  // Try to get user from Firebase auth if available
  if (typeof window !== 'undefined') {
    try {
      // Access Firebase auth current user if available
      const auth = (window as any).firebase?.auth?.();
      return auth?.currentUser?.uid;
    } catch (error) {
      // Silently fail if Firebase isn't available
      return undefined;
    }
  }
  return undefined;
};

// Enhanced logging with automatic user context
export const logWithContext = (category: LogEvent['category'], event: string, data?: Record<string, any>) => {
  const userId = getUserId();
  logger.info(category, event, data, userId);
};

// Performance monitoring helper
export const measurePerformance = (name: string, fn: () => Promise<any>) => {
  return async (...args: any[]) => {
    const startTime = performance.now();
    try {
      const result = await fn.apply(null, args);
      const duration = performance.now() - startTime;
      logger.performanceMetric(name, duration, 'ms', { success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.performanceMetric(name, duration, 'ms', { success: false, error: (error as Error).message });
      throw error;
    }
  };
};

// AI Provider performance tracking
export const trackAIProviderCall = async (
  provider: string, 
  model: string, 
  operation: () => Promise<any>
): Promise<any> => {
  const startTime = Date.now();
  const userId = getUserId();
  
  logger.aiProviderAttempt(provider, model, userId);
  
  try {
    const result = await operation();
    const responseTime = Date.now() - startTime;
    logger.aiProviderSuccess(provider, model, responseTime, undefined, userId);
    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.aiProviderError(provider, model, (error as Error).message, responseTime, userId);
    throw error;
  }
};

// Error boundary integration
export const reportErrorToServices = (error: Error, errorInfo?: any) => {
  const userId = getUserId();
  logger.errorBoundary(errorInfo?.componentStack || '', error, userId);
  
  // Additional error reporting to external services
  if (typeof window !== 'undefined') {
    // Report to Sentry if available
    if ((window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        user: { id: userId },
        extra: errorInfo
      });
    }
  }
};
