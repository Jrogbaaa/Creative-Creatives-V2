'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { logger } from './logger';

// Supported languages
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'ko' | 'zh';

// Language configuration
export const LANGUAGES = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' }
};

// Translation keys interface
export interface TranslationKeys {
  // Navigation
  'nav.home': string;
  'nav.create': string;
  'nav.dashboard': string;
  'nav.signIn': string;
  'nav.signOut': string;

  // Authentication
  'auth.signIn': string;
  'auth.signUp': string;
  'auth.email': string;
  'auth.password': string;
  'auth.confirmPassword': string;
  'auth.forgotPassword': string;
  'auth.createAccount': string;
  'auth.alreadyHaveAccount': string;
  'auth.dontHaveAccount': string;

  // Brand Information
  'brand.name': string;
  'brand.description': string;
  'brand.industry': string;
  'brand.targetAudience': string;
  'brand.brandVoice': string;
  'brand.colorPalette': string;

  // Marcus AI
  'marcus.greeting': string;
  'marcus.askBrand': string;
  'marcus.generating': string;
  'marcus.planningStoryboard': string;
  'marcus.storyboardReady': string;

  // Storyboard
  'storyboard.title': string;
  'storyboard.scene': string;
  'storyboard.duration': string;
  'storyboard.description': string;
  'storyboard.generateImages': string;
  'storyboard.generateVideo': string;

  // Video Generation
  'video.generating': string;
  'video.processing': string;
  'video.ready': string;
  'video.download': string;
  'video.share': string;

  // Common UI
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.next': string;
  'common.back': string;
  'common.cancel': string;
  'common.save': string;
  'common.delete': string;
  'common.edit': string;
  'common.close': string;
  'common.offline': string;
  'common.online': string;

  // Error Messages
  'error.network': string;
  'error.authentication': string;
  'error.generation': string;
  'error.unknown': string;

  // Business Features
  'pricing.free': string;
  'pricing.premium': string;
  'pricing.enterprise': string;
  'features.unlimited': string;
  'features.priority': string;
  'features.support': string;

  // Character Replacement
  'character.title': string;
  'character.upload': string;
  'character.uploadDescription': string;
  'character.name': string;
  'character.nameDescription': string;
  'character.description': string;
  'character.descriptionOptional': string;
  'character.dragDrop': string;
  'character.selectImage': string;
  'character.remove': string;
  'character.uploaded': string;
  'character.replace': string;
  'character.replaceWith': string;
  'character.replacementPrompt': string;
  'character.targetDescription': string;
  'character.processing': string;
  'character.success': string;
  'character.failed': string;
  'character.batchApply': string;
  'character.batchProcessing': string;
  'character.consistency': string;
  'character.consistencyDescription': string;
  'character.quickApply': string;
  'character.selectScenes': string;
  'character.customPrompt': string;
  'character.maxReached': string;
  'character.uploadInstructions': string;
}

// Default English translations
const DEFAULT_TRANSLATIONS: TranslationKeys = {
  // Navigation
  'nav.home': 'Home',
  'nav.create': 'Create',
  'nav.dashboard': 'Dashboard',
  'nav.signIn': 'Sign In',
  'nav.signOut': 'Sign Out',

  // Authentication
  'auth.signIn': 'Sign In',
  'auth.signUp': 'Sign Up',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.confirmPassword': 'Confirm Password',
  'auth.forgotPassword': 'Forgot Password?',
  'auth.createAccount': 'Create Account',
  'auth.alreadyHaveAccount': 'Already have an account?',
  'auth.dontHaveAccount': "Don't have an account?",

  // Brand Information
  'brand.name': 'Brand Name',
  'brand.description': 'Brand Description',
  'brand.industry': 'Industry',
  'brand.targetAudience': 'Target Audience',
  'brand.brandVoice': 'Brand Voice',
  'brand.colorPalette': 'Color Palette',

  // Marcus AI
  'marcus.greeting': "Hi! I'm Marcus, your creative director. Let's create amazing ads together!",
  'marcus.askBrand': 'Tell me about your brand - what industry are you in and who is your target audience?',
  'marcus.generating': 'Marcus is thinking...',
  'marcus.planningStoryboard': 'Planning your storyboard...',
  'marcus.storyboardReady': 'Your storyboard is ready!',

  // Storyboard
  'storyboard.title': 'Storyboard',
  'storyboard.scene': 'Scene',
  'storyboard.duration': 'Duration',
  'storyboard.description': 'Description',
  'storyboard.generateImages': 'Generate Images',
  'storyboard.generateVideo': 'Generate Video',

  // Video Generation
  'video.generating': 'Generating your video...',
  'video.processing': 'Processing video...',
  'video.ready': 'Your video is ready!',
  'video.download': 'Download',
  'video.share': 'Share',

  // Common UI
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.next': 'Next',
  'common.back': 'Back',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.close': 'Close',
  'common.offline': 'You are offline',
  'common.online': 'You are back online',

  // Error Messages
  'error.network': 'Network error. Please check your connection.',
  'error.authentication': 'Authentication failed. Please try again.',
  'error.generation': 'Generation failed. Please try again.',
  'error.unknown': 'An unexpected error occurred.',

  // Business Features
  'pricing.free': 'Free',
  'pricing.premium': 'Premium',
  'pricing.enterprise': 'Enterprise',
  'features.unlimited': 'Unlimited',
  'features.priority': 'Priority Support',
  'features.support': '24/7 Support',

  // Character Replacement
  'character.title': 'Character References',
  'character.upload': 'Upload Character Photo',
  'character.uploadDescription': 'Upload photos of people you\'d like to replace characters with in your storyboard scenes.',
  'character.name': 'Character Name',
  'character.nameDescription': 'e.g., CEO John, Model Sarah',
  'character.description': 'Description (optional)',
  'character.descriptionOptional': 'e.g., Company CEO in formal wear',
  'character.dragDrop': 'Drag and drop an image here, or click to select',
  'character.selectImage': 'Select Image',
  'character.remove': 'Remove character',
  'character.uploaded': 'Uploaded {{date}}',
  'character.replace': 'Replace Character',
  'character.replaceWith': 'Replace with {{name}}',
  'character.replacementPrompt': 'Replacement Prompt',
  'character.targetDescription': 'What to replace (optional)',
  'character.processing': 'Processing character replacement...',
  'character.success': 'Character replacement successful',
  'character.failed': 'Character replacement failed',
  'character.batchApply': 'Apply to Multiple Scenes',
  'character.batchProcessing': 'Processing {{count}} scenes...',
  'character.consistency': 'Character Consistency Manager',
  'character.consistencyDescription': 'Apply characters consistently across all scenes',
  'character.quickApply': 'Quick Apply',
  'character.selectScenes': 'Select scenes to apply character',
  'character.customPrompt': 'Custom prompt (optional)',
  'character.maxReached': 'Maximum {{max}} character references reached',
  'character.uploadInstructions': 'You can apply characters to storyboard scenes for consistent representation throughout your advertisement.'
};

/**
 * Internationalization Service
 */
class I18nService {
  private translations: Map<SupportedLanguage, Partial<TranslationKeys>> = new Map();
  private currentLanguage: SupportedLanguage = 'en';
  private fallbackLanguage: SupportedLanguage = 'en';
  private isInitialized = false;

  constructor() {
    this.translations.set('en', DEFAULT_TRANSLATIONS);
  }

  /**
   * Initialize i18n with user's preferred language
   */
  async initialize(preferredLanguage?: SupportedLanguage): Promise<void> {
    try {
      // Detect language preference
      const language = this.detectLanguage(preferredLanguage);
      
      // Load translation for the detected language
      await this.loadLanguage(language);
      
      this.currentLanguage = language;
      this.isInitialized = true;

      logger.info('ui', 'i18n_initialized', {
        language,
        fallback: this.fallbackLanguage
      });
    } catch (error) {
      logger.error('ui', 'i18n_init_failed', {
        error: (error as Error).message
      });
    }
  }

  /**
   * Detect user's preferred language
   */
  private detectLanguage(preferred?: SupportedLanguage): SupportedLanguage {
    // 1. Use provided preference
    if (preferred && this.isLanguageSupported(preferred)) {
      return preferred;
    }

    // 2. Check localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('creative-creatives-language') as SupportedLanguage;
      if (stored && this.isLanguageSupported(stored)) {
        return stored;
      }
    }

    // 3. Check browser language
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
      if (this.isLanguageSupported(browserLang)) {
        return browserLang;
      }
    }

    // 4. Fall back to English
    return 'en';
  }

  /**
   * Check if language is supported
   */
  private isLanguageSupported(lang: string): lang is SupportedLanguage {
    return lang in LANGUAGES;
  }

  /**
   * Load translations for a specific language
   */
  async loadLanguage(language: SupportedLanguage): Promise<void> {
    if (language === 'en' || this.translations.has(language)) {
      return; // Already loaded
    }

    try {
      // Load translations from file or API
      const translations = await this.fetchTranslations(language);
      this.translations.set(language, translations);
      
      logger.info('ui', 'translations_loaded', { language });
    } catch (error) {
      logger.warn('ui', 'translations_load_failed', {
        language,
        error: (error as Error).message
      });
    }
  }

  /**
   * Fetch translations from external source
   */
  private async fetchTranslations(language: SupportedLanguage): Promise<Partial<TranslationKeys>> {
    try {
      // Option 1: Load from static files
      const response = await fetch(`/locales/${language}.json`);
      if (response.ok) {
        return await response.json();
      }

      // Option 2: Load from API
      if (process.env.NEXT_PUBLIC_TRANSLATIONS_API) {
        const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_TRANSLATIONS_API}/${language}`);
        if (apiResponse.ok) {
          return await apiResponse.json();
        }
      }

      // Option 3: Generate with AI (for development/fallback)
      return await this.generateTranslationsWithAI(language);
    } catch (error) {
      logger.warn('ui', 'translation_fetch_failed', {
        language,
        error: (error as Error).message
      });
      return {};
    }
  }

  /**
   * Generate translations using AI (fallback method)
   */
  private async generateTranslationsWithAI(language: SupportedLanguage): Promise<Partial<TranslationKeys>> {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLanguage: 'en',
          targetLanguage: language,
          translations: DEFAULT_TRANSLATIONS
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.translations;
      }
    } catch (error) {
      logger.warn('ui', 'ai_translation_failed', { language });
    }

    return {};
  }

  /**
   * Translate a key
   */
  t(key: keyof TranslationKeys, variables?: Record<string, string | number>): string {
    const langTranslations = this.translations.get(this.currentLanguage);
    const fallbackTranslations = this.translations.get(this.fallbackLanguage);

    let translation = langTranslations?.[key] || fallbackTranslations?.[key] || key;

    // Replace variables in translation
    if (variables) {
      Object.entries(variables).forEach(([varKey, value]) => {
        translation = translation.replace(`{{${varKey}}}`, String(value));
      });
    }

    return translation;
  }

  /**
   * Change language
   */
  async changeLanguage(language: SupportedLanguage): Promise<void> {
    if (!this.isLanguageSupported(language)) {
      throw new Error(`Language ${language} is not supported`);
    }

    await this.loadLanguage(language);
    this.currentLanguage = language;

    // Store preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('creative-creatives-language', language);
    }

    logger.info('ui', 'language_changed', { language });
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): Array<{code: SupportedLanguage, name: string, nativeName: string, flag: string}> {
    return Object.entries(LANGUAGES).map(([code, info]) => ({
      code: code as SupportedLanguage,
      ...info
    }));
  }

  /**
   * Format numbers according to locale
   */
  formatNumber(number: number): string {
    return new Intl.NumberFormat(this.getLocale()).format(number);
  }

  /**
   * Format currency according to locale
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat(this.getLocale(), {
      style: 'currency',
      currency
    }).format(amount);
  }

  /**
   * Format dates according to locale
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.getLocale(), options).format(date);
  }

  /**
   * Get locale for Intl APIs
   */
  private getLocale(): string {
    const localeMap: Record<SupportedLanguage, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      pt: 'pt-BR',
      ja: 'ja-JP',
      ko: 'ko-KR',
      zh: 'zh-CN'
    };
    return localeMap[this.currentLanguage] || 'en-US';
  }

  /**
   * Check if text direction is RTL
   */
  isRTL(): boolean {
    const rtlLanguages: SupportedLanguage[] = []; // Add RTL languages if needed
    return rtlLanguages.includes(this.currentLanguage);
  }
}

// Global i18n instance
export const i18n = new I18nService();

// React Context
interface I18nContextType {
  language: SupportedLanguage;
  t: (key: keyof TranslationKeys, variables?: Record<string, string | number>) => string;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  availableLanguages: Array<{code: SupportedLanguage, name: string, nativeName: string, flag: string}>;
  formatNumber: (number: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component
export const I18nProvider: React.FC<{ 
  children: React.ReactNode;
  initialLanguage?: SupportedLanguage;
}> = ({ children, initialLanguage }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeI18n = async () => {
      await i18n.initialize(initialLanguage);
      setLanguage(i18n.getCurrentLanguage());
      setIsInitialized(true);
    };

    initializeI18n();
  }, [initialLanguage]);

  const changeLanguage = async (newLanguage: SupportedLanguage) => {
    await i18n.changeLanguage(newLanguage);
    setLanguage(newLanguage);
  };

  const contextValue: I18nContextType = {
    language,
    t: (key, variables) => i18n.t(key, variables),
    changeLanguage,
    availableLanguages: i18n.getAvailableLanguages(),
    formatNumber: (number) => i18n.formatNumber(number),
    formatCurrency: (amount, currency) => i18n.formatCurrency(amount, currency),
    formatDate: (date, options) => i18n.formatDate(date, options),
    isRTL: i18n.isRTL()
  };

  if (!isInitialized) {
    return <div>Loading translations...</div>;
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

// Hook for using i18n
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Helper component for translations
export const T: React.FC<{
  k: keyof TranslationKeys;
  vars?: Record<string, string | number>;
  fallback?: string;
}> = ({ k, vars, fallback }) => {
  const { t } = useI18n();
  return <>{t(k, vars) || fallback || k}</>;
};
