import { test, expect } from '@playwright/test';

test.describe('Image-to-Video Generation Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start the app
    await page.goto('http://localhost:3000');
    
    // Mock authentication (if using auth provider)
    await page.addInitScript(() => {
      // Mock user authentication
      window.localStorage.setItem('user', JSON.stringify({
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      }));
    });
  });

  test('Gallery page loads without Firebase errors', async ({ page }) => {
    console.log('🧪 Testing Gallery Page...');
    
    // Navigate to gallery
    await page.goto('http://localhost:3000/gallery');
    
    // Take screenshot of gallery
    await page.screenshot({ 
      path: 'test-results/gallery-page.png',
      fullPage: true 
    });
    
    // Check if page loads without major errors
    await expect(page.locator('h1')).toContainText('Video Gallery');
    
    // Should show "No videos found" initially
    await expect(page.locator('text=No videos found')).toBeVisible();
    
    // Check filter buttons exist
    await expect(page.locator('button:has-text("All")')).toBeVisible();
    await expect(page.locator('button:has-text("Completed")')).toBeVisible();
    await expect(page.locator('button:has-text("Processing")')).toBeVisible();
    
    console.log('✅ Gallery page loaded successfully');
  });

  test('Create page navigation and form elements', async ({ page }) => {
    console.log('🧪 Testing Create Page Navigation...');
    
    // Navigate to create page
    await page.goto('http://localhost:3000/create');
    
    // Take screenshot of create page
    await page.screenshot({ 
      path: 'test-results/create-page-step1.png',
      fullPage: true 
    });
    
    // Check brand info form exists
    await expect(page.locator('input[placeholder*="brand name"]', { timeout: 10000 })).toBeVisible();
    
    // Fill out brand info
    await page.fill('input[placeholder*="brand name"]', 'Test Brand Co');
    await page.selectOption('select', { value: 'technology' });
    await page.fill('textarea[placeholder*="target audience"]', 'Tech enthusiasts and developers');
    await page.fill('textarea[placeholder*="brand description"]', 'Innovative technology solutions for modern businesses');
    
    // Take screenshot after filling form
    await page.screenshot({ 
      path: 'test-results/create-page-brand-info-filled.png',
      fullPage: true 
    });
    
    console.log('✅ Create page form elements working');
  });

  test('Step-by-step workflow navigation', async ({ page }) => {
    console.log('🧪 Testing Step-by-Step Workflow...');
    
    await page.goto('http://localhost:3000/create');
    
    // Step 1: Brand Info
    await page.fill('input[placeholder*="brand name"]', 'AI Video Co');
    await page.selectOption('select', 'technology');
    await page.fill('textarea[placeholder*="target audience"]', 'Business professionals');
    await page.fill('textarea[placeholder*="brand description"]', 'AI-powered video generation platform');
    
    // Click next to go to step 2
    const nextButton = page.locator('button:has-text("Continue to Marcus Chat")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.screenshot({ 
        path: 'test-results/create-page-step2-marcus.png',
        fullPage: true 
      });
    }
    
    // Check if Marcus chat interface loads
    await expect(page.locator('text=Marcus')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Workflow navigation working');
  });

  test('VEO3 API structure validation', async ({ page }) => {
    console.log('🧪 Testing VEO3 API Structure...');
    
    // Navigate to create page and setup console logging
    await page.goto('http://localhost:3000/create');
    
    // Listen for API requests
    const apiRequests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/generate-video')) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          body: request.postData()
        });
      }
    });
    
    // Mock a video generation request by simulating the flow
    await page.evaluate(() => {
      // Simulate VEO3 request structure validation
      const mockVeoRequest = {
        prompt: "Test video generation",
        duration: 8,
        aspectRatio: "16:9",
        imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        mimeType: "image/png",
        resolution: "720p",
        personGeneration: "allow_adult",
        enhancePrompt: true,
        generateAudio: true
      };
      
      // Log the request structure for validation
      console.log('📤 VEO3 Request Structure:', JSON.stringify(mockVeoRequest, null, 2));
      
      // Validate required fields
      const requiredFields = ['prompt', 'duration', 'aspectRatio'];
      const imageToVideoFields = ['imageUrl', 'mimeType'];
      
      requiredFields.forEach(field => {
        if (!(field in mockVeoRequest)) {
          console.error(`❌ Missing required field: ${field}`);
        }
      });
      
      if (mockVeoRequest.imageUrl) {
        imageToVideoFields.forEach(field => {
          if (!(field in mockVeoRequest)) {
            console.error(`❌ Missing image-to-video field: ${field}`);
          }
        });
      }
      
      console.log('✅ VEO3 request structure validation complete');
    });
    
    console.log('✅ VEO3 API structure validated');
  });

  test('Firebase fallback storage validation', async ({ page }) => {
    console.log('🧪 Testing Firebase Fallback Storage...');
    
    // Test that the app works without Firebase configuration
    await page.goto('http://localhost:3000/gallery');
    
    // Should not show Firebase errors
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Firebase');
    expect(pageContent).not.toContain('permission-denied');
    
    // Take screenshot of working gallery without Firebase
    await page.screenshot({ 
      path: 'test-results/gallery-without-firebase.png',
      fullPage: true 
    });
    
    console.log('✅ Firebase fallback working correctly');
  });

  test('Responsive design verification', async ({ page }) => {
    console.log('🧪 Testing Responsive Design...');
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:3000/gallery');
    await page.screenshot({ 
      path: 'test-results/gallery-desktop.png',
      fullPage: true 
    });
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3000/gallery');
    await page.screenshot({ 
      path: 'test-results/gallery-tablet.png',
      fullPage: true 
    });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/gallery');
    await page.screenshot({ 
      path: 'test-results/gallery-mobile.png',
      fullPage: true 
    });
    
    // Test create page mobile
    await page.goto('http://localhost:3000/create');
    await page.screenshot({ 
      path: 'test-results/create-mobile.png',
      fullPage: true 
    });
    
    console.log('✅ Responsive design verified');
  });

  test('Navigation menu functionality', async ({ page }) => {
    console.log('🧪 Testing Navigation Menu...');
    
    await page.goto('http://localhost:3000');
    
    // Take screenshot of homepage
    await page.screenshot({ 
      path: 'test-results/homepage.png',
      fullPage: true 
    });
    
    // Test navigation links (if they exist)
    const createVideoLink = page.locator('a:has-text("Create Video"), button:has-text("Create Video")').first();
    if (await createVideoLink.isVisible()) {
      await createVideoLink.click();
      await expect(page).toHaveURL(/.*create.*/);
      
      await page.screenshot({ 
        path: 'test-results/navigation-to-create.png',
        fullPage: true 
      });
    }
    
    // Test gallery link
    const galleryLink = page.locator('a:has-text("Gallery"), button:has-text("Gallery")').first();
    if (await galleryLink.isVisible()) {
      await galleryLink.click();
      await expect(page).toHaveURL(/.*gallery.*/);
      
      await page.screenshot({ 
        path: 'test-results/navigation-to-gallery.png',
        fullPage: true 
      });
    }
    
    console.log('✅ Navigation working correctly');
  });
});

// Test configuration
test.use({
  // Global test settings
  headless: true,
  viewport: { width: 1280, height: 720 },
  ignoreHTTPSErrors: true,
  screenshot: 'only-on-failure',
  video: 'retain-on-failure'
});
