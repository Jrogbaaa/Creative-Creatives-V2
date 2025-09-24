/**
 * 🧪 Test User Setup for Playwright Testing
 * Creates test credentials that work with the development environment
 */

const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

// Test user credentials
const TEST_USER = {
  email: 'test@playwright.dev',
  password: 'TestPlaywright123!',
  displayName: 'Playwright Test User'
};

async function setupTestUser() {
  console.log('🧪 Setting up test user for Playwright...');
  
  try {
    // Initialize Firebase for testing
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    console.log('🔐 Creating test user account...');
    
    try {
      // Try to create the user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        TEST_USER.email, 
        TEST_USER.password
      );
      
      console.log('✅ Test user created successfully!');
      console.log(`   Email: ${TEST_USER.email}`);
      console.log(`   Password: ${TEST_USER.password}`);
      console.log(`   UID: ${userCredential.user.uid}`);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Test user already exists, verifying credentials...');
        
        // Try to sign in with existing credentials
        try {
          const signInResult = await signInWithEmailAndPassword(
            auth, 
            TEST_USER.email, 
            TEST_USER.password
          );
          console.log('✅ Test user credentials verified!');
          console.log(`   UID: ${signInResult.user.uid}`);
        } catch (signInError) {
          console.error('❌ Test user exists but credentials are invalid:', signInError.message);
          console.log('🔧 You may need to reset the test user password manually');
          throw signInError;
        }
      } else {
        console.error('❌ Failed to create test user:', error.message);
        throw error;
      }
    }

    console.log('\n🎯 Test Credentials for Playwright:');
    console.log('====================================');
    console.log(`Email: ${TEST_USER.email}`);
    console.log(`Password: ${TEST_USER.password}`);
    console.log('====================================');
    
    return TEST_USER;

  } catch (error) {
    console.error('💥 Test user setup failed:', error);
    
    // Provide fallback instructions
    console.log('\n🔧 Manual Setup Instructions:');
    console.log('1. Go to Firebase Console > Authentication');
    console.log('2. Create a user manually with these credentials:');
    console.log(`   Email: ${TEST_USER.email}`);
    console.log(`   Password: ${TEST_USER.password}`);
    console.log('3. Re-run the tests');
    
    throw error;
  }
}

// Export test credentials for use in tests
module.exports = {
  setupTestUser,
  TEST_USER
};

// Run if called directly
if (require.main === module) {
  setupTestUser()
    .then(() => {
      console.log('\n🚀 Test user setup completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}
