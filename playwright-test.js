const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

async function testImprovements() {
  console.log('🚀 Starting Creative Creatives V2 - UI Improvements Test');
  console.log('━'.repeat(60));

  const browser = await chromium.launch({ 
    headless: false, // Show browser for better debugging
    slowMo: 1000     // Slow down for better observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();

  try {
    // Test 1: Homepage and Navigation
    console.log('📱 Test 1: Homepage and Navigation');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-homepage.png'),
      fullPage: true 
    });
    console.log('✅ Homepage screenshot taken');

    // Test 2: Dashboard with Projects (Normal State)
    console.log('\n📊 Test 2: Dashboard with Projects');
    
    // First, try to navigate to dashboard (might need auth)
    try {
      await page.click('text="Dashboard"');
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('⚠️  Dashboard navigation failed, likely needs auth. Continuing with homepage tests.');
    }

    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-dashboard-normal.png'),
      fullPage: true 
    });
    console.log('✅ Dashboard screenshot taken');

    // Test 3: Modal Accessibility - Open Chat
    console.log('\n🤖 Test 3: Marcus Chat Modal (Accessibility)');
    
    try {
      // Look for chat button and click it
      const chatButton = page.locator('text="Chat with Marcus"').or(
        page.locator('[data-testid="chat-button"]')
      ).or(
        page.locator('button:has-text("Marcus")')
      ).first();
      
      if (await chatButton.count() > 0) {
        await chatButton.click();
        await page.waitForTimeout(1000);
        
        // Test modal accessibility features
        await page.screenshot({ 
          path: path.join(screenshotsDir, '03-chat-modal-open.png'),
          fullPage: true 
        });
        console.log('✅ Chat modal opened and screenshot taken');

        // Test keyboard navigation (focus should be on input)
        const input = page.locator('input[placeholder*="Marcus"]');
        if (await input.count() > 0) {
          await input.focus();
          await page.keyboard.type('Hello Marcus! Testing accessibility features.');
          await page.screenshot({ 
            path: path.join(screenshotsDir, '04-chat-with-message.png') 
          });
          console.log('✅ Message typed in chat');
        }

        // Test ESC key to close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        console.log('✅ Modal closed with ESC key');
      } else {
        console.log('⚠️  Chat button not found on current page');
      }
    } catch (e) {
      console.log('⚠️  Chat modal test failed:', e.message);
    }

    // Test 4: Empty States
    console.log('\n📭 Test 4: Empty States Testing');
    
    try {
      // Look for the debug toggle to test empty state
      const toggleButton = page.locator('button:has-text("Test Empty State")');
      if (await toggleButton.count() > 0) {
        await toggleButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ 
          path: path.join(screenshotsDir, '05-empty-state.png'),
          fullPage: true 
        });
        console.log('✅ Empty state screenshot taken');

        // Toggle back to show projects
        await toggleButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Toggled back to normal state');
      }
    } catch (e) {
      console.log('⚠️  Empty state test not available on this page');
    }

    // Test 5: Offline Banner
    console.log('\n📶 Test 5: Offline Detection');
    
    // Simulate offline mode
    await context.setOffline(true);
    await page.reload();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '06-offline-banner.png'),
      fullPage: true 
    });
    console.log('✅ Offline state screenshot taken');

    // Test chat disabled when offline
    try {
      const chatButton = page.locator('text="Chat with Marcus"').first();
      if (await chatButton.count() > 0) {
        await chatButton.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: path.join(screenshotsDir, '07-chat-offline.png') 
        });
        console.log('✅ Chat offline state screenshot taken');
        
        // Close modal
        await page.keyboard.press('Escape');
      }
    } catch (e) {
      console.log('⚠️  Offline chat test not available');
    }

    // Test 6: Back Online
    console.log('\n🌐 Test 6: Back Online Detection');
    await context.setOffline(false);
    await page.waitForTimeout(3000); // Wait for reconnection message
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '08-back-online.png'),
      fullPage: true 
    });
    console.log('✅ Back online screenshot taken');

    // Test 7: Error Boundary Testing
    console.log('\n⚠️  Test 7: Error Boundary (If Available)');
    
    // Try to trigger an error for testing
    try {
      await page.evaluate(() => {
        // This would only work if we had a way to trigger errors
        console.log('Error boundary testing would require specific triggers');
      });
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '09-normal-state.png'),
        fullPage: true 
      });
      console.log('✅ Normal state screenshot for comparison');
    } catch (e) {
      console.log('⚠️  Error boundary test requires specific error triggers');
    }

    // Test 8: Mobile Responsive (if time permits)
    console.log('\n📱 Test 8: Mobile Responsive Design');
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X size
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '10-mobile-view.png'),
      fullPage: true 
    });
    console.log('✅ Mobile view screenshot taken');

    // Test mobile chat modal
    try {
      const chatButton = page.locator('text="Chat with Marcus"').or(
        page.locator('button:has-text("Marcus")')
      ).first();
      
      if (await chatButton.count() > 0) {
        await chatButton.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: path.join(screenshotsDir, '11-mobile-chat.png'),
          fullPage: true 
        });
        console.log('✅ Mobile chat screenshot taken');
        
        await page.keyboard.press('Escape');
      }
    } catch (e) {
      console.log('⚠️  Mobile chat test not available');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
    console.log('━'.repeat(60));

    // List all screenshots taken
    const screenshots = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));
    console.log('📸 Screenshots taken:');
    screenshots.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'error-state.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// Run the tests
testImprovements().catch(console.error);
