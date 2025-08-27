#!/bin/bash

# Google Cloud Setup Script for Creative Creatives V2
# This script adds the necessary permissions to your Firebase service account

echo "Setting up Google Cloud permissions for Creative Creatives V2..."

# Set your project ID
PROJECT_ID="creative-creatives-v2"
SERVICE_ACCOUNT="firebase-adminsdk-fbsvc@creative-creatives-v2.iam.gserviceaccount.com"

echo "Project ID: $PROJECT_ID"
echo "Service Account: $SERVICE_ACCOUNT"

# Enable required APIs
echo "Enabling required Google Cloud APIs..."
gcloud services enable aiplatform.googleapis.com --project=$PROJECT_ID
gcloud services enable texttospeech.googleapis.com --project=$PROJECT_ID
gcloud services enable storage.googleapis.com --project=$PROJECT_ID

# Add Vertex AI permissions
echo "Adding Vertex AI User role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/aiplatform.user"

echo "Adding AI Platform Developer role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/ml.developer"

echo "Adding Storage Object Admin role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/storage.objectAdmin"

echo "Adding Text-to-Speech User role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/texttospeech.client"

echo "✅ Google Cloud setup complete!"
echo ""
echo "Your service account now has permissions for:"
echo "- Vertex AI (Veo and Imagen)"
echo "- Cloud Storage"
echo "- Text-to-Speech API"
echo ""
echo "Next steps:"
echo "1. Update your .env.local file with the provided credentials"
echo "2. Restart your development server: npm run dev"
echo "3. Test the application at http://localhost:3000"
