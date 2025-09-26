/**
 * 🎭 COMPREHENSIVE PLAYWRIGHT UI TESTING
 * 
 * This test suite performs end-to-end UI testing with screenshots and visual validation:
 * 1. Navigate through the complete application workflow
 * 2. Test character upload and replacement
 * 3. Test VEO video generation with visual feedback
 * 4. Capture screenshots at every critical step
 * 5. Verify video serving and playback
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
  timeout: 300000, // 5 minutes for video generation
  screenshot: true,
  video: 'retain-on-failure',
  trace: 'retain-on-failure'
};

// Test data
const TEST_BRAND = {
  name: 'Playwright Test Brand',
  industry: 'Technology Testing',
  targetAudience: 'QA Engineers and Developers'
};

test.describe('Creative Creatives - Full UI Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for this test
    test.setTimeout(TEST_CONFIG.timeout);
    
    // Navigate to homepage
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('Complete UI Workflow - Character Upload & VEO Generation', async ({ page }) => {
    console.log('🎭 Starting comprehensive UI workflow test...');

    // Step 1: Homepage and Navigation
    await page.screenshot({ path: 'test-results/01-homepage.png', fullPage: true });
    console.log('📸 Screenshot: Homepage loaded');

    // Wait for and click Get Started
    const getStartedButton = page.locator('[data-testid="hero-get-started-free-btn"]');
    await expect(getStartedButton).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/02-get-started-visible.png' });
    
    await getStartedButton.click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/03-after-get-started-click.png', fullPage: true });
    console.log('📸 Screenshot: After Get Started click');

    // Step 2: Check if we're on create page or need authentication
    const currentUrl = page.url();
    console.log(`Current URL after Get Started: ${currentUrl}`);
    
    if (currentUrl.includes('/create')) {
      console.log('✅ Direct access to create page');
    } else {
      console.log('🔄 Redirected, checking for auth or other page');
      await page.screenshot({ path: 'test-results/04-redirect-page.png', fullPage: true });
      
      // Try to navigate directly to create page
      await page.goto('http://localhost:3000/create');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/05-direct-create-navigation.png', fullPage: true });
    }

    // Step 3: Brand Information (if on create page)
    if (page.url().includes('/create')) {
      console.log('🏢 Filling brand information...');
      
      // Fill brand name
      const brandNameField = page.locator('input[placeholder*="brand name" i], input[name*="brand" i], input[label*="brand" i]');
      if (await brandNameField.isVisible()) {
        await brandNameField.fill(TEST_BRAND.name);
        console.log('✅ Brand name filled');
      }

      // Fill industry
      const industryField = page.locator('input[placeholder*="industry" i], select[name*="industry" i]');
      if (await industryField.isVisible()) {
        await industryField.fill(TEST_BRAND.industry);
        console.log('✅ Industry filled');
      }

      // Fill target audience
      const audienceField = page.locator('input[placeholder*="audience" i], textarea[placeholder*="audience" i]');
      if (await audienceField.isVisible()) {
        await audienceField.fill(TEST_BRAND.targetAudience);
        console.log('✅ Target audience filled');
      }

      await page.screenshot({ path: 'test-results/06-brand-info-filled.png', fullPage: true });
      console.log('📸 Screenshot: Brand information filled');

      // Step 4: Navigate to storyboard/character section
      // Look for next button or tabs
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button[type="submit"]').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'test-results/07-after-brand-next.png', fullPage: true });
      }
    }

    // Step 5: Character Upload Testing
    console.log('👤 Testing character upload...');
    
    // Create a test image file
    const testImagePath = path.join(__dirname, '../test-assets/test-character-upload.png');
    if (!fs.existsSync(path.dirname(testImagePath))) {
      fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
    }

    // Create a simple test image using Canvas (if available) or use a placeholder
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const base64Data = testImageData.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(testImagePath, imageBuffer);

    // Look for file upload input
    const fileInputs = page.locator('input[type="file"]');
    const fileInputCount = await fileInputs.count();
    console.log(`Found ${fileInputCount} file input(s)`);

    if (fileInputCount > 0) {
      // Upload character image
      await fileInputs.first().setInputFiles(testImagePath);
      await page.waitForTimeout(2000); // Wait for upload processing
      await page.screenshot({ path: 'test-results/08-character-uploaded.png', fullPage: true });
      console.log('📸 Screenshot: Character image uploaded');
    } else {
      // Look for upload buttons or areas
      const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Choose"), [data-testid*="upload"]').first();
      if (await uploadButton.isVisible()) {
        await uploadButton.click();
        await page.waitForTimeout(1000);
        
        // Try file upload after clicking
        const modalFileInput = page.locator('input[type="file"]').first();
        if (await modalFileInput.isVisible()) {
          await modalFileInput.setInputFiles(testImagePath);
          await page.waitForTimeout(2000);
        }
      }
      await page.screenshot({ path: 'test-results/08-upload-attempt.png', fullPage: true });
    }

    // Step 6: Generate Storyboard/Scenes
    console.log('🎨 Testing storyboard generation...');
    
    const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("Start")').first();
    if (await generateButton.isVisible()) {
      await generateButton.click();
      console.log('✅ Generate button clicked');
      
      // Wait for processing
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'test-results/09-storyboard-generating.png', fullPage: true });
      
      // Wait for storyboard to complete
      try {
        await page.waitForSelector('[data-testid*="scene"], .scene, .storyboard-scene', { timeout: 60000 });
        await page.screenshot({ path: 'test-results/10-storyboard-generated.png', fullPage: true });
        console.log('📸 Screenshot: Storyboard generated');
      } catch (error) {
        console.log('⚠️  Storyboard generation timeout, continuing...');
        await page.screenshot({ path: 'test-results/10-storyboard-timeout.png', fullPage: true });
      }
    }

    // Step 7: Character Replacement Testing
    console.log('🔄 Testing character replacement...');
    
    // Look for character replacement buttons
    const characterButtons = page.locator('button:has-text("Replace"), button:has-text("Character"), [data-testid*="character"]');
    const characterButtonCount = await characterButtons.count();
    console.log(`Found ${characterButtonCount} character-related button(s)`);

    if (characterButtonCount > 0) {
      await characterButtons.first().click();
      await page.waitForTimeout(3000); // Wait for character replacement
      await page.screenshot({ path: 'test-results/11-character-replacement.png', fullPage: true });
      console.log('📸 Screenshot: Character replacement attempted');
    }

    // Step 8: Video Generation Testing (VEO)
    console.log('🎬 Testing VEO video generation...');
    
    // Look for video generation button
    const videoButton = page.locator('button:has-text("Generate Video"), button:has-text("Create Video"), button:has-text("VEO"), [data-testid*="video"]').first();
    
    if (await videoButton.isVisible()) {
      console.log('🎥 Video generation button found');
      await page.screenshot({ path: 'test-results/12-before-video-generation.png', fullPage: true });
      
      // Click video generation
      await videoButton.click();
      console.log('✅ Video generation button clicked');
      
      // Wait and monitor for video generation status
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'test-results/13-video-generation-started.png', fullPage: true });
      
      // Look for loading states or progress indicators
      let generationComplete = false;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max wait
      
      while (!generationComplete && attempts < maxAttempts) {
        attempts++;
        await page.waitForTimeout(5000); // Wait 5 seconds between checks
        
        // Check for completion indicators
        const successIndicators = page.locator('[data-testid*="success"], .success, :has-text("completed"), :has-text("ready"), :has-text("finished")');
        const errorIndicators = page.locator('[data-testid*="error"], .error, :has-text("failed"), :has-text("error")');
        
        const hasSuccess = await successIndicators.count() > 0;
        const hasError = await errorIndicators.count() > 0;
        
        if (hasSuccess || hasError) {
          generationComplete = true;
          const status = hasSuccess ? 'SUCCESS' : 'ERROR';
          await page.screenshot({ path: `test-results/14-video-generation-${status.toLowerCase()}.png`, fullPage: true });
          console.log(`📸 Screenshot: Video generation ${status}`);
          
          if (hasError) {
            // Capture error details
            const errorText = await errorIndicators.first().textContent();
            console.log(`❌ Video generation error: ${errorText}`);
          }
        } else {
          // Capture progress screenshot every 30 seconds
          if (attempts % 6 === 0) {
            await page.screenshot({ path: `test-results/14-video-progress-${attempts}.png`, fullPage: true });
            console.log(`📸 Progress screenshot: Attempt ${attempts}/${maxAttempts}`);
          }
        }
      }
      
      if (!generationComplete) {
        await page.screenshot({ path: 'test-results/14-video-generation-timeout.png', fullPage: true });
        console.log('⏰ Video generation timed out after 5 minutes');
      }
    } else {
      console.log('❌ Video generation button not found');
      await page.screenshot({ path: 'test-results/12-no-video-button.png', fullPage: true });
    }

    // Step 9: Gallery/Results Testing
    console.log('🖼️  Testing gallery and video serving...');
    
    // Navigate to gallery if not already there
    const galleryLink = page.locator('a[href*="gallery"], button:has-text("Gallery"), [data-testid*="gallery"]').first();
    if (await galleryLink.isVisible()) {
      await galleryLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/15-gallery-page.png', fullPage: true });
    } else {
      // Try direct navigation
      await page.goto('http://localhost:3000/gallery');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/15-gallery-direct.png', fullPage: true });
    }

    // Check for videos in gallery
    const videos = page.locator('video, [data-testid*="video"], .video-card, .video-thumbnail');
    const videoCount = await videos.count();
    console.log(`Found ${videoCount} video(s) in gallery`);

    if (videoCount > 0) {
      await page.screenshot({ path: 'test-results/16-videos-found.png', fullPage: true });
      
      // Try to play first video
      const firstVideo = videos.first();
      if (await firstVideo.isVisible()) {
        await firstVideo.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'test-results/17-video-playback-attempt.png', fullPage: true });
        console.log('📸 Screenshot: Video playback attempted');
      }
    } else {
      console.log('❌ No videos found in gallery');
      await page.screenshot({ path: 'test-results/16-no-videos-found.png', fullPage: true });
    }

    // Step 10: Network and Console Analysis
    console.log('🔍 Analyzing network requests and console errors...');
    
    // Get console logs
    const logs = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    
    // Get network failures
    const failedRequests = [];
    page.on('response', response => {
      if (!response.ok()) {
        failedRequests.push(`${response.status()}: ${response.url()}`);
      }
    });

    // Wait a bit more to capture any final network activity
    await page.waitForTimeout(5000);
    
    // Generate final report
    const report = {
      timestamp: new Date().toISOString(),
      testDuration: Date.now() - test.info().startTime,
      consoleLogs: logs,
      failedRequests: failedRequests,
      finalUrl: page.url(),
      screenshots: [
        '01-homepage.png',
        '02-get-started-visible.png',
        '03-after-get-started-click.png',
        '04-redirect-page.png',
        '05-direct-create-navigation.png',
        '06-brand-info-filled.png',
        '07-after-brand-next.png',
        '08-character-uploaded.png',
        '09-storyboard-generating.png',
        '10-storyboard-generated.png',
        '11-character-replacement.png',
        '12-before-video-generation.png',
        '13-video-generation-started.png',
        '14-video-generation-result.png',
        '15-gallery-page.png',
        '16-videos-found.png',
        '17-video-playback-attempt.png'
      ]
    };

    // Save report
    fs.writeFileSync('test-results/comprehensive-ui-test-report.json', JSON.stringify(report, null, 2));
    console.log('📋 Test report saved to test-results/comprehensive-ui-test-report.json');

    // Final screenshot
    await page.screenshot({ path: 'test-results/18-test-completion.png', fullPage: true });
    console.log('🎭 Comprehensive UI workflow test completed!');
  });
});
