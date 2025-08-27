#!/usr/bin/env node

// API Testing Script for Creative Creatives V2
// Tests Firebase, LLaMA, and Google Cloud integrations

const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');
const { HfInference } = require('@huggingface/inference');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Creative Creatives V2 API Testing Suite');
console.log('==========================================\n');

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Hugging Face
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function testFirebaseAuth() {
  console.log('🔐 Testing Firebase Authentication...');
  try {
    const userCredential = await signInAnonymously(auth);
    console.log('✅ Firebase Auth: SUCCESS');
    console.log(`   User ID: ${userCredential.user.uid}`);
    return true;
  } catch (error) {
    console.log('❌ Firebase Auth: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testFirestore() {
  console.log('\n📄 Testing Firestore Database...');
  try {
    const testDoc = doc(db, 'test', 'api-test-' + Date.now());
    await setDoc(testDoc, {
      message: 'API test successful',
      timestamp: new Date(),
      from: 'test-apis.js'
    });
    
    const docSnap = await getDoc(testDoc);
    if (docSnap.exists()) {
      console.log('✅ Firestore: SUCCESS');
      console.log(`   Document created and retrieved`);
      return true;
    } else {
      throw new Error('Document not found');
    }
  } catch (error) {
    console.log('❌ Firestore: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testLLaMACreativeExpert() {
  console.log('\n🤖 Testing LLaMA Creative Expert...');
  try {
    const response = await hf.chatCompletion({
      model: 'meta-llama/Llama-3.1-8B-Instruct',
      messages: [
        {
          role: 'system',
          content: 'You are Marcus, a creative director. Respond briefly to confirm you are working.'
        },
        {
          role: 'user',
          content: 'Hello Marcus, are you ready to help create amazing advertisements?'
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      console.log('✅ LLaMA Creative Expert: SUCCESS');
      console.log(`   Marcus says: "${content.substring(0, 100)}..."`);
      return true;
    } else {
      throw new Error('No response content');
    }
  } catch (error) {
    console.log('❌ LLaMA Creative Expert: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testGoogleCloudAuth() {
  console.log('\n☁️ Testing Google Cloud Authentication...');
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
      console.log(`   Access token obtained (length: ${accessToken.token.length})`);
      return true;
    } else {
      throw new Error('No access token received');
    }
  } catch (error) {
    console.log('❌ Google Cloud Auth: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testGoogleAIEndpoints() {
  console.log('\n🎨 Testing Google AI API Endpoints...');
  try {
    // Test if endpoints are properly configured
    const veoEndpoint = process.env.VEO_API_ENDPOINT;
    const imagenEndpoint = process.env.IMAGEN_API_ENDPOINT;
    
    if (!veoEndpoint || !imagenEndpoint) {
      throw new Error('API endpoints not configured');
    }
    
    console.log('✅ Google AI Endpoints: SUCCESS');
    console.log(`   Veo endpoint: ${veoEndpoint.substring(0, 50)}...`);
    console.log(`   Imagen endpoint: ${imagenEndpoint.substring(0, 50)}...`);
    return true;
  } catch (error) {
    console.log('❌ Google AI Endpoints: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting comprehensive API tests...\n');
  
  const results = {
    firebaseAuth: await testFirebaseAuth(),
    firestore: await testFirestore(),
    llamaExpert: await testLLaMACreativeExpert(),
    googleCloudAuth: await testGoogleCloudAuth(),
    googleAIEndpoints: await testGoogleAIEndpoints(),
  };
  
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} - ${testName}`);
  });
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL SYSTEMS GO! Your Creative Creatives V2 platform is ready for action!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Visit http://localhost:3000');
    console.log('   2. Create an account');
    console.log('   3. Chat with Marcus');
    console.log('   4. Start creating amazing ads!');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above and:');
    console.log('   1. Verify your .env.local file');
    console.log('   2. Check Google Cloud permissions');
    console.log('   3. Ensure all APIs are enabled');
  }
  
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run the tests
runAllTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error.message);
  process.exit(1);
});
