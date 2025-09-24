/**
 * 🧪 Quick Playwright Test
 * Simplified test to verify basic functionality and identify issues
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function quickTest() {
  console.log('🧪 Running quick test to identify issues...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to create page
    console.log('🌐 Navigating to create page...');
    await page.goto('http://localhost:3000/create');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: './test-screenshots/quick-test-create-page.png', fullPage: true });
    
    // Check what elements exist
    console.log('🔍 Analyzing page structure...');
    
    // Check for various title elements
    const titleElements = await page.evaluate(() => {
      const elements = [];
      ['h1', 'h2', 'h3', '[class*="title"]', '[class*="heading"]'].forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          elements.push({
            tag: el.tagName,
            text: el.textContent?.trim(),
            selector: selector
          });
        });
      });
      return elements;
    });
    
    console.log('📝 Found title elements:', titleElements);
    
    // Check for step indicators
    const stepElements = await page.evaluate(() => {
      const steps = [];
      ['[class*="step"]', 'button', 'nav'].forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          if (el.textContent?.includes('Step') || el.textContent?.includes('Brand') || el.textContent?.includes('Marcus')) {
            steps.push({
              tag: el.tagName,
              text: el.textContent?.trim().substring(0, 50),
              selector: selector
            });
          }
        });
      });
      return steps;
    });
    
    console.log('👣 Found step elements:', stepElements);
    
    // Check for form elements
    const formElements = await page.evaluate(() => {
      return {
        inputs: document.querySelectorAll('input').length,
        textareas: document.querySelectorAll('textarea').length,
        buttons: document.querySelectorAll('button').length,
        forms: document.querySelectorAll('form').length
      };
    });
    
    console.log('📋 Form elements:', formElements);
    
    // Test basic interaction
    console.log('🖱️ Testing basic interaction...');
    
    // Look for any input field
    const firstInput = await page.locator('input, textarea').first();
    if (await firstInput.count() > 0) {
      await firstInput.fill('Test input');
      console.log('✅ Successfully filled input field');
    }
    
    // Look for any button
    const firstButton = await page.locator('button').first();
    if (await firstButton.count() > 0) {
      const buttonText = await firstButton.textContent();
      console.log(`🔘 Found button: "${buttonText}"`);
      
      // Only click if it's not a potentially dangerous button
      if (!buttonText?.toLowerCase().includes('delete') && !buttonText?.toLowerCase().includes('remove')) {
        try {
          await firstButton.click();
          console.log('✅ Successfully clicked button');
          await page.waitForTimeout(1000);
        } catch (e) {
          console.log('⚠️ Button click failed (expected for some buttons):', e.message);
        }
      }
    }
    
    await page.screenshot({ path: './test-screenshots/quick-test-after-interaction.png', fullPage: true });
    
    console.log('✅ Quick test completed successfully!');
    
  } catch (error) {
    console.error('❌ Quick test failed:', error);
    await page.screenshot({ path: './test-screenshots/quick-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Create screenshot directory if it doesn't exist
if (!fs.existsSync('./test-screenshots')) {
  fs.mkdirSync('./test-screenshots', { recursive: true });
}

quickTest();
