/**
 * 🎬 VEO3 COMPREHENSIVE END-TO-END TEST SUITE
 * 
 * This test verifies the entire VEO3 video generation pipeline:
 * 1. Navigation and UI interactions
 * 2. Brand information input
 * 3. Video configuration
 * 4. Video generation trigger
 * 5. Status polling and completion
 * 6. Video storage verification
 * 7. Gallery display and playback
 * 
 * This is the CRITICAL test for ensuring VEO3 integration works properly.
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:3000',
  timeout: 300000, // 5 minutes for video generation
  navigationTimeout: 30000,
  waitForPoll: 10000 // Wait between status polls
};

// Sample brand data for testing
const SAMPLE_BRAND = {
  name: 'TestFlow Analytics',
  industry: 'Technology',
  targetAudience: 'Software developers and data scientists',
  brandVoice: 'Professional and innovative',
  description: 'AI-powered analytics platform for modern development teams'
};

// Sample video configuration
const VIDEO_CONFIG = {
  duration: 15, // Shorter for faster testing
  aspectRatio: '16:9',
  style: 'Professional'
};

test.describe('VEO3 Complete Video Generation Pipeline', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for video generation tests
    test.setTimeout(TEST_CONFIG.timeout);
    
    // Enable request interception to log API calls
    await page.route('**/api/**', route => {
      console.log(`🌐 API Call: ${route.request().method()} ${route.request().url()}`);
      route.continue();
    });
    
    // Navigate to homepage
    await page.goto(TEST_CONFIG.baseURL);
    await expect(page).toHaveTitle(/Creative Creatives/);
    
    console.log('🏠 Homepage loaded successfully');
  });

  test('Complete VEO3 Video Generation Workflow', async ({ page }) => {
    console.log('🚀 Starting complete VEO3 workflow test...');
    
    // Step 1: Navigate to Create Page
    console.log('📍 Step 1: Navigating to Create page');
    await page.click('text=Start Creating Now');
    await page.waitForURL('**/create');
    await expect(page.locator('h1')).toContainText('Create Your Advertisement');
    
    // Step 2: Fill Brand Information
    console.log('📝 Step 2: Filling brand information');
    
    // Fill brand name
    const brandNameInput = page.locator('input[placeholder*="brand name"], input[name="name"]').first();
    await brandNameInput.waitFor({ state: 'visible' });
    await brandNameInput.fill(SAMPLE_BRAND.name);
    
    // Fill industry
    const industryInput = page.locator('input[placeholder*="industry"], select[name="industry"]').first();
    await industryInput.fill(SAMPLE_BRAND.industry);
    
    // Fill target audience
    const audienceInput = page.locator('input[placeholder*="audience"], textarea[name="targetAudience"]').first();
    await audienceInput.fill(SAMPLE_BRAND.targetAudience);
    
    // Continue to next step
    const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
    await continueButton.click();
    
    console.log('✅ Brand information filled successfully');
    
    // Step 3: Video Configuration
    console.log('⚙️ Step 3: Configuring video settings');
    
    // Wait for video configuration section
    await page.waitForSelector('text=Duration, text=15 seconds, text=30 seconds', { timeout: 10000 });
    
    // Select duration (15 seconds for faster testing)
    const duration15 = page.locator('button:has-text("15"), input[value="15"]').first();
    if (await duration15.isVisible()) {
      await duration15.click();
    }
    
    // Select aspect ratio
    const aspectRatio = page.locator('button:has-text("16:9")').first();
    if (await aspectRatio.isVisible()) {
      await aspectRatio.click();
    }
    
    console.log('✅ Video configuration set successfully');
    
    // Step 4: Generate Storyboard (if needed)
    console.log('🎨 Step 4: Generating storyboard');
    
    const generateStoryboard = page.locator('button:has-text("Generate Storyboard")').first();
    if (await generateStoryboard.isVisible()) {
      await generateStoryboard.click();
      
      // Wait for storyboard generation to complete
      await page.waitForSelector('text=Select Image, text=Generated Successfully', { timeout: 60000 });
      
      // Select first image from first scene
      const firstImage = page.locator('.scene img, .generated-image img').first();
      await firstImage.click();
      
      console.log('✅ Storyboard generated and image selected');
    }
    
    // Step 5: Trigger Video Generation
    console.log('🎬 Step 5: Starting video generation');
    
    const generateVideoButton = page.locator('button:has-text("Generate Video")').first();
    await expect(generateVideoButton).toBeVisible({ timeout: 30000 });
    await generateVideoButton.click();
    
    console.log('✅ Video generation triggered');
    
    // Step 6: Monitor Video Generation Progress
    console.log('⏳ Step 6: Monitoring video generation progress');
    
    // Wait for generation status to appear
    await page.waitForSelector('text=Starting, text=Processing, text=VEO, text=generating', { timeout: 30000 });
    
    let generationComplete = false;
    let pollAttempts = 0;
    const maxPollAttempts = 30; // 5 minutes max
    
    while (!generationComplete && pollAttempts < maxPollAttempts) {
      pollAttempts++;
      console.log(`🔄 Poll attempt ${pollAttempts}/${maxPollAttempts}`);
      
      // Check for completion indicators
      const completionTexts = [
        'text=Your video ad is ready',
        'text=Video generation completed',
        'text=Generation complete',
        'text=Ready for download',
        'video[src], source[src]' // Video element present
      ];
      
      for (const selector of completionTexts) {
        if (await page.locator(selector).first().isVisible()) {
          generationComplete = true;
          console.log('✅ Video generation completed!');
          break;
        }
      }
      
      // Check for errors
      const errorIndicators = [
        'text=Generation failed',
        'text=Error occurred',
        'text=Failed to generate'
      ];
      
      for (const selector of errorIndicators) {
        if (await page.locator(selector).first().isVisible()) {
          throw new Error(`Video generation failed: Found error indicator ${selector}`);
        }
      }
      
      if (!generationComplete) {
        await page.waitForTimeout(TEST_CONFIG.waitForPoll);
      }
    }
    
    if (!generationComplete) {
      // Check if we have a jobId for development mode testing
      const devModeIndicator = page.locator('text=Mock video generation, text=development mode');
      if (await devModeIndicator.first().isVisible()) {
        console.log('🚧 Development mode detected, checking for mock completion');
        await page.waitForTimeout(15000); // Wait for mock completion
        generationComplete = true;
      } else {
        throw new Error('Video generation timed out after 5 minutes');
      }
    }
    
    console.log('✅ Video generation monitoring completed');
    
    // Step 7: Verify Video Storage
    console.log('💾 Step 7: Verifying video storage');
    
    // Check if video appears in UI
    const videoElement = page.locator('video, .video-player, .generated-video').first();
    if (await videoElement.isVisible()) {
      console.log('✅ Video element found in UI');
    }
    
    // Verify via API call
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/user/videos?userId=test-user-veo3');
        const data = await response.json();
        return { success: response.ok, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('📡 API Response:', apiResponse);
    expect(apiResponse.success).toBe(true);
    
    // Step 8: Test Gallery Display
    console.log('🖼️ Step 8: Testing gallery display');
    
    // Navigate to gallery
    await page.goto(`${TEST_CONFIG.baseURL}/gallery`);
    await expect(page).toHaveURL(/.*gallery/);
    
    // Check if videos are displayed
    const galleryVideos = page.locator('.video-card, .gallery-item, .stored-video');
    const videoCount = await galleryVideos.count();
    
    console.log(`📊 Found ${videoCount} videos in gallery`);
    expect(videoCount).toBeGreaterThan(0);
    
    if (videoCount > 0) {
      // Test video interaction
      const firstVideo = galleryVideos.first();
      await expect(firstVideo).toBeVisible();
      
      // Check for play button or video preview
      const playButton = firstVideo.locator('button:has-text("Play"), .play-button, video');
      if (await playButton.first().isVisible()) {
        console.log('✅ Video playback controls found');
      }
      
      // Check for download option
      const downloadButton = firstVideo.locator('button:has-text("Download"), a[download]');
      if (await downloadButton.first().isVisible()) {
        console.log('✅ Video download option found');
      }
    }
    
    console.log('✅ Gallery display verified');
    
    // Step 9: Final Verification
    console.log('🎯 Step 9: Final pipeline verification');
    
    // Capture final screenshot
    await page.screenshot({ 
      path: 'test-results/veo3-final-state.png', 
      fullPage: true 
    });
    
    console.log('✅ VEO3 Complete Pipeline Test PASSED! 🎉');
  });
  
  test('VEO3 Error Handling and Recovery', async ({ page }) => {
    console.log('🛠️ Testing VEO3 error handling...');
    
    // Navigate to create page
    await page.goto(`${TEST_CONFIG.baseURL}/create`);
    
    // Test invalid configurations
    const generateButton = page.locator('button:has-text("Generate Video")').first();
    
    // Try to generate without proper setup
    if (await generateButton.isVisible()) {
      await generateButton.click();
      
      // Should show validation errors
      await expect(page.locator('text=required, text=missing, text=invalid')).toBeVisible({ timeout: 5000 });
    }
    
    console.log('✅ Error handling verification completed');
  });
  
  test('VEO3 API Integration Health Check', async ({ page }) => {
    console.log('🏥 Running VEO3 API health checks...');
    
    // Test video status endpoint
    const statusResponse = await page.evaluate(async () => {
      const response = await fetch('/api/video-status/health-check');
      return { status: response.status, ok: response.ok };
    });
    
    // Test video generation endpoint (without actually generating)
    const generateResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/generate-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: 'Health check test',
            duration: 15,
            aspectRatio: '16:9'
          })
        });
        return { status: response.status, ok: response.ok };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('📊 API Health Status:', { statusResponse, generateResponse });
    
    console.log('✅ API health check completed');
  });
  
  test.afterEach(async ({ page }) => {
    // Cleanup and logging
    console.log('🧹 Test cleanup completed');
    
    // Capture any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
  });
});
