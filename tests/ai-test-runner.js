const { spawn } = require('child_process');
const http = require('http');

class AITestRunner {
  constructor() {
    this.devProcess = null;
  }

  async checkServerReady(url = 'http://localhost:3000', timeout = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        await new Promise((resolve, reject) => {
          const req = http.get(url, (res) => {
            if (res.statusCode === 200) {
              resolve();
            } else {
              reject(new Error(`Server returned status ${res.statusCode}`));
            }
          });
          
          req.on('error', reject);
          req.setTimeout(2000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
          });
        });
        
        console.log('✅ Server is ready for AI slide generation test!');
        return true;
      } catch (error) {
        console.log('⏳ Waiting for server...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('❌ Server failed to start within timeout');
  }

  async startDevServer() {
    console.log('🚀 Starting development server for AI test...');
    
    // Kill any existing processes on port 3000
    try {
      const killProcess = spawn('npx', ['kill-port', '3000'], { stdio: 'pipe' });
      await new Promise(resolve => killProcess.on('close', resolve));
    } catch (error) {
      // Ignore errors from kill-port
    }
    
    const devCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
    this.devProcess = spawn(devCommand, ['dev-bg'], {
      stdio: 'pipe',
      detached: false,
      env: { ...process.env, FORCE_COLOR: '1' }
    });

    this.devProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('Ready')) {
        console.log('📡 Dev server ready:', output.trim());
      }
    });

    this.devProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('Warning') && !error.includes('Note:')) {
        console.error('⚠️ Dev server notice:', error.trim());
      }
    });

    // Wait for server to be ready
    await this.checkServerReady();
  }

  async stopDevServer() {
    if (this.devProcess) {
      console.log('🛑 Stopping development server...');
      
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', this.devProcess.pid, '/f', '/t']);
      } else {
        this.devProcess.kill('SIGTERM');
        
        setTimeout(() => {
          if (this.devProcess && !this.devProcess.killed) {
            this.devProcess.kill('SIGKILL');
          }
        }, 5000);
      }
      
      this.devProcess = null;
    }
  }

  async runAITest() {
    console.log('🤖 Running AI Slide Generation test...');
    
    const AITestSuite = require('./integration/aiSlideGeneration.test.js');
    const testSuite = new AITestSuite();
    
    try {
      await testSuite.runAllTests();
      return true;
    } catch (error) {
      console.error('❌ AI test failed:', error.message);
      return false;
    }
  }

  async cleanup() {
    await this.stopDevServer();
    console.log('🧹 Cleanup complete');
  }
}

async function main() {
  const runner = new AITestRunner();
  let success = false;
  
  // Handle process termination
  process.on('SIGINT', async () => {
    console.log('\n⚡ Received SIGINT, cleaning up...');
    await runner.cleanup();
    process.exit(1);
  });
  
  try {
    console.log('🔧 Starting AI Slide Generation Test...');
    console.log('======================================');
    
    await runner.startDevServer();
    
    // Give the server a moment to fully initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    success = await runner.runAITest();
    
    if (success) {
      console.log('\n✅ AI Slide Generation Test: PASSED');
      console.log('🎉 The voice-to-slide app is ready for demo!');
    } else {
      console.log('\n❌ AI Slide Generation Test: FAILED');
      console.log('⚠️  Check the screenshots for debugging information.');
    }
  } catch (error) {
    console.error('\n💥 Test runner failed:', error.message);
  } finally {
    await runner.cleanup();
  }
  
  process.exit(success ? 0 : 1);
}

// Export for potential use as module
module.exports = AITestRunner;

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}