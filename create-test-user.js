/**
 * 🧪 Create Test User for Playwright Testing
 * Creates a test user in Firebase for automated testing
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./scripts/firebase-service-account-key.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'creative-creatives-v2'
  });
}

const auth = admin.auth();

async function createTestUser() {
  const testUser = {
    email: 'test@playwright.dev',
    password: 'TestPlaywright123!',
    displayName: 'Playwright Test User',
    disabled: false,
    emailVerified: true
  };

  try {
    console.log('🔧 Creating test user for Playwright...');
    
    // Check if user already exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(testUser.email);
      console.log('✅ Test user already exists:', userRecord.uid);
      
      // Update user password just in case
      await auth.updateUser(userRecord.uid, {
        password: testUser.password,
        emailVerified: true,
        disabled: false
      });
      console.log('✅ Test user password updated');
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        userRecord = await auth.createUser(testUser);
        console.log('✅ Test user created successfully:', userRecord.uid);
      } else {
        throw error;
      }
    }

    // Set custom claims for testing
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'tester',
      testUser: true,
      createdBy: 'playwright'
    });

    console.log('\n🎯 Test User Details:');
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: ${testUser.password}`);
    console.log(`UID: ${userRecord.uid}`);
    console.log(`Display Name: ${testUser.displayName}`);
    
    return userRecord;

  } catch (error) {
    console.error('❌ Failed to create test user:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createTestUser()
    .then(user => {
      console.log('\n🚀 Test user ready for Playwright testing!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed to setup test user:', error);
      process.exit(1);
    });
}

module.exports = { createTestUser };
