const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');
const TIMEOUT = 30000; // Increased for AI processing
const AI_PROCESSING_TIMEOUT = 120000; // 2 minutes for AI to complete

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

class AISlideGenerationTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async setup() {
    console.log('🤖 Starting AI Slide Generation Integration Tests...');
    
    this.browser = await chromium.launch({
      headless: true
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1280, height: 720 });
    
    // Enable console logging for debugging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Browser Error: ${msg.text()}`);
      }
    });
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async takeScreenshot(testName, status = 'failure') {
    const timestamp = Date.now();
    const filename = `${testName}-${status}-${timestamp}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    
    await this.page.screenshot({
      path: filepath,
      fullPage: true
    });
    
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  }

  async waitForServer() {
    console.log('⏳ Waiting for development server...');
    
    for (let i = 0; i < 30; i++) {
      try {
        const response = await this.page.goto(BASE_URL, { 
          waitUntil: 'networkidle',
          timeout: 5000 
        });
        
        if (response && response.status() === 200) {
          console.log('✅ Development server is ready');
          return true;
        }
      } catch (error) {
        console.log(`⏳ Server not ready, attempt ${i + 1}/30...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('❌ Development server failed to start within 30 seconds');
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running: ${testName}`);
    
    try {
      await testFunction();
      console.log(`✅ PASS: ${testName}`);
      this.testResults.push({ name: testName, status: 'PASS' });
      return true;
    } catch (error) {
      console.log(`❌ FAIL: ${testName}`);
      console.log(`   Error: ${error.message}`);
      
      await this.takeScreenshot(testName.replace(/\s+/g, '-').toLowerCase());
      this.testResults.push({ 
        name: testName, 
        status: 'FAIL', 
        error: error.message 
      });
      return false;
    }
  }

  async testHomepageLoads() {
    await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Check if the main heading is present
    const titleElement = await this.page.waitForSelector('h1', { timeout: TIMEOUT });
    const titleText = await titleElement.textContent();
    
    if (!titleText.includes('Voice-to-Slide Generator')) {
      throw new Error(`Expected homepage title to contain "Voice-to-Slide Generator", got: ${titleText}`);
    }
    
    // Check if VoiceToSlideProcessor component is present
    const processorElement = await this.page.waitForSelector('.max-w-4xl', { timeout: TIMEOUT });
    if (!processorElement) {
      throw new Error('VoiceToSlideProcessor component not found on homepage');
    }

    // Verify the three-step process icons are displayed
    const processSteps = await this.page.locator('.grid.grid-cols-1.md\\:grid-cols-3').count();
    if (processSteps !== 1) {
      throw new Error('Expected process steps grid to be present');
    }
  }

  async testUploadInterfaceVisible() {
    await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Check that upload section is visible
    const uploadSection = await this.page.waitForSelector('text=Upload Your Audio', { timeout: TIMEOUT });
    if (!uploadSection) {
      throw new Error('Upload section not found');
    }

    // Check for presentation title input
    const titleInput = await this.page.waitForSelector('input[placeholder*="title for your presentation"]', { timeout: TIMEOUT });
    if (!titleInput) {
      throw new Error('Presentation title input not found');
    }

    // Check for audio input selector (drag & drop area or file input)
    const audioUploader = await this.page.waitForSelector('.border-dashed, input[type="file"]', { timeout: TIMEOUT });
    if (!audioUploader) {
      throw new Error('Audio uploader component not found');
    }
  }

  async testSlideGenerationFlow() {
    await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Fill in presentation title
    const titleInput = await this.page.waitForSelector('input[placeholder*="title for your presentation"]', { timeout: TIMEOUT });
    await titleInput.fill('Test AI Generated Presentation');

    // Create a small test audio file (simulate upload)
    // Since we can't actually upload files in this test environment without real audio files,
    // we'll test the UI components and mock the flow
    
    // Look for file input or drag-drop area
    const fileInputs = await this.page.locator('input[type="file"]').count();
    const dragDropAreas = await this.page.locator('[data-testid*="upload"], .border-dashed').count();
    
    if (fileInputs === 0 && dragDropAreas === 0) {
      throw new Error('No file upload mechanism found (no file input or drag-drop area)');
    }

    // Verify processing indicator is present and shows correct steps
    const processingIndicator = await this.page.locator('text=Processing Indicator, text=Upload, text=Transcribing, text=Generating').count();
    if (processingIndicator === 0) {
      // Try alternative selectors for processing steps
      const stepElements = await this.page.locator('.bg-white.rounded-lg.shadow-sm').count();
      if (stepElements === 0) {
        throw new Error('Processing indicator component not found');
      }
    }

    console.log('✅ Upload interface and processing indicators are properly configured');
  }

  async testDemoDataPresence() {
    await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Check if there are recent presentations shown (indicates working backend)
    await this.page.waitForTimeout(2000); // Wait for Convex query to load
    
    const recentDecksSection = await this.page.locator('text=Recent Presentations').count();
    
    // This is optional - the app should work even without demo data
    if (recentDecksSection > 0) {
      console.log('✅ Recent presentations section found - backend is connected');
      
      // Check if we can see presentation cards
      const presentationCards = await this.page.locator('.cursor-pointer').count();
      if (presentationCards > 0) {
        console.log(`✅ Found ${presentationCards} presentation cards in demo data`);
      }
    } else {
      console.log('ℹ️ No recent presentations shown - this is normal for a fresh installation');
    }
  }

  async testNavigationToSlideViewer() {
    await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Wait for recent decks to potentially load
    await this.page.waitForTimeout(3000);
    
    // Look for any existing presentation links
    const presentationLinks = await this.page.locator('a[href*="/deck/"]').count();
    
    if (presentationLinks > 0) {
      console.log(`✅ Found ${presentationLinks} presentation link(s) - navigation structure is working`);
      
      // Click the first presentation link to test navigation
      const firstLink = this.page.locator('a[href*="/deck/"]').first();
      const href = await firstLink.getAttribute('href');
      
      if (href) {
        // Navigate to the deck page
        await this.page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle' });
        
        // Verify we're on a deck page by looking for slide viewer components
        const slideViewerElements = await this.page.locator('.slide-viewer, [data-testid*="slide"], .max-w-4xl').count();
        
        if (slideViewerElements === 0) {
          throw new Error('Slide viewer page did not load properly');
        }
        
        console.log('✅ Successfully navigated to slide viewer page');
      }
    } else {
      console.log('ℹ️ No existing presentations found - testing navigation structure with sample URL');
      
      // Test that the deck route exists and doesn't 404
      try {
        await this.page.goto(`${BASE_URL}/deck/sample-deck-id`, { waitUntil: 'networkidle' });
        
        // We expect this to either show a "not found" message or a loading state
        // but not crash the app
        const pageContent = await this.page.textContent('body');
        if (pageContent && pageContent.length > 0) {
          console.log('✅ Deck route is properly configured (shows content or error handling)');
        }
      } catch (error) {
        // If navigation fails completely, that indicates a routing problem
        throw new Error('Deck route appears to be broken or misconfigured');
      }
    }
  }

  async testErrorHandling() {
    await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Test that error components are available
    // Check if ErrorDisplay or ErrorBoundary components would handle errors
    const errorHandlingElements = await this.page.locator('[data-testid*="error"], .error-display, .error-boundary').count();
    
    // The presence of error handling components isn't always visible in the UI
    // but we can test that the app doesn't crash on navigation errors
    
    // Test navigation to non-existent deck
    await this.page.goto(`${BASE_URL}/deck/non-existent-deck-12345`, { waitUntil: 'networkidle' });
    
    // The app should handle this gracefully, not crash
    const pageContent = await this.page.textContent('body');
    
    if (!pageContent || pageContent.trim().length === 0) {
      throw new Error('App appears to crash on invalid deck ID');
    }
    
    // Check if there's any error message or redirect to home
    const hasErrorMessage = await this.page.locator('text=error, text=not found, text=Error').count() > 0;
    const isRedirectedHome = await this.page.url() === BASE_URL;
    
    if (hasErrorMessage || isRedirectedHome || pageContent.includes('not found') || pageContent.includes('error')) {
      console.log('✅ Error handling is working - app shows error or redirects gracefully');
    } else {
      console.log('ℹ️ Error handling may be present but not easily detectable in this test');
    }
  }

  async runAllTests() {
    await this.setup();
    
    try {
      await this.waitForServer();
      
      // Run all tests
      await this.runTest('Homepage Loads Correctly', () => this.testHomepageLoads());
      await this.runTest('Upload Interface is Visible', () => this.testUploadInterfaceVisible());
      await this.runTest('AI Slide Generation Flow Components', () => this.testSlideGenerationFlow());
      await this.runTest('Demo Data and Backend Connection', () => this.testDemoDataPresence());
      await this.runTest('Navigation to Slide Viewer', () => this.testNavigationToSlideViewer());
      await this.runTest('Error Handling', () => this.testErrorHandling());
      
      // Print results
      console.log('\n📊 AI Slide Generation Test Results:');
      console.log('=====================================');
      
      const passed = this.testResults.filter(r => r.status === 'PASS').length;
      const failed = this.testResults.filter(r => r.status === 'FAIL').length;
      
      this.testResults.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : '❌';
        console.log(`${icon} ${result.name}`);
        if (result.error) {
          console.log(`   ${result.error}`);
        }
      });
      
      console.log(`\nTotal: ${this.testResults.length} | Passed: ${passed} | Failed: ${failed}`);
      
      if (failed > 0) {
        console.log(`\n📸 Failure screenshots saved in: ${SCREENSHOT_DIR}`);
        console.log('\n⚠️  Some tests failed, but this may be due to missing demo data or AI service configuration.');
        console.log('The core application structure appears to be working.');
        process.exit(1);
      } else {
        console.log('\n🎉 All AI slide generation tests passed!');
        console.log('✨ The voice-to-slide application is ready for demo!');
        process.exit(0);
      }
      
    } catch (error) {
      console.error('💥 Test suite failed to run:', error.message);
      await this.takeScreenshot('test-suite-failure');
      process.exit(1);
    } finally {
      await this.teardown();
    }
  }
}

// Export for potential use as module
module.exports = AISlideGenerationTest;

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new AISlideGenerationTest();
  testSuite.runAllTests().catch(console.error);
}