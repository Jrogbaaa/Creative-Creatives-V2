# Google Cloud Setup for VEO 3 Integration

## ⚠️ Current Issue
The VEO 3 video generation is failing because Google Cloud credentials are not configured. You need to set up these environment variables to enable video generation.

## 🚀 Quick Setup Steps

### 1. Get Google Cloud Credentials
Since you already have billing enabled, you need to:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Go to "APIs & Services" > "Credentials"
4. Create a new Service Account or use existing one
5. Generate a JSON key file for the service account
6. Enable these APIs:
   - **Vertex AI API**
   - **AI Platform API** 
   - **Cloud Storage API**

### 2. Set Up Environment Variables
Add these to your `.env.local` file (create it if it doesn't exist):

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"

# Other existing variables (keep these)
NEXT_PUBLIC_FIREBASE_API_KEY=your_existing_value
# ... etc
```

### 3. Grant Necessary Permissions
Your service account needs these roles:
- **Vertex AI User** (`roles/aiplatform.user`)
- **AI Platform Developer** (`roles/ml.developer`)
- **Storage Object Admin** (`roles/storage.objectAdmin`)

### 4. Quick Setup Script
Run the provided setup script (update the PROJECT_ID first):

```bash
chmod +x gcloud-setup.sh
./gcloud-setup.sh
```

## 🔧 Alternative: Manual Service Account Setup

1. **Create Service Account:**
   ```bash
   gcloud iam service-accounts create veo-service-account \
       --display-name="VEO Video Generation Service Account"
   ```

2. **Grant Permissions:**
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
       --member="serviceAccount:veo-service-account@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
       --role="roles/aiplatform.user"
   ```

3. **Generate Key:**
   ```bash
   gcloud iam service-accounts keys create ~/veo-key.json \
       --iam-account=veo-service-account@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

## 🧪 Test Configuration
Once set up, test with:
```bash
curl -X POST http://localhost:3001/api/generate-video \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test video", "duration":30, "aspectRatio":"16:9"}'
```

## 📝 Current Status
- ✅ VEO 3 Code Implementation: Complete
- ✅ UI/UX Interface: Complete  
- ✅ API Endpoints: Complete
- ❌ **Google Cloud Credentials: Missing**
- ✅ Billing Setup: Confirmed

Once you add the credentials, VEO 3 video generation will work immediately!

---
**Next Steps:** Copy your Google Cloud service account credentials into `.env.local` and restart the development server.
