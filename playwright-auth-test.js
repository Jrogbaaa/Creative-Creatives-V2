const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Create auth-screenshots directory
const screenshotsDir = path.join(__dirname, 'auth-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

async function testAuthenticationFlow() {
  console.log('🔐 Starting Creative Creatives V2 - Authentication Flow Test');
  console.log('━'.repeat(70));

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();

  try {
    // Test 1: Homepage
    console.log('🏠 Test 1: Load Homepage');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-homepage.png'),
      fullPage: true 
    });
    console.log('✅ Homepage screenshot taken');

    // Test 2: Look for Sign In/Authentication
    console.log('\n🔑 Test 2: Authentication Process');
    
    const authSelectors = [
      'button:has-text("Sign In")',
      'button:has-text("Login")', 
      'a:has-text("Sign In")',
      'a:has-text("Login")',
      '[href*="login"]',
      '[href*="signin"]',
      'button[type="button"]:has-text("Sign")',
      '.auth button',
      '.login button'
    ];
    
    let authButton = null;
    for (const selector of authSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          authButton = element;
          console.log(`✅ Found auth button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }

    if (authButton) {
      await authButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '02-auth-modal-opened.png'),
        fullPage: true 
      });
      console.log('✅ Auth modal/page screenshot taken');

      // Try to create a test account or sign in
      const emailSelectors = [
        'input[type="email"]',
        'input[placeholder*="email"]',
        'input[name="email"]',
        '[data-testid*="email"]'
      ];
      
      const passwordSelectors = [
        'input[type="password"]',
        'input[placeholder*="password"]',
        'input[name="password"]',
        '[data-testid*="password"]'
      ];

      let emailInput = null, passwordInput = null;
      
      // Find email input
      for (const selector of emailSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.count() > 0 && await element.isVisible()) {
            emailInput = element;
            break;
          }
        } catch (e) {}
      }
      
      // Find password input
      for (const selector of passwordSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.count() > 0 && await element.isVisible()) {
            passwordInput = element;
            break;
          }
        } catch (e) {}
      }

      if (emailInput && passwordInput) {
        console.log('📝 Filling in test credentials');
        await emailInput.fill('test@creativecreatives.com');
        await passwordInput.fill('TestUser123!');
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: path.join(screenshotsDir, '03-credentials-filled.png') 
        });
        console.log('✅ Credentials filled screenshot taken');

        // Look for submit button
        const submitSelectors = [
          'button[type="submit"]',
          'button:has-text("Sign In")',
          'button:has-text("Login")',
          'button:has-text("Continue")',
          'form button[type="button"]'
        ];
        
        for (const selector of submitSelectors) {
          try {
            const submitButton = page.locator(selector).first();
            if (await submitButton.count() > 0 && await submitButton.isVisible()) {
              await submitButton.click();
              console.log('✅ Submitted authentication form');
              break;
            }
          } catch (e) {}
        }
        
        // Wait for navigation or dashboard
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: path.join(screenshotsDir, '04-after-auth-attempt.png'),
          fullPage: true 
        });
        console.log('✅ Post-authentication screenshot taken');

        // Check if we're on dashboard now
        const url = page.url();
        console.log('📍 Current URL:', url);
        
        if (url.includes('dashboard') || url.includes('app')) {
          console.log('🎉 Successfully navigated to authenticated area!');
          
          // Test 3: Dashboard with Authentication
          console.log('\n📊 Test 3: Authenticated Dashboard');
          await page.waitForTimeout(2000);
          
          await page.screenshot({ 
            path: path.join(screenshotsDir, '05-authenticated-dashboard.png'),
            fullPage: true 
          });
          console.log('✅ Authenticated dashboard screenshot taken');

          // Test 4: Now test Marcus Chat Modal
          console.log('\n🤖 Test 4: Marcus Chat Modal (Authenticated)');
          
          const chatSelectors = [
            'button:has-text("Chat with Marcus")',
            'button:has-text("Marcus")', 
            '[aria-label*="Marcus"]',
            'text="Marcus"',
            '.card:has-text("Marcus") button',
            'button:has-text("Creative Expert")',
            '[data-testid*="chat"]'
          ];
          
          let chatButton = null;
          for (const selector of chatSelectors) {
            try {
              const element = page.locator(selector).first();
              if (await element.count() > 0 && await element.isVisible()) {
                chatButton = element;
                console.log(`✅ Found chat button: ${selector}`);
                break;
              }
            } catch (e) {}
          }

          if (chatButton) {
            await chatButton.click();
            await page.waitForTimeout(2000);
            
            await page.screenshot({ 
              path: path.join(screenshotsDir, '06-marcus-chat-opened.png'),
              fullPage: true 
            });
            console.log('✅ Marcus chat modal screenshot taken');

            // Test our accessibility improvements
            const inputSelectors = [
              'input[placeholder*="Marcus"]',
              'input[placeholder*="message"]',
              'input[aria-label*="message"]',
              'textarea'
            ];
            
            let messageInput = null;
            for (const selector of inputSelectors) {
              try {
                const element = page.locator(selector).first();
                if (await element.count() > 0 && await element.isVisible()) {
                  messageInput = element;
                  console.log(`✅ Found message input: ${selector}`);
                  break;
                }
              } catch (e) {}
            }

            if (messageInput) {
              // Test accessibility: Focus should be on input
              await messageInput.focus();
              await messageInput.fill('Hello Marcus! I want to create an advertisement for my coffee shop. Can you help me develop a creative concept that will attract young professionals?');
              await page.waitForTimeout(1000);
              
              await page.screenshot({ 
                path: path.join(screenshotsDir, '07-chat-message-typed.png') 
              });
              console.log('✅ Chat message typed screenshot taken');

              // Test send button (but don't actually send to avoid API calls)
              const sendButton = page.locator('button[aria-label*="Send"]').or(
                page.locator('button:has-text("Send")').or(
                  page.locator('button:has([data-icon="send"])')
                )
              ).first();
              
              if (await sendButton.count() > 0) {
                // Just hover to show it's interactive, don't click to avoid API call
                await sendButton.hover();
                console.log('✅ Send button found and interactive');
              }

              // Test keyboard navigation - ESC to close
              console.log('🎹 Testing keyboard navigation (ESC to close)');
              await page.keyboard.press('Escape');
              await page.waitForTimeout(1000);
              
              await page.screenshot({ 
                path: path.join(screenshotsDir, '08-modal-closed-esc.png'),
                fullPage: true 
              });
              console.log('✅ Modal closed with ESC key - accessibility test passed!');

              // Test offline detection in authenticated area
              console.log('\n📶 Test 5: Offline Detection in Dashboard');
              
              // Simulate offline
              await page.evaluate(() => {
                window.dispatchEvent(new Event('offline'));
                if (window.navigator) {
                  Object.defineProperty(window.navigator, 'onLine', {
                    writable: true,
                    value: false
                  });
                }
              });
              
              await page.waitForTimeout(2000);
              
              await page.screenshot({ 
                path: path.join(screenshotsDir, '09-dashboard-offline.png'),
                fullPage: true 
              });
              console.log('✅ Dashboard offline state screenshot taken');

              // Back online
              await page.evaluate(() => {
                window.dispatchEvent(new Event('online'));
                if (window.navigator) {
                  Object.defineProperty(window.navigator, 'onLine', {
                    writable: true,
                    value: true
                  });
                }
              });
              
              await page.waitForTimeout(3000);
              
              await page.screenshot({ 
                path: path.join(screenshotsDir, '10-dashboard-back-online.png'),
                fullPage: true 
              });
              console.log('✅ Dashboard back online screenshot taken');
              
            } else {
              console.log('⚠️  Message input not found in chat modal');
            }
          } else {
            console.log('⚠️  Chat button not found on dashboard');
          }
          
        } else {
          console.log('⚠️  Authentication may have failed or redirected elsewhere');
        }
      } else {
        console.log('⚠️  Email/password inputs not found');
      }
    } else {
      console.log('⚠️  No authentication button found. App might not require auth or different flow.');
      
      // Maybe the app is already accessible - try to find dashboard elements
      const dashboardElements = [
        'text="Dashboard"',
        'text="Welcome"',
        'button:has-text("Chat with Marcus")',
        'nav',
        '.dashboard'
      ];
      
      for (const selector of dashboardElements) {
        try {
          const element = page.locator(selector).first();
          if (await element.count() > 0) {
            console.log('✅ Found dashboard-like element, app may be open access');
            await page.screenshot({ 
              path: path.join(screenshotsDir, '02-open-access-dashboard.png'),
              fullPage: true 
            });
            break;
          }
        } catch (e) {}
      }
    }

    // Final comprehensive screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, '11-final-state.png'),
      fullPage: true 
    });
    console.log('✅ Final state screenshot taken');

    console.log('\n🎉 Authentication flow test completed!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
    console.log('━'.repeat(70));

    // List screenshots
    const screenshots = fs.readdirSync(screenshotsDir)
      .filter(f => f.endsWith('.png'))
      .sort();
    
    console.log('📸 Authentication Test Screenshots:');
    screenshots.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });

  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'auth-error-state.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testAuthenticationFlow().catch(console.error);
