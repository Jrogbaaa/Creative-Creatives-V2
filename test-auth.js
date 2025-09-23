#!/usr/bin/env node
// Test Firebase Authentication
require('dotenv').config({ path: '.env.local' });

// Test Firebase admin auth to create test users
const admin = require('firebase-admin');

console.log('🔐 Creative Creatives V2 - Authentication Test');
console.log('━'.repeat(50));

// Initialize Firebase Admin
try {
  if (!admin.apps.length) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "creative-creatives-v2",
      private_key_id: "key-id",
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: "client-id",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "creative-creatives-v2"
    });
  }
  
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  process.exit(1);
}

async function createTestUser() {
  const testEmail = 'test@creativecreatives.com';
  const testPassword = 'TestUser123!';
  
  console.log('\n🔧 Creating test user...');
  console.log(`Email: ${testEmail}`);
  console.log(`Password: ${testPassword}`);
  
  try {
    // Try to get user first, delete if exists
    try {
      const existingUser = await admin.auth().getUserByEmail(testEmail);
      await admin.auth().deleteUser(existingUser.uid);
      console.log('🗑️  Deleted existing test user');
    } catch (e) {
      // User doesn't exist, that's fine
    }
    
    // Create new user
    const userRecord = await admin.auth().createUser({
      email: testEmail,
      password: testPassword,
      displayName: 'Test User',
      emailVerified: true,
    });
    
    console.log('✅ Test user created successfully!');
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email}`);
    
    return { email: testEmail, password: testPassword };
  } catch (error) {
    console.error('❌ Failed to create test user:', error.message);
    return null;
  }
}

async function testFirebaseConfig() {
  console.log('\n📋 Firebase Configuration Check:');
  console.log('━'.repeat(30));
  
  const config = {
    'API Key': process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
    'Auth Domain': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
    'Project ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
    'Storage Bucket': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
    'Messaging Sender ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing',
    'App ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
    'Private Key': process.env.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Missing',
    'Client Email': process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing',
  };
  
  Object.entries(config).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  
  const allSet = Object.values(config).every(v => v === '✅ Set');
  console.log(`\n📊 Configuration Status: ${allSet ? '✅ Complete' : '⚠️  Incomplete'}`);
  
  return allSet;
}

async function main() {
  // Check configuration
  const configOk = await testFirebaseConfig();
  
  if (!configOk) {
    console.log('\n❌ Firebase configuration incomplete. Check your .env.local file.');
    return;
  }
  
  // Create test user
  const testCredentials = await createTestUser();
  
  if (testCredentials) {
    console.log('\n🎉 SUCCESS! Use these credentials to sign in:');
    console.log('━'.repeat(40));
    console.log(`📧 Email: ${testCredentials.email}`);
    console.log(`🔒 Password: ${testCredentials.password}`);
    console.log('\n📱 Instructions:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Click "Sign In" button');
    console.log('3. Use the credentials above');
    console.log('4. You should be redirected to the dashboard');
  } else {
    console.log('\n❌ Failed to create test user. Check Firebase permissions.');
  }
  
  // Test connection to Firebase
  try {
    console.log('\n🔍 Testing Firebase connection...');
    const users = await admin.auth().listUsers(1);
    console.log(`✅ Firebase Auth connection working (${users.users.length} user(s) found)`);
  } catch (error) {
    console.log('❌ Firebase Auth connection failed:', error.message);
  }
}

main().catch(console.error);
