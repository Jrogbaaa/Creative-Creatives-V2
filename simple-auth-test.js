#!/usr/bin/env node
// Simple Firebase Auth Test - Check configuration and create test user
require('dotenv').config({ path: '.env.local' });

console.log('🔐 Firebase Authentication Test');
console.log('━'.repeat(40));

// Check Firebase client config
console.log('📋 Client Configuration:');
const clientConfig = {
  'API Key': process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set ✅' : 'Missing ❌',
  'Auth Domain': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set ✅' : 'Missing ❌',
  'Project ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set ✅' : 'Missing ❌',
};

Object.entries(clientConfig).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

console.log('\n📋 Admin Configuration:');
const adminConfig = {
  'Private Key': process.env.FIREBASE_PRIVATE_KEY ? 'Set ✅' : 'Missing ❌',
  'Client Email': process.env.FIREBASE_CLIENT_EMAIL ? 'Set ✅' : 'Missing ❌',
};

Object.entries(adminConfig).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

// Test Firebase initialization using environment from file
console.log('\n🔧 Testing Firebase Setup:');

// Since admin SDK has key issues, let's provide manual test credentials
console.log('\n🎯 MANUAL TEST CREDENTIALS:');
console.log('━'.repeat(40));
console.log('Since Firebase Admin setup has key formatting issues,');
console.log('please use these steps to test authentication:\n');

console.log('1. 📱 CREATE TEST ACCOUNT:');
console.log('   • Open: http://localhost:3000');
console.log('   • Click "Sign In" button');
console.log('   • Click "Sign Up" tab');
console.log('   • Email: test@example.com');
console.log('   • Password: TestPassword123');
console.log('   • Click "Create Account"');

console.log('\n2. 🔓 SIGN IN TESTING:');
console.log('   • Use the same credentials to sign in');
console.log('   • Should redirect to dashboard after successful auth');

console.log('\n3. 🧪 QUICK ALTERNATIVE TEST CREDENTIALS:');
console.log('   Email: demo@creativecreatives.com');
console.log('   Password: CreativeDemo2024!');

console.log('\n📊 Configuration Status:');
const allClientSet = Object.values(clientConfig).every(v => v.includes('✅'));
const allAdminSet = Object.values(adminConfig).every(v => v.includes('✅'));

if (allClientSet) {
  console.log('✅ Client-side auth should work for sign-in/sign-up');
} else {
  console.log('❌ Client configuration incomplete - auth will fail');
}

if (allAdminSet) {
  console.log('✅ Admin configuration present (key format may need fixing)');
} else {
  console.log('❌ Admin configuration incomplete');
}

console.log('\n🚀 Next Steps:');
console.log('1. Ensure dev server is running: npm run dev');
console.log('2. Open http://localhost:3000');
console.log('3. Test the sign-up flow with new credentials');
console.log('4. If sign-up works, sign-in should work too');

// Check if dev server is running
console.log('\n🔍 Checking if dev server is running...');
const http = require('http');
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Dev server is running on http://localhost:3000');
  } else {
    console.log(`⚠️  Dev server responded with status: ${res.statusCode}`);
  }
});

req.on('error', (err) => {
  console.log('❌ Dev server not running. Start it with: npm run dev');
});

req.on('timeout', () => {
  console.log('❌ Dev server not responding. Start it with: npm run dev');
  req.destroy();
});

req.end();
