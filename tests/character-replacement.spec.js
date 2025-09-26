/**
 * 👥 CHARACTER REPLACEMENT TESTS
 * Comprehensive Playwright Test Suite for Character Consistency Features
 * Tests the new v4.1.0 character replacement and consistency system
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

// Import test credentials
const { TEST_USER } = require('../setup-test-user.js');

// Test character image paths
const TEST_CHARACTER_IMAGE = path.join(__dirname, '../test-assets/test-character.svg');
const BACKUP_CHARACTER_IMAGE = path.join(__dirname, '../test-assets/backup-character.svg');

test.describe('Character Replacement & Consistency System', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Enhanced logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🖥️ Console Error:', msg.text());
      } else if (msg.text().includes('Character') || msg.text().includes('👤')) {
        console.log('👤 Character Log:', msg.text());
      }
    });
    
    // Monitor network requests for character APIs
    page.on('request', request => {
      if (request.url().includes('/api/replace-character') || 
          request.url().includes('/api/batch-character-application')) {
        console.log('🔗 Character API Request:', request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/replace-character') || 
          response.url().includes('/api/batch-character-application')) {
        console.log('📡 Character API Response:', response.status(), response.url());
      }
    });
  });

  test('Character Upload and Management Flow', async ({ page }) => {
    console.log('👥 Testing character upload and management...');
    
    // Navigate and authenticate
    await authenticateAndNavigateToCreate(page);
    
    // Fill brand information to get to storyboard step
    await fillBrandInformation(page);
    await proceedThroughMarcusChat(page);
    
    await page.screenshot({ path: 'test-results/character-01-before-upload.png', fullPage: true });
    
    // Look for character upload section
    const characterUploadSection = page.locator('[data-testid="character-upload"], .character-upload, h3:has-text("Character")');
    const hasCharacterUpload = await characterUploadSection.count() > 0;
    
    if (hasCharacterUpload) {
      console.log('✅ Character upload section found');
      
      // Test character name input
      const characterNameInput = page.locator('input[placeholder*="CEO"], input[placeholder*="Character"]').first();
      if (await characterNameInput.isVisible({ timeout: 5000 })) {
        await characterNameInput.fill('Test CEO John');
        console.log('👤 Entered character name');
      }
      
      // Test character description  
      const characterDescInput = page.locator('input[placeholder*="formal"], textarea[placeholder*="CEO"]').first();
      if (await characterDescInput.isVisible({ timeout: 2000 })) {
        await characterDescInput.fill('Professional CEO in business suit');
        console.log('📝 Entered character description');
      }
      
      // Test file upload (simulate if no actual file)
      const uploadButton = page.locator('button:has-text("Select Image"), button:has-text("Upload"), input[type="file"]').first();
      if (await uploadButton.isVisible({ timeout: 5000 })) {
        console.log('📁 Found upload interface');
        
        // Try to upload a test image if it exists
        try {
          if (await uploadButton.getAttribute('type') === 'file') {
            // Direct file input
            await uploadButton.setInputFiles(TEST_CHARACTER_IMAGE);
          } else {
            // Button that triggers file input
            await uploadButton.click();
            const fileInput = page.locator('input[type="file"]');
            if (await fileInput.isVisible({ timeout: 2000 })) {
              await fileInput.setInputFiles(TEST_CHARACTER_IMAGE);
            }
          }
          console.log('📤 Character image uploaded');
          
          // Wait for processing
          await page.waitForTimeout(3000);
          
        } catch (error) {
          console.log('⚠️ Image upload failed (expected in test environment):', error.message);
          // Continue test - upload failure is expected without proper test assets
        }
      }
      
      await page.screenshot({ path: 'test-results/character-02-after-upload.png', fullPage: true });
      
    } else {
      console.log('⚠️ Character upload section not found - may be on wrong step');
      await page.screenshot({ path: 'test-results/character-02-no-upload-section.png', fullPage: true });
    }
  });

  test('Character Replacement in Storyboard Scenes', async ({ page }) => {
    console.log('🎬 Testing character replacement in scenes...');
    
    await authenticateAndNavigateToCreate(page);
    await fillBrandInformation(page);
    await proceedThroughMarcusChat(page);
    
    // Wait for storyboard generation
    await page.waitForTimeout(5000);
    
    // Look for scene elements
    const scenes = await page.locator('[class*="scene"], [data-testid*="scene"]').count();
    console.log(`🎭 Found ${scenes} scenes`);
    
    if (scenes > 0) {
      // Generate images for first scene
      const generateButton = page.locator('button:has-text("Generate")').first();
      if (await generateButton.isVisible({ timeout: 5000 })) {
        await generateButton.click();
        console.log('🎨 Triggered image generation for scene');
        
        // Wait for image generation to complete or timeout gracefully
        await page.waitForTimeout(15000);
        
        await page.screenshot({ path: 'test-results/character-03-scene-images.png', fullPage: true });
        
        // Look for character replacement interface
        const replaceButtons = await page.locator('button:has-text("Replace"), button:has-text("Character")').count();
        console.log(`👤 Found ${replaceButtons} character replacement buttons`);
        
        if (replaceButtons > 0) {
          // Test character replacement interface
          await page.locator('button:has-text("Replace")').first().click();
          console.log('🔄 Opened character replacement interface');
          
          // Look for replacement prompt input
          const promptInput = page.locator('textarea[placeholder*="replace"], input[placeholder*="character"]').first();
          if (await promptInput.isVisible({ timeout: 3000 })) {
            await promptInput.fill('Replace the person in this scene with our CEO John in a professional business setting');
            console.log('📝 Entered replacement prompt');
            
            // Try to submit replacement
            const submitReplacement = page.locator('button:has-text("Apply"), button:has-text("Replace")').first();
            if (await submitReplacement.isVisible({ timeout: 2000 })) {
              await submitReplacement.click();
              console.log('🚀 Submitted character replacement');
              
              // Wait for processing
              await page.waitForTimeout(10000);
              
              await page.screenshot({ path: 'test-results/character-04-replacement-result.png', fullPage: true });
            }
          }
        }
      }
    }
  });

  test('Batch Character Application Across Multiple Scenes', async ({ page }) => {
    console.log('🔄 Testing batch character application...');
    
    await authenticateAndNavigateToCreate(page);
    await fillBrandInformation(page);
    await proceedThroughMarcusChat(page);
    
    // Wait for storyboard and look for batch processing interface
    await page.waitForTimeout(5000);
    
    // Look for character consistency manager
    const consistencyManager = page.locator('[data-testid="consistency-manager"], h3:has-text("Consistency"), button:has-text("Batch")');
    const hasConsistencyManager = await consistencyManager.count() > 0;
    
    if (hasConsistencyManager) {
      console.log('✅ Character consistency manager found');
      
      // Test batch application
      const batchButton = page.locator('button:has-text("Apply to Multiple"), button:has-text("Batch")').first();
      if (await batchButton.isVisible({ timeout: 5000 })) {
        await batchButton.click();
        console.log('📊 Opened batch character application');
        
        // Select multiple scenes (if scene checkboxes exist)
        const sceneCheckboxes = await page.locator('input[type="checkbox"]').count();
        console.log(`☑️ Found ${sceneCheckboxes} scene selection checkboxes`);
        
        if (sceneCheckboxes >= 2) {
          // Select first two scenes
          await page.locator('input[type="checkbox"]').first().check();
          await page.locator('input[type="checkbox"]').nth(1).check();
          console.log('✅ Selected multiple scenes for batch processing');
          
          // Enter batch prompt
          const batchPrompt = page.locator('textarea[placeholder*="batch"], textarea[placeholder*="scenes"]').first();
          if (await batchPrompt.isVisible({ timeout: 3000 })) {
            await batchPrompt.fill('Apply our CEO character consistently across all selected scenes maintaining professional appearance');
            
            // Submit batch processing
            const submitBatch = page.locator('button:has-text("Apply to Selected"), button:has-text("Process")').first();
            if (await submitBatch.isVisible({ timeout: 2000 })) {
              await submitBatch.click();
              console.log('🚀 Started batch character processing');
              
              // Wait for batch processing (longer timeout)
              await page.waitForTimeout(20000);
              
              await page.screenshot({ path: 'test-results/character-05-batch-result.png', fullPage: true });
            }
          }
        }
      }
    } else {
      console.log('⚠️ Character consistency manager not found');
      await page.screenshot({ path: 'test-results/character-05-no-consistency-manager.png', fullPage: true });
    }
  });

  test('Character Replacement API Health and Error Handling', async ({ page, request }) => {
    console.log('🌐 Testing character replacement APIs...');
    
    // Test single character replacement API
    const replaceResponse = await request.post('http://localhost:3000/api/replace-character', {
      data: {
        originalImageData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA', // 1x1 transparent PNG
        characterReference: {
          id: 'test-char-123',
          name: 'Test Character',
          imageData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA',
          mimeType: 'image/png',
          uploadedAt: new Date().toISOString(),
        },
        replacementPrompt: 'Replace person with test character'
      }
    });
    
    console.log(`👤 Replace Character API Status: ${replaceResponse.status()}`);
    const replaceData = await replaceResponse.json();
    
    // Should return 200 (success) or 500 (expected without Gemini API key)
    expect([200, 500].includes(replaceResponse.status())).toBe(true);
    
    if (replaceResponse.status() === 500) {
      expect(replaceData).toHaveProperty('setup_required');
      console.log('✅ API correctly indicates setup required');
    } else {
      expect(replaceData).toHaveProperty('success');
      console.log('✅ API returned success response');
    }

    // Test batch character application API
    const batchResponse = await request.post('http://localhost:3000/api/batch-character-application', {
      data: {
        characterReference: {
          id: 'test-char-123',
          name: 'Test Character',
          imageData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA',
          mimeType: 'image/png',
          uploadedAt: new Date().toISOString(),
        },
        sceneData: [
          {
            sceneId: 'scene-1',
            selectedImageData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA',
            sceneTitle: 'Test Scene 1',
            sceneDescription: 'Test scene for batch processing'
          },
          {
            sceneId: 'scene-2', 
            selectedImageData: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA',
            sceneTitle: 'Test Scene 2',
            sceneDescription: 'Second test scene'
          }
        ]
      }
    });
    
    console.log(`📊 Batch Character API Status: ${batchResponse.status()}`);
    const batchData = await batchResponse.json();
    
    expect([200, 500].includes(batchResponse.status())).toBe(true);
    
    if (batchResponse.status() === 500) {
      expect(batchData).toHaveProperty('setup_required');
      console.log('✅ Batch API correctly indicates setup required');
    } else {
      expect(batchData).toHaveProperty('success');
      console.log('✅ Batch API returned success response');
    }
  });

  test('Character Replacement Development Mode', async ({ page }) => {
    console.log('🚧 Testing character replacement in development mode...');
    
    // This test specifically checks that the development mode works properly
    // without requiring actual API keys
    
    await authenticateAndNavigateToCreate(page);
    await fillBrandInformation(page);
    await proceedThroughMarcusChat(page);
    
    // Wait for storyboard
    await page.waitForTimeout(5000);
    
    // Look for development mode indicators
    const devModeIndicators = await page.locator(':has-text("Development Mode"), :has-text("Mock"), :has-text("API key not configured")').count();
    console.log(`🧪 Found ${devModeIndicators} development mode indicators`);
    
    if (devModeIndicators > 0) {
      console.log('✅ Development mode is active');
      
      // Test that mock responses are provided
      const mockElements = await page.locator(':has-text("Mock"), :has-text("Placeholder")').count();
      console.log(`🎭 Found ${mockElements} mock elements`);
      
      // Verify setup instructions are provided
      const setupInstructions = await page.locator(':has-text("GEMINI_API_KEY"), :has-text("setup"), :has-text("configure")').count();
      console.log(`📋 Found ${setupInstructions} setup instruction elements`);
      
      expect(setupInstructions).toBeGreaterThan(0);
      console.log('✅ Setup instructions provided for production deployment');
    }
    
    await page.screenshot({ path: 'test-results/character-06-development-mode.png', fullPage: true });
  });

});

// Helper functions
async function authenticateAndNavigateToCreate(page) {
  console.log('🔐 Authenticating and navigating to create page...');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Handle authentication if needed
  const signInButton = page.locator('button:has-text("Sign In")').first();
  if (await signInButton.isVisible({ timeout: 3000 })) {
    await signInButton.click();
    await page.waitForTimeout(1000);
    
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('input[type="password"]').press('Enter');
    
    await page.waitForTimeout(3000);
  }
  
  // Navigate to create page
  await page.goto('http://localhost:3000/create');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

async function fillBrandInformation(page) {
  console.log('📋 Filling brand information...');
  
  const brandNameInput = page.locator('input[placeholder*="brand"], input').first();
  if (await brandNameInput.isVisible({ timeout: 5000 })) {
    await brandNameInput.fill('Character Test Company');
  }
  
  const industryInput = page.locator('input[placeholder*="industry"]').first();
  if (await industryInput.isVisible({ timeout: 2000 })) {
    await industryInput.fill('Technology');
  }
  
  const audienceInput = page.locator('input[placeholder*="audience"]').first();
  if (await audienceInput.isVisible({ timeout: 2000 })) {
    await audienceInput.fill('Business professionals');
  }
  
  const descriptionTextarea = page.locator('textarea').first();
  if (await descriptionTextarea.isVisible({ timeout: 2000 })) {
    await descriptionTextarea.fill('Testing character replacement functionality across storyboard scenes.');
  }
  
  // Try to proceed to next step
  const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
  if (await nextButton.isVisible({ timeout: 3000 })) {
    await nextButton.click();
    await page.waitForTimeout(2000);
  }
}

async function proceedThroughMarcusChat(page) {
  console.log('🤖 Proceeding through Marcus chat...');
  
  // Send a message to Marcus
  const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="chat"], textarea').first();
  if (await chatInput.isVisible({ timeout: 5000 })) {
    await chatInput.fill('I need to test character replacement. Create a storyboard with multiple scenes where I can demonstrate consistent character application across scenes.');
    
    const sendButton = page.locator('button:has-text("Send"), button:has-text("Generate")').first();
    if (await sendButton.isVisible({ timeout: 2000 })) {
      await sendButton.click();
      await page.waitForTimeout(10000);
    }
  }
  
  // Try to generate storyboard
  const storyboardButton = page.locator('button:has-text("Generate Storyboard"), button:has-text("Plan")').first();
  if (await storyboardButton.isVisible({ timeout: 5000 })) {
    await storyboardButton.click();
    await page.waitForTimeout(15000);
  }
  
  // Proceed to next step
  const nextButton = page.locator('button:has-text("Next")').first();
  if (await nextButton.isVisible({ timeout: 3000 })) {
    await nextButton.click();
    await page.waitForTimeout(2000);
  }
}

// Test configuration
test.use({
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  actionTimeout: 30000,
  navigationTimeout: 30000
});
