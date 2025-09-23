interface LogEvent {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'ai_provider' | 'auth' | 'ui' | 'performance';
  event: string;
  data?: Record<string, any>;
  userId?: string;
  sessionId?: string;
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
    // Placeholder for production logging service integration
    // Examples: Vercel Analytics, Sentry, LogRocket, etc.
    try {
      // Example: Send to your analytics endpoint
      // fetch('/api/analytics/log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEvent),
      // }).catch(console.error);
    } catch (error) {
      console.error('Failed to send log to service:', error);
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
