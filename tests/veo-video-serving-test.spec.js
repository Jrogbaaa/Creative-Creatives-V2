/**
 * 🎥 VEO VIDEO SERVING TEST - VISUAL DEBUGGING
 * 
 * This test focuses specifically on the video serving issue the user identified:
 * "The finished video is not being served"
 * 
 * Test approach:
 * 1. Direct API calls to generate video
 * 2. Monitor video status and storage
 * 3. Test video retrieval from gallery
 * 4. Visual verification through browser testing
 * 5. Network monitoring for video serving endpoints
 */

const { test, expect } = require('@playwright/test');

test.describe('VEO Video Serving Investigation', () => {
  
  test('Direct API + UI Video Serving Verification', async ({ page }) => {
    console.log('🎥 Starting VEO video serving investigation...');
    test.setTimeout(300000); // 5 minutes

    // Step 1: Direct API call to generate video
    console.log('📡 Step 1: Direct API video generation...');
    
    const videoGenRequest = {
      prompt: 'Professional business person in modern office, confident and friendly',
      duration: 15,
      aspectRatio: '16:9',
      resolution: '720p',
      personGeneration: 'allow_adult',
      enhancePrompt: true,
      generateAudio: false
    };

    let videoJobId = null;
    let videoGenerationResponse = null;

    try {
      const apiResponse = await page.request.post('http://localhost:3000/api/generate-video', {
        data: videoGenRequest,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`📊 API Response Status: ${apiResponse.status()}`);
      
      if (apiResponse.ok()) {
        videoGenerationResponse = await apiResponse.json();
        videoJobId = videoGenerationResponse.jobId;
        console.log(`✅ Video generation started. Job ID: ${videoJobId}`);
        console.log('📋 Full response:', JSON.stringify(videoGenerationResponse, null, 2));
      } else {
        const errorText = await apiResponse.text();
        console.log('❌ Video generation failed:', errorText);
        
        // Take screenshot of any error page
        await page.goto('http://localhost:3000');
        await page.screenshot({ path: 'test-results/veo-01-api-error-context.png', fullPage: true });
      }
    } catch (error) {
      console.log('❌ API call failed:', error.message);
    }

    // Step 2: Monitor video status if we have a job ID
    if (videoJobId) {
      console.log('⏳ Step 2: Monitoring video status...');
      
      let videoComplete = false;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes
      let videoUrl = null;

      while (!videoComplete && attempts < maxAttempts) {
        attempts++;
        console.log(`🔄 Status check attempt ${attempts}/${maxAttempts}`);

        try {
          const statusResponse = await page.request.get(`http://localhost:3000/api/video-status/${videoJobId}`);
          
          if (statusResponse.ok()) {
            const statusData = await statusResponse.json();
            console.log(`📊 Status: ${statusData.status}`);
            
            if (statusData.status === 'SUCCEEDED' || statusData.status === 'completed') {
              videoComplete = true;
              videoUrl = statusData.videoUrl || statusData.downloadUrl;
              console.log(`✅ Video generation completed! URL: ${videoUrl}`);
              break;
            } else if (statusData.status === 'FAILED' || statusData.status === 'error') {
              console.log('❌ Video generation failed:', statusData.error || 'Unknown error');
              break;
            } else {
              console.log(`⏳ Still processing... Status: ${statusData.status}`);
            }
          } else {
            const errorText = await statusResponse.text();
            console.log('❌ Status check failed:', errorText);
          }
        } catch (error) {
          console.log('❌ Status check error:', error.message);
        }

        await page.waitForTimeout(5000); // Wait 5 seconds between checks
      }
    }

    // Step 3: Test gallery page for video visibility
    console.log('🖼️  Step 3: Testing gallery for video serving...');
    
    await page.goto('http://localhost:3000/gallery');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/veo-02-gallery-page.png', fullPage: true });
    
    // Wait for any dynamic content to load
    await page.waitForTimeout(3000);
    
    // Check for videos in various possible formats
    const videoSelectors = [
      'video',
      '[data-testid*="video"]',
      '.video',
      '.video-card',
      '.video-thumbnail',
      '[src*=".mp4"]',
      '[src*="video"]',
      '[href*=".mp4"]',
      '[href*="video"]'
    ];

    let videosFound = false;
    for (const selector of videoSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`✅ Found ${count} video element(s) with selector: ${selector}`);
        videosFound = true;
        
        // Take screenshot of videos found
        await page.screenshot({ path: `test-results/veo-03-videos-found-${selector.replace(/[^a-zA-Z0-9]/g, '_')}.png`, fullPage: true });
        
        // Try to get video URLs
        for (let i = 0; i < Math.min(count, 3); i++) {
          const element = elements.nth(i);
          const src = await element.getAttribute('src');
          const href = await element.getAttribute('href');
          const dataUrl = await element.getAttribute('data-url');
          
          console.log(`📹 Video ${i + 1}:`);
          console.log(`   src: ${src}`);
          console.log(`   href: ${href}`);
          console.log(`   data-url: ${dataUrl}`);
        }
        break;
      }
    }

    if (!videosFound) {
      console.log('❌ No video elements found in gallery');
      
      // Check page content for debugging
      const pageContent = await page.textContent('body');
      console.log('📄 Page contains text:', pageContent.substring(0, 500));
      
      // Check for any error messages
      const errorMessages = page.locator('.error, [data-testid*="error"], .alert');
      const errorCount = await errorMessages.count();
      if (errorCount > 0) {
        console.log(`⚠️  Found ${errorCount} error message(s):`);
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorMessages.nth(i).textContent();
          console.log(`   Error ${i + 1}: ${errorText}`);
        }
      }
    }

    // Step 4: Test user videos API directly
    console.log('📡 Step 4: Testing user videos API endpoint...');
    
    try {
      const userVideosResponse = await page.request.get('http://localhost:3000/api/user/videos');
      console.log(`📊 User videos API status: ${userVideosResponse.status()}`);
      
      if (userVideosResponse.ok()) {
        const userVideos = await userVideosResponse.json();
        console.log('📹 User videos response:', JSON.stringify(userVideos, null, 2));
        
        if (userVideos.videos && userVideos.videos.length > 0) {
          console.log(`✅ Found ${userVideos.videos.length} video(s) in API response`);
          
          // Test direct video URL access
          for (let i = 0; i < Math.min(userVideos.videos.length, 3); i++) {
            const video = userVideos.videos[i];
            console.log(`🎥 Testing video ${i + 1}:`);
            console.log(`   ID: ${video.id}`);
            console.log(`   URL: ${video.videoUrl || video.url || 'Not provided'}`);
            console.log(`   Status: ${video.status}`);
            console.log(`   Created: ${video.createdAt}`);
            
            // If video URL exists, try to access it directly
            if (video.videoUrl || video.url) {
              const videoUrl = video.videoUrl || video.url;
              try {
                await page.goto(videoUrl);
                await page.screenshot({ path: `test-results/veo-04-direct-video-${i + 1}.png` });
                console.log(`✅ Video ${i + 1} URL accessible`);
              } catch (error) {
                console.log(`❌ Video ${i + 1} URL not accessible: ${error.message}`);
              }
            }
          }
        } else {
          console.log('❌ No videos found in user videos API response');
        }
      } else {
        const errorText = await userVideosResponse.text();
        console.log('❌ User videos API failed:', errorText);
      }
    } catch (error) {
      console.log('❌ User videos API error:', error.message);
    }

    // Step 5: Network monitoring - check for video requests
    console.log('🌐 Step 5: Network monitoring for video requests...');
    
    const videoRequests = [];
    const failedRequests = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('.mp4') || url.includes('video') || url.includes('media')) {
        videoRequests.push({
          url: url,
          status: response.status(),
          ok: response.ok()
        });
        console.log(`🎞️  Video request: ${response.status()} ${url}`);
      }
      
      if (!response.ok()) {
        failedRequests.push({
          url: url,
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    // Refresh gallery to trigger network requests
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Final screenshots and reporting
    await page.screenshot({ path: 'test-results/veo-05-final-gallery-state.png', fullPage: true });
    
    console.log('📊 Network Analysis:');
    console.log(`   Video requests: ${videoRequests.length}`);
    console.log(`   Failed requests: ${failedRequests.length}`);
    
    if (videoRequests.length > 0) {
      console.log('🎞️  Video requests found:');
      videoRequests.forEach((req, index) => {
        console.log(`   ${index + 1}. ${req.status} - ${req.url}`);
      });
    }
    
    if (failedRequests.length > 0) {
      console.log('❌ Failed requests:');
      failedRequests.forEach((req, index) => {
        console.log(`   ${index + 1}. ${req.status} ${req.statusText} - ${req.url}`);
      });
    }

    // Generate final report
    const report = {
      timestamp: new Date().toISOString(),
      videoGenerationAttempted: !!videoJobId,
      videoJobId: videoJobId,
      videoGenerationResponse: videoGenerationResponse,
      videosFoundInUI: videosFound,
      videoRequests: videoRequests,
      failedRequests: failedRequests,
      screenshots: [
        'veo-01-api-error-context.png',
        'veo-02-gallery-page.png',
        'veo-03-videos-found.png',
        'veo-04-direct-video.png',
        'veo-05-final-gallery-state.png'
      ]
    };

    // Save detailed report
    const fs = require('fs');
    fs.writeFileSync('test-results/veo-video-serving-investigation.json', JSON.stringify(report, null, 2));
    console.log('📋 Detailed investigation report saved');

    console.log('🎥 VEO video serving investigation completed!');
  });
});
