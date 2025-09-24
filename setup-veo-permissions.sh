#!/bin/bash

# Setup VEO 3 permissions for your existing Firebase service account
# Run this script to grant your Firebase service account VEO 3 access

echo "🔧 Setting up VEO 3 permissions for your Firebase service account..."

# Your project and service account details (from your Firebase console screenshot)
PROJECT_ID="creative-creatives-v2"
SERVICE_ACCOUNT="firebase-adminsdk-fbsvc@creative-creatives-v2.iam.gserviceaccount.com"

echo "Project ID: $PROJECT_ID"
echo "Service Account: $SERVICE_ACCOUNT"
echo ""

# Enable required APIs
echo "📡 Enabling required Google Cloud APIs..."
gcloud services enable aiplatform.googleapis.com --project=$PROJECT_ID
gcloud services enable texttospeech.googleapis.com --project=$PROJECT_ID
echo "✅ APIs enabled"
echo ""

# Add VEO 3 / Vertex AI permissions to your existing Firebase service account
echo "🔑 Adding VEO 3 permissions to your Firebase service account..."

echo "Adding Vertex AI User role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/aiplatform.user"

echo "Adding AI Platform Developer role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/ml.developer"

echo "Adding Vertex AI Service Agent role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/aiplatform.serviceAgent"

echo ""
echo "✅ VEO 3 permissions granted to your Firebase service account!"
echo ""
echo "🎯 Next steps:"
echo "1. Update your .env.local file (see example below)"
echo "2. Restart your development server"
echo "3. Test VEO 3 video generation"
echo ""
echo "📝 Add these to your .env.local file:"
echo "# Use your existing Firebase credentials for VEO 3 too"
echo "GOOGLE_CLOUD_PROJECT_ID=creative-creatives-v2"
echo "GOOGLE_CLOUD_CLIENT_EMAIL=firebase-adminsdk-fbsvc@creative-creatives-v2.iam.gserviceaccount.com"
echo "GOOGLE_CLOUD_PRIVATE_KEY=\"your-existing-firebase-private-key-here\""
echo ""
echo "🚀 Your Firebase service account now has VEO 3 access!"
