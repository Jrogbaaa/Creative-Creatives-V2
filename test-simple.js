#!/usr/bin/env node

// Simple API Test for Creative Creatives V2
// Tests individual components without complex authentication

console.log('🔍 Simple API Testing for Creative Creatives V2');
console.log('==============================================\n');

// Test 1: Environment Variables
console.log('📋 Testing Environment Variables...');
require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'HUGGINGFACE_API_KEY',
  'GOOGLE_CLOUD_CLIENT_EMAIL'
];

let envSuccess = true;
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}: Set`);
  } else {
    console.log(`❌ ${envVar}: Missing`);
    envSuccess = false;
  }
});

// Test 2: Hugging Face API
console.log('\n🤖 Testing Hugging Face API...');
async function testHuggingFace() {
  try {
    const { HfInference } = require('@huggingface/inference');
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    
    const response = await hf.chatCompletion({
      model: 'meta-llama/Llama-3.1-8B-Instruct',
      messages: [
        { role: 'user', content: 'Say "API test successful" if you can read this.' }
      ],
      max_tokens: 50,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      console.log('✅ Hugging Face API: SUCCESS');
      console.log(`   Response: "${content.substring(0, 50)}..."`);
      return true;
    } else {
      throw new Error('No response content');
    }
  } catch (error) {
    console.log('❌ Hugging Face API: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test 3: Firebase Configuration
console.log('\n🔥 Testing Firebase Configuration...');
function testFirebaseConfig() {
  try {
    const { initializeApp } = require('firebase/app');
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };

    const app = initializeApp(firebaseConfig);
    if (app) {
      console.log('✅ Firebase Configuration: SUCCESS');
      console.log(`   Project ID: ${firebaseConfig.projectId}`);
      return true;
    }
  } catch (error) {
    console.log('❌ Firebase Configuration: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test 4: Google Cloud Authentication
console.log('\n☁️ Testing Google Cloud Authentication...');
async function testGoogleCloudAuth() {
  try {
    const { GoogleAuth } = require('google-auth-library');
    
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    if (accessToken.token) {
      console.log('✅ Google Cloud Auth: SUCCESS');
      console.log(`   Token length: ${accessToken.token.length} characters`);
      return true;
    }
  } catch (error) {
    console.log('❌ Google Cloud Auth: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n🚀 Running all tests...\n');
  
  const results = {
    env: envSuccess,
    huggingface: await testHuggingFace(),
    firebase: testFirebaseConfig(),
    googlecloud: await testGoogleCloudAuth()
  };
  
  console.log('\n📊 Final Results:');
  console.log('=================');
  
  let passed = 0;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, success]) => {
    const status = success ? '✅ PASS' : '❌ FAIL';
    const testName = test.charAt(0).toUpperCase() + test.slice(1);
    console.log(`${status} - ${testName}`);
    if (success) passed++;
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed\n`);
  
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! Your APIs are ready to go!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Your environment is properly configured');
    console.log('   2. All API keys are working');
    console.log('   3. Ready to test the full application');
    console.log('   4. Visit http://localhost:3000 to try the app');
  } else {
    console.log('⚠️ Some tests failed. Please check:');
    console.log('   1. Your .env.local file has all required values');
    console.log('   2. API keys are valid and have proper permissions');
    console.log('   3. Internet connection is stable');
  }
  
  process.exit(passed === total ? 0 : 1);
}

runTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error.message);
  process.exit(1);
});
