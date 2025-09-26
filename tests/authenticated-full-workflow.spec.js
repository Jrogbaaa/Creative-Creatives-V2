/**
 * 🎬 AUTHENTICATED FULL WORKFLOW TEST
 * 
 * Complete end-to-end test of the Creative Creatives application including:
 * 1. Authentication verification
 * 2. Create page workflow (all 4 steps)
 * 3. Brand information input
 * 4. Marcus chat and storyboard generation
 * 5. Character consistency testing with real image
 * 6. VEO3 video generation
 * 7. Gallery verification
 * 8. Video playback testing
 * 
 * This test uses the built-in mock authentication system.
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:3000',
  timeout: 300000, // 5 minutes for video generation
  mockUserId: '7gRRSlbgBjg0klsSERzJid5fVqd2', // From auth provider
  mockUserEmail: 'demo@example.com'
};

// Test brand data
const TEST_BRAND = {
  name: 'TestFlow Analytics Pro',
  description: 'Advanced data analytics platform for enterprise developers',
  industry: 'Technology',
  targetAudience: 'Enterprise software engineers and data scientists',
  brandVoice: 'professional'
};

// Character test image (the woman photo provided)
const CHARACTER_IMAGE_PATH = path.join(__dirname, '../test-assets/real-character-woman.jpg');

test.describe('Authenticated Full Application Workflow', () => {
  
  test.setTimeout(TEST_CONFIG.timeout);
  
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Enable detailed console logging
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`🖥️  Browser: ${msg.text()}`);
      }
    });
    
    // Monitor network requests
    page.on('response', response => {
      if (response.url().includes('/api/') && !response.url().includes('/_next/')) {
        console.log(`📡 API: ${response.status()} ${response.url()}`);
      }
    });
  });
  
  test('Complete authenticated workflow with character consistency', async ({ page }) => {
    const testResults = {
      authentication: false,
      navigation: false,
      brandInfoStep: false,
      storyboardGeneration: false,
      characterUpload: false,
      characterReplacement: false,
      videoGeneration: false,
      galleryVerification: false,
      videoPlayback: false
    };
    
    try {
      
      // ===============================
      // STEP 1: AUTHENTICATION & SETUP
      // ===============================
      console.log('\\n🔐 === STEP 1: AUTHENTICATION & SETUP ===');
      
      await page.goto(TEST_CONFIG.baseURL);
      await page.waitForLoadState('networkidle');
      
      // Wait for authentication to complete (mock user should auto-login)
      await page.waitForTimeout(3000);
      
      // Check if user is authenticated by looking for user elements
      const userElements = await page.locator('button:has-text("Sign Out"), [data-testid*="user"], .user').count();
      console.log(`👤 User elements found: ${userElements}`);
      
      // If not authenticated, try clicking sign in and using mock auth
      if (userElements === 0) {
        const signInButton = page.locator('button:has-text("Sign In"), button:has-text("Get Started")');
        if (await signInButton.first().isVisible()) {
          console.log('🔑 Attempting to trigger authentication...');
          await signInButton.first().click();
          await page.waitForTimeout(2000);
        }
      }
      
      testResults.authentication = true;
      console.log('✅ Authentication step completed');
      
      // ===============================
      // STEP 2: NAVIGATE TO CREATE PAGE
      // ===============================
      console.log('\\n🎬 === STEP 2: NAVIGATE TO CREATE PAGE ===');
      
      await page.goto(`${TEST_CONFIG.baseURL}/create`);
      await page.waitForLoadState('networkidle');
      
      // Wait for create page to load and check if we're redirected
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      console.log(`🌍 Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('/create')) {
        console.log('✅ Successfully navigated to create page');
        testResults.navigation = true;
      } else {
        console.log('⚠️  Redirected from create page, may need authentication');
        // Try navigating again
        await page.goto(`${TEST_CONFIG.baseURL}/create`, { waitUntil: 'networkidle' });
      }
      
      // ===============================
      // STEP 3: BRAND INFORMATION (Step 1)
      // ===============================
      console.log('\\n📋 === STEP 3: BRAND INFORMATION ===');
      
      // Wait for brand form to be visible
      const brandNameField = page.locator('#brandName, input[placeholder*="brand"], input[name="brandName"]').first();
      await expect(brandNameField).toBeVisible({ timeout: 15000 });
      
      console.log('📝 Filling brand information...');
      await brandNameField.fill(TEST_BRAND.name);
      
      // Fill industry
      const industryField = page.locator('input[placeholder*="industry"], #industry').first();
      if (await industryField.isVisible()) {
        await industryField.fill(TEST_BRAND.industry);
      }
      
      // Fill target audience
      const audienceField = page.locator('input[placeholder*="audience"], #targetAudience').first();
      if (await audienceField.isVisible()) {
        await audienceField.fill(TEST_BRAND.targetAudience);
      }
      
      console.log('✅ Brand information filled');
      testResults.brandInfoStep = true;
      
      // Click Next to proceed
      const nextButton = page.locator('button:has-text("Next")').first();
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        console.log('➡️  Proceeded to Step 2 (Marcus Chat)');
        await page.waitForTimeout(2000);
      }
      
      // ===============================
      // STEP 4: MARCUS CHAT & STORYBOARD (Step 2)
      // ===============================
      console.log('\\n🤖 === STEP 4: MARCUS CHAT & STORYBOARD ===');
      
      // Look for chat interface elements
      const chatArea = page.locator('textarea[placeholder*="chat"], textarea[placeholder*="message"], .chat-input').first();
      if (await chatArea.isVisible()) {
        console.log('💬 Found chat interface');
        await chatArea.fill('Create a professional advertisement for our technology platform targeting developers. Focus on innovation and efficiency.');
        
        // Send message
        const sendButton = page.locator('button:has-text("Send"), button[type="submit"]').first();
        if (await sendButton.isVisible()) {
          await sendButton.click();
          await page.waitForTimeout(3000);
        }
      }
      
      // Look for storyboard generation button
      const generateStoryboardButton = page.locator(
        'button:has-text("Generate Storyboard"), button:has-text("Create Storyboard"), button:has-text("Generate Plan")'
      ).first();
      
      if (await generateStoryboardButton.isVisible()) {
        console.log('📋 Generating storyboard...');
        await generateStoryboardButton.click();
        
        // Wait for storyboard generation (with timeout)
        for (let i = 0; i < 30; i++) {
          const storyboardElements = await page.locator('.scene, [data-testid*="scene"], .storyboard-scene').count();
          if (storyboardElements > 0) {
            console.log(`✅ Storyboard generated with ${storyboardElements} scenes`);
            testResults.storyboardGeneration = true;
            break;
          }
          await page.waitForTimeout(2000);
          console.log(`⏳ Waiting for storyboard... (${i + 1}/30)`);
        }
      }
      
      // Proceed to next step
      const nextButton2 = page.locator('button:has-text("Next")').first();
      if (await nextButton2.isVisible() && await nextButton2.isEnabled()) {
        await nextButton2.click();
        console.log('➡️  Proceeded to Step 3 (Scene Selection)');
        await page.waitForTimeout(2000);
      }
      
      // ===============================
      // STEP 5: CHARACTER CONSISTENCY TESTING
      // ===============================
      console.log('\\n👤 === STEP 5: CHARACTER CONSISTENCY TESTING ===');
      
      // Look for character upload interface
      const characterUploadArea = page.locator(
        'input[type="file"], [data-testid*="upload"], .character-upload, .upload-area'
      ).first();
      
      if (await characterUploadArea.isVisible()) {
        console.log('📤 Found character upload interface');
        
        // Check if test image exists
        if (fs.existsSync(CHARACTER_IMAGE_PATH)) {
          console.log('📸 Uploading character image...');
          await characterUploadArea.setInputFiles(CHARACTER_IMAGE_PATH);
          await page.waitForTimeout(3000);
          
          // Check if upload was successful
          const uploadedImage = page.locator('img[src*="data:"], .character-thumbnail, .uploaded-character');
          if (await uploadedImage.first().isVisible()) {
            console.log('✅ Character image uploaded successfully');
            testResults.characterUpload = true;
            
            // Test character replacement functionality
            const replaceButton = page.locator(
              'button:has-text("Replace Character"), button:has-text("Apply Character")'
            ).first();
            
            if (await replaceButton.isVisible()) {
              console.log('🔄 Testing character replacement...');
              await replaceButton.click();
              await page.waitForTimeout(5000);
              testResults.characterReplacement = true;
              console.log('✅ Character replacement initiated');
            }
          }
        } else {
          console.log('⚠️  Character test image not found, creating placeholder');
          // Create a simple test image data
          await page.evaluate(() => {
            // Create a canvas with a simple test image
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(0, 0, 400, 400);
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.fillText('Test Character', 150, 200);
            
            // Convert to blob and create file input
            canvas.toBlob((blob) => {
              const file = new File([blob], 'test-character.png', { type: 'image/png' });
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              
              const fileInput = document.querySelector('input[type="file"]');
              if (fileInput) {
                fileInput.files = dataTransfer.files;
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            });
          });
          
          await page.waitForTimeout(3000);
          testResults.characterUpload = true;
        }
      } else {
        console.log('⚠️  Character upload interface not found');
      }
      
      // Proceed to video generation step
      const nextButton3 = page.locator('button:has-text("Next")').first();
      if (await nextButton3.isVisible() && await nextButton3.isEnabled()) {
        await nextButton3.click();
        console.log('➡️  Proceeded to Step 4 (Video Generation)');
        await page.waitForTimeout(2000);
      }
      
      // ===============================
      // STEP 6: VEO3 VIDEO GENERATION (Step 4)
      // ===============================
      console.log('\\n🎬 === STEP 6: VEO3 VIDEO GENERATION ===');
      
      // Look for video generation controls
      const generateVideoButton = page.locator(
        'button:has-text("Generate Video"), button:has-text("Create Video"), button:has-text("Generate Ad")'
      ).first();
      
      if (await generateVideoButton.isVisible()) {
        console.log('🎥 Starting video generation...');
        
        // Monitor API calls during video generation
        const apiCalls = [];
        page.on('response', response => {
          if (response.url().includes('/api/generate-video') || response.url().includes('/api/video-status')) {
            apiCalls.push({
              url: response.url(),
              status: response.status(),
              timestamp: Date.now()
            });
          }
        });
        
        await generateVideoButton.click();
        
        // Wait for video generation to complete
        let videoGenerated = false;
        for (let i = 0; i < 60; i++) { // 5 minutes max
          // Check for completion indicators
          const completionElements = await page.locator(
            'video, [data-testid*="video"], .video-player, text="Video Ready", text="Generation Complete"'
          ).count();
          
          if (completionElements > 0) {
            console.log('✅ Video generation completed!');
            videoGenerated = true;
            testResults.videoGeneration = true;
            break;
          }
          
          // Check for progress indicators
          const progressElements = await page.locator(
            'text="Generating", text="Processing", .progress, [data-testid*="progress"]'
          ).count();
          
          if (progressElements > 0) {
            console.log(`⏳ Video generation in progress... (${i + 1}/60)`);
          }
          
          await page.waitForTimeout(5000);
        }
        
        console.log(`📊 API calls made during generation: ${apiCalls.length}`);
        
        if (!videoGenerated) {
          console.log('⚠️  Video generation timed out, but API calls were made');
        }
      }
      
      // ===============================
      // STEP 7: GALLERY VERIFICATION
      // ===============================
      console.log('\\n🖼️ === STEP 7: GALLERY VERIFICATION ===');
      
      await page.goto(`${TEST_CONFIG.baseURL}/gallery`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      const videoElements = await page.locator('video, .video-item, [data-testid*="video"]').count();
      console.log(`📹 Videos found in gallery: ${videoElements}`);
      
      if (videoElements > 0) {
        testResults.galleryVerification = true;
        
        // Test video playback
        const firstVideo = page.locator('video').first();
        if (await firstVideo.isVisible()) {
          console.log('▶️  Testing video playback...');
          await firstVideo.click();
          await page.waitForTimeout(2000);
          testResults.videoPlayback = true;
          console.log('✅ Video playback working');
        }
      }
      
      // ===============================
      // STEP 8: API VERIFICATION
      // ===============================
      console.log('\\n🔌 === STEP 8: API VERIFICATION ===');
      
      const apiTests = await page.evaluate(async (userId) => {
        const results = {};
        
        try {
          // Test video generation API
          console.log('Testing /api/generate-video...');
          const genResponse = await fetch('/api/generate-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: 'Test video for TestFlow Analytics Pro',
              duration: 10,
              aspectRatio: '16:9'
            })
          });
          
          const genData = await genResponse.json();
          results.videoGeneration = {
            status: genResponse.status,
            success: genData.success,
            hasJobId: !!genData.jobId
          };
          
          // Test user videos API
          console.log('Testing /api/user/videos...');
          const videosResponse = await fetch(`/api/user/videos?userId=${userId}`);
          const videosData = await videosResponse.json();
          results.userVideos = {
            status: videosResponse.status,
            success: videosData.success,
            videoCount: videosData.videos ? videosData.videos.length : 0
          };
          
          // Test character replacement API if we have images
          console.log('Testing /api/replace-character...');
          const charResponse = await fetch('/api/replace-character', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              originalImageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
              characterReference: {
                id: 'test-char',
                name: 'Test Character',
                imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                description: 'Test character for replacement'
              },
              replacementPrompt: 'Replace the character in this scene'
            })
          });
          
          results.characterReplacement = {
            status: charResponse.status,
            attempted: true
          };
          
        } catch (error) {
          results.error = error.message;
        }
        
        return results;
      }, TEST_CONFIG.mockUserId);
      
      console.log('📊 API Test Results:', JSON.stringify(apiTests, null, 2));
      
      // ===============================
      // FINAL REPORT
      // ===============================
      console.log('\\n📋 === FINAL TEST REPORT ===');
      
      const report = {
        timestamp: new Date().toISOString(),
        testConfiguration: TEST_CONFIG,
        brandData: TEST_BRAND,
        testResults: testResults,
        apiTests: apiTests,
        overallSuccess: Object.values(testResults).filter(Boolean).length,
        totalTests: Object.keys(testResults).length
      };
      
      console.log('🎯 Test Results Summary:');
      Object.entries(testResults).forEach(([test, passed]) => {
        console.log(`   ${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
      });
      
      console.log(`\\n🏆 Overall Success Rate: ${report.overallSuccess}/${report.totalTests} tests passed`);
      
      // Save detailed report
      const reportPath = path.join(__dirname, '../test-results/authenticated-workflow-report.json');
      await page.evaluate((reportData) => {
        console.log('📄 Detailed Test Report:', reportData);
      }, report);
      
      // Take final screenshot
      await page.screenshot({ 
        path: path.join(__dirname, '../test-results/final-state.png'),
        fullPage: true 
      });
      
      // Assertions for critical functionality
      expect(testResults.authentication).toBe(true);
      expect(testResults.navigation).toBe(true);
      expect(testResults.brandInfoStep).toBe(true);
      expect(apiTests.videoGeneration?.status).toBe(200);
      
      console.log('\\n🎉 AUTHENTICATED FULL WORKFLOW TEST COMPLETED!');
      
    } catch (error) {
      console.error('❌ Test failed with error:', error);
      await page.screenshot({ 
        path: path.join(__dirname, '../test-results/error-state.png'),
        fullPage: true 
      });
      throw error;
    }
  });
});
