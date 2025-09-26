'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { logger } from './logger';

// Feature flag definitions
export interface FeatureFlags {
  // AI Features
  veo3_video_generation: boolean;
  nano_banana_image_gen: boolean;
  marcus_ai_chat: boolean;
  ai_response_caching: boolean;
  multi_provider_fallback: boolean;

  // UI/UX Features  
  offline_mode: boolean;
  dark_theme: boolean;
  advanced_storyboard_editor: boolean;
  real_time_collaboration: boolean;
  drag_drop_scenes: boolean;

  // Business Features
  premium_models: boolean;
  batch_processing: boolean;
  custom_branding: boolean;
  analytics_dashboard: boolean;
  api_access: boolean;

  // Experimental Features
  voice_narration: boolean;
  auto_subtitle_generation: boolean;
  brand_voice_cloning: boolean;
  live_preview: boolean;
  mobile_app_deep_linking: boolean;
}

// Default flag values
const DEFAULT_FLAGS: FeatureFlags = {
  // AI Features (mostly enabled)
  veo3_video_generation: true,
  nano_banana_image_gen: true, 
  marcus_ai_chat: true,
  ai_response_caching: true,
  multi_provider_fallback: true,

  // UI/UX Features
  offline_mode: true,
  dark_theme: false, // Not implemented yet
  advanced_storyboard_editor: false,
  real_time_collaboration: false,
  drag_drop_scenes: false,

  // Business Features
  premium_models: false,
  batch_processing: false,
  custom_branding: false,
  analytics_dashboard: false,
  api_access: false,

  // Experimental Features
  voice_narration: false,
  auto_subtitle_generation: false,
  brand_voice_cloning: false,
  live_preview: false,
  mobile_app_deep_linking: false,
};

// Environment-based overrides
const ENVIRONMENT_OVERRIDES: Record<string, Partial<FeatureFlags>> = {
  development: {
    advanced_storyboard_editor: true,
    analytics_dashboard: true,
    live_preview: true,
  },
  staging: {
    premium_models: true,
    batch_processing: true,
    analytics_dashboard: true,
  },
  production: {
    // Production uses default flags or remote config
  }
};

// User-based feature flag rules
interface UserSegment {
  id: string;
  name: string;
  rules: {
    email_domains?: string[];
    user_ids?: string[];
    percentage?: number;
    created_after?: Date;
    has_subscription?: boolean;
  };
  flags: Partial<FeatureFlags>;
}

const USER_SEGMENTS: UserSegment[] = [
  {
    id: 'early_adopters',
    name: 'Early Adopters',
    rules: {
      email_domains: ['gmail.com', 'company.com'],
      percentage: 10 // 10% of users
    },
    flags: {
      real_time_collaboration: true,
      advanced_storyboard_editor: true,
      live_preview: true
    }
  },
  {
    id: 'premium_users', 
    name: 'Premium Users',
    rules: {
      has_subscription: true
    },
    flags: {
      premium_models: true,
      batch_processing: true,
      custom_branding: true,
      api_access: true
    }
  },
  {
    id: 'beta_testers',
    name: 'Beta Testers',
    rules: {
      user_ids: ['beta-tester-1', 'beta-tester-2'] // Specific user IDs
    },
    flags: {
      voice_narration: true,
      auto_subtitle_generation: true,
      brand_voice_cloning: true
    }
  }
];

/**
 * Feature Flag Management Service
 */
class FeatureFlagService {
  private flags: FeatureFlags = { ...DEFAULT_FLAGS };
  private userId?: string;
  private userEmail?: string;
  private isInitialized = false;

  constructor() {
    this.applyEnvironmentOverrides();
  }

  /**
   * Initialize with user context
   */
  async initialize(userId?: string, userEmail?: string): Promise<void> {
    this.userId = userId;
    this.userEmail = userEmail;

    // Apply user-specific flags
    if (userId && userEmail) {
      this.applyUserSegmentFlags(userId, userEmail);
    }

    // Load remote config if available
    await this.loadRemoteConfig();

    this.isInitialized = true;
    
    logger.info('ui', 'feature_flags_initialized', {
      userId,
      activeFlags: this.getActiveFlags()
    });
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(flag: keyof FeatureFlags): boolean {
    const enabled = this.flags[flag];
    
    // Log flag usage for analytics
    if (this.isInitialized) {
      logger.debug('ui', 'feature_flag_check', {
        flag,
        enabled,
        userId: this.userId
      });
    }

    return enabled;
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }

  /**
   * Get only enabled flags
   */
  getActiveFlags(): string[] {
    return Object.entries(this.flags)
      .filter(([_, enabled]) => enabled)
      .map(([flag]) => flag);
  }

  /**
   * Override a flag (for testing/debugging)
   */
  override(flag: keyof FeatureFlags, value: boolean): void {
    this.flags[flag] = value;
    
    logger.info('ui', 'feature_flag_override', {
      flag,
      value,
      userId: this.userId
    });
  }

  /**
   * Apply environment-based overrides
   */
  private applyEnvironmentOverrides(): void {
    const env = process.env.NODE_ENV || 'development';
    const overrides = ENVIRONMENT_OVERRIDES[env];
    
    if (overrides) {
      this.flags = { ...this.flags, ...overrides };
    }
  }

  /**
   * Apply user segment flags
   */
  private applyUserSegmentFlags(userId: string, userEmail: string): void {
    for (const segment of USER_SEGMENTS) {
      if (this.userMatchesSegment(userId, userEmail, segment)) {
        this.flags = { ...this.flags, ...segment.flags };
        
        logger.info('ui', 'user_segment_applied', {
          segment: segment.name,
          userId,
          flags: Object.keys(segment.flags)
        });
      }
    }
  }

  /**
   * Check if user matches a segment
   */
  private userMatchesSegment(userId: string, userEmail: string, segment: UserSegment): boolean {
    const { rules } = segment;

    // Check email domain
    if (rules.email_domains) {
      const domain = userEmail.split('@')[1];
      if (rules.email_domains.includes(domain)) {
        return true;
      }
    }

    // Check specific user IDs
    if (rules.user_ids?.includes(userId)) {
      return true;
    }

    // Check percentage rollout (based on user ID hash)
    if (rules.percentage) {
      const hash = this.hashUserId(userId);
      if (hash % 100 < rules.percentage) {
        return true;
      }
    }

    // Check subscription status (would need integration with billing)
    if (rules.has_subscription) {
      // TODO: Check actual subscription status
      return false;
    }

    return false;
  }

  /**
   * Simple hash function for percentage rollouts
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Load remote configuration
   */
  private async loadRemoteConfig(): Promise<void> {
    try {
      // In production, this would fetch from a remote config service
      // like Firebase Remote Config, Launch Darkly, etc.
      
      if (process.env.NEXT_PUBLIC_REMOTE_CONFIG_URL) {
        const response = await fetch(process.env.NEXT_PUBLIC_REMOTE_CONFIG_URL);
        if (response.ok) {
          const remoteFlags = await response.json();
          this.flags = { ...this.flags, ...remoteFlags };
          
          logger.info('ui', 'remote_config_loaded', {
            flags: Object.keys(remoteFlags)
          });
        }
      }
    } catch (error) {
      logger.warn('ui', 'remote_config_failed', {
        error: (error as Error).message
      });
    }
  }

  /**
   * Track feature flag usage for analytics
   */
  trackFeatureUsage(flag: keyof FeatureFlags, action: 'viewed' | 'used' | 'completed'): void {
    logger.info('business', 'feature_usage', {
      flag,
      action,
      userId: this.userId,
      enabled: this.flags[flag]
    });
  }
}

// Global feature flag instance
export const featureFlags = new FeatureFlagService();

// React hook for using feature flags
export const useFeatureFlags = () => {
  const { user } = useAuth();
  const [flags, setFlags] = React.useState<FeatureFlags>(featureFlags.getAllFlags());
  
  React.useEffect(() => {
    const initializeFlags = async () => {
      await featureFlags.initialize(user?.uid, user?.email || undefined);
      setFlags(featureFlags.getAllFlags());
    };
    
    initializeFlags();
  }, [user]);

  return {
    flags,
    isEnabled: (flag: keyof FeatureFlags) => featureFlags.isEnabled(flag),
    trackUsage: (flag: keyof FeatureFlags, action: 'viewed' | 'used' | 'completed') => 
      featureFlags.trackFeatureUsage(flag, action)
  };
};

// Helper components for conditional rendering
export const FeatureGate: React.FC<{
  flag: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ flag, children, fallback = null }) => {
  const { isEnabled } = useFeatureFlags();
  
  return isEnabled(flag) 
    ? React.createElement(React.Fragment, {}, children)
    : React.createElement(React.Fragment, {}, fallback);
};

// HOC for feature-gated components
export const withFeatureFlag = <P extends object>(
  flag: keyof FeatureFlags,
  Component: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => (
    React.createElement(FeatureGate, {
      flag,
      fallback: FallbackComponent ? React.createElement(FallbackComponent, props) : null,
      children: React.createElement(Component, props)
    })
  );
  
  WrappedComponent.displayName = `withFeatureFlag(${Component.displayName || Component.name})`;
  return WrappedComponent;
};
