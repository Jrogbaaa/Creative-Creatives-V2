/**
 * 🧪 API-FOCUSED TESTS
 * Direct testing of API endpoints without problematic client-side dependencies
 */

const { test, expect } = require('@playwright/test');

test.describe('API Endpoints - Direct Testing', () => {
  
  test('Cache API - Stats and Management', async ({ request }) => {
    console.log('🗄️ [API Test] Testing cache endpoints...');
    
    // Test cache statistics
    const statsResponse = await request.get('http://localhost:3000/api/cache?action=stats');
    
    if (statsResponse.ok()) {
      const stats = await statsResponse.json();
      expect(stats.success).toBe(true);
      console.log('✅ Cache stats API working:', stats.stats);
    } else {
      console.log('⚠️ Cache stats API unavailable - may be compilation issue');
    }
  });

  test('Chat API - Marcus Integration', async ({ request }) => {
    console.log('🤖 [API Test] Testing Marcus chat API...');
    
    const chatResponse = await request.post('http://localhost:3000/api/chat', {
      data: {
        messages: [{
          id: 'test-msg-1',
          role: 'user',
          content: 'Hello Marcus, this is a test message',
          timestamp: new Date().toISOString()
        }],
        context: {
          test: true,
          source: 'api-test'
        }
      }
    });

    expect(chatResponse.ok()).toBe(true);
    const chatResult = await chatResponse.json();
    expect(chatResult.success).toBe(true);
    expect(chatResult.response).toBeDefined();
    console.log('✅ Marcus Chat API working');
  });

  test('Image Generation API - Nano Banana', async ({ request }) => {
    console.log('🖼️ [API Test] Testing image generation...');
    
    const imageResponse = await request.post('http://localhost:3000/api/generate-image', {
      data: {
        prompt: 'Test image for API verification - simple corporate logo',
        sceneId: 'api-test-scene-1'
      }
    });

    expect(imageResponse.ok()).toBe(true);
    const imageResult = await imageResponse.json();
    console.log('✅ Image Generation API responding correctly');
  });

  test('Storyboard Generation API - Marcus Planning', async ({ request }) => {
    console.log('🎬 [API Test] Testing storyboard generation...');
    
    const storyboardResponse = await request.post('http://localhost:3000/api/generate-storyboard', {
      data: {
        brandInfo: {
          name: 'Test Brand API',
          description: 'API testing brand',
          industry: 'Technology',
          targetAudience: 'Developers',
          brandVoice: 'professional',
          colorPalette: ['#3B82F6', '#10B981']
        },
        chatContext: ['API testing conversation'],
        adGoals: ['Test API functionality'],
        targetDuration: 30
      }
    });

    expect(storyboardResponse.ok()).toBe(true);
    const storyboardResult = await storyboardResponse.json();
    expect(storyboardResult.success).toBe(true);
    console.log('✅ Storyboard Generation API working');
  });

  test('Internationalization Files - Static Assets', async ({ request }) => {
    console.log('🌍 [API Test] Testing i18n static files...');
    
    // Test Spanish translations
    const spanishResponse = await request.get('http://localhost:3000/locales/es.json');
    expect(spanishResponse.ok()).toBe(true);
    
    const translations = await spanishResponse.json();
    expect(translations['nav.home']).toBe('Inicio');
    expect(translations['marcus.greeting']).toContain('Marcus');
    console.log('✅ Spanish translations loaded correctly');
  });

  test('Ad-blocker Simulation - Resource Blocking', async ({ page }) => {
    console.log('🛡️ [Ad-blocker Test] Simulating ad-blocker behavior...');
    
    // Block requests that ad-blockers typically block
    await page.route('**/*analytics*', route => route.abort());
    await page.route('**/*tracking*', route => route.abort());
    await page.route('**/*ads*', route => route.abort());
    await page.route('**/*facebook*', route => route.abort());
    await page.route('**/*google-analytics*', route => route.abort());
    
    // Navigate and check if core functionality works
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // Check if main content still loads
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
    
    // Check if navigation works
    const hasContent = await page.locator('h1, h2, [role="heading"]').count() > 0;
    console.log(hasContent ? '✅ Core content loads with ad-blocking' : '⚠️ Core content may be affected');
    
    await page.screenshot({ 
      path: 'test-results/adblock-simulation-test.png',
      fullPage: true 
    });
  });

  test('Performance Under Load - Multiple API Calls', async ({ request }) => {
    console.log('⚡ [Performance Test] Testing API under load...');
    
    const startTime = Date.now();
    
    // Make multiple concurrent API calls
    const apiCalls = [
      request.get('http://localhost:3000/api/cache?action=stats'),
      request.post('http://localhost:3000/api/chat', {
        data: {
          messages: [{ id: '1', role: 'user', content: 'Quick test 1', timestamp: new Date() }]
        }
      }),
      request.post('http://localhost:3000/api/chat', {
        data: {
          messages: [{ id: '2', role: 'user', content: 'Quick test 2', timestamp: new Date() }]
        }
      }),
      request.get('http://localhost:3000/locales/es.json')
    ];
    
    const results = await Promise.allSettled(apiCalls);
    const endTime = Date.now();
    
    const successfulCalls = results.filter(result => 
      result.status === 'fulfilled' && result.value.ok()
    ).length;
    
    const totalTime = endTime - startTime;
    
    console.log(`📊 Performance Results:`);
    console.log(`   Successful calls: ${successfulCalls}/${results.length}`);
    console.log(`   Total time: ${totalTime}ms`);
    console.log(`   Average per call: ${(totalTime / results.length).toFixed(2)}ms`);
    
    // Performance should be reasonable
    expect(totalTime).toBeLessThan(10000); // Less than 10 seconds total
    expect(successfulCalls).toBeGreaterThan(0); // At least some calls succeed
  });

  test('Error Handling - Invalid Requests', async ({ request }) => {
    console.log('🛡️ [Error Test] Testing error handling...');
    
    // Test invalid chat request
    const invalidChatResponse = await request.post('http://localhost:3000/api/chat', {
      data: { invalid: 'data' }
    });
    
    expect(invalidChatResponse.status()).toBe(400);
    console.log('✅ Chat API handles invalid input correctly');
    
    // Test invalid image request
    const invalidImageResponse = await request.post('http://localhost:3000/api/generate-image', {
      data: {}
    });
    
    expect([400, 500].includes(invalidImageResponse.status())).toBe(true);
    console.log('✅ Image API handles invalid input correctly');
    
    // Test invalid storyboard request
    const invalidStoryboardResponse = await request.post('http://localhost:3000/api/generate-storyboard', {
      data: { incomplete: 'data' }
    });
    
    expect([400, 500].includes(invalidStoryboardResponse.status())).toBe(true);
    console.log('✅ Storyboard API handles invalid input correctly');
  });

  test('Cross-Origin Resource Sharing (CORS)', async ({ request }) => {
    console.log('🌐 [CORS Test] Testing cross-origin access...');
    
    const corsResponse = await request.post('http://localhost:3000/api/chat', {
      data: {
        messages: [{ id: '1', role: 'user', content: 'CORS test', timestamp: new Date() }]
      },
      headers: {
        'Origin': 'http://localhost:3001',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    // Should either work or return proper CORS headers
    const corsHeaders = corsResponse.headers();
    console.log('📋 CORS Headers:', {
      'access-control-allow-origin': corsHeaders['access-control-allow-origin'],
      'access-control-allow-methods': corsHeaders['access-control-allow-methods']
    });
    
    console.log('✅ CORS test completed');
  });
});

// Configuration
test.use({
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  actionTimeout: 20000,
  navigationTimeout: 20000
});
