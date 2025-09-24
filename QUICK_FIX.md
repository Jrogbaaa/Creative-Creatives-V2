# 🚀 Quick Fix: Enable VEO 3 with Your Existing Firebase Credentials

Good news! You already have Firebase credentials set up. We just need to:
1. **Grant VEO 3 permissions** to your existing Firebase service account
2. **Add 3 environment variables** to use those same credentials for VEO 3

## Step 1: Grant VEO 3 Permissions

Run this command to grant your Firebase service account VEO 3 access:

```bash
./setup-veo-permissions.sh
```

OR manually run these commands:

```bash
# Enable APIs
gcloud services enable aiplatform.googleapis.com --project=creative-creatives-v2

# Grant permissions to your Firebase service account
gcloud projects add-iam-policy-binding creative-creatives-v2 \
    --member="serviceAccount:firebase-adminsdk-fbsvc@creative-creatives-v2.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding creative-creatives-v2 \
    --member="serviceAccount:firebase-adminsdk-fbsvc@creative-creatives-v2.iam.gserviceaccount.com" \
    --role="roles/ml.developer"
```

## Step 2: Update Your .env.local File

Add these 3 lines to your existing `.env.local` file (using your same Firebase credentials):

```env
# VEO 3 Configuration (using your existing Firebase credentials)
GOOGLE_CLOUD_PROJECT_ID=creative-creatives-v2
GOOGLE_CLOUD_CLIENT_EMAIL=firebase-adminsdk-fbsvc@creative-creatives-v2.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-existing-firebase-private-key-here\n-----END PRIVATE KEY-----"

# Keep all your existing Firebase variables...
NEXT_PUBLIC_FIREBASE_API_KEY=...
# etc.
```

**Note:** Use the **same private key** that you're already using for `FIREBASE_PRIVATE_KEY`

## Step 3: Restart Development Server

```bash
npm run dev
```

## That's It! 🎉

Your VEO 3 video generation will work immediately after:
- ✅ Granting permissions (Step 1)
- ✅ Adding the 3 environment variables (Step 2)  
- ✅ Restarting the server (Step 3)

---

**Current Error:** `Veo API error: Forbidden` = Credentials work, just need permissions
**After Fix:** VEO 3 video generation will work perfectly!
