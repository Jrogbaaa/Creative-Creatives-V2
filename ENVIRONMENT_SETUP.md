# Environment Setup Guide

## Complete .env.local Configuration

Based on your Firebase service account, here's the complete configuration for your `.env.local` file:

```env
# Firebase Configuration
# Your web app's Firebase configuration
# For Firebase JS SDK v7.20.0 and later, measurementId is optional
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCN57SiQKUSZ-5vgVLAvdmpI89be0vXWJ4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=creative-creatives-v2.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=creative-creatives-v2
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=creative-creatives-v2.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=918663847472
NEXT_PUBLIC_FIREBASE_APP_ID=1:918663847472:web:4b111fa62f950a066717f5
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YBL8239S34

# Firebase Admin SDK
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDym+msO8Olp5og\nhz4876/KImjmzn7KMNxbqW/5NCDPwDSodpRv24juwJvGdHiErx5RaUJtDKtb1S1E\nld9iyoarjDNb/70SjFtR3GP8+qHZdEiIIjR+eUrIVx92FVQNBlJm2vZjeGdcHvr3\nGv2C1HjlSDzjjMbdSZ+dkpAoD4R4Nd0mPb/W7ATHFK5cRKfz66hHrrByi7JzeHRP\nmLSv5FBmEzt+37XpqdHbuRZuQi2F9W0YWdjpnBsuOeNU2Lc/urh+shHv4854EO7s\n3ZSCEXADM2ilRI2uhrKUJYAPM9nd6c/uzbhGOrQigX8iNypr4SzSUE12WqlsFz4D\nIe6TUTnFAgMBAAECggEAWueh2KfyKMWSwmJ6pyGWiFJ5ZRZ1urQxNWVZMBLgwod+\nE6uO9hTYC8H+/I8Sw4DMhuu+eJb5NGk904em0uEZMflQG0ZJpcQSyasfiiCteYoR\nTXUnn0Y6h7PhdYELY+/8+05LaT0p2YJAPkwONrH/dMYrDoZm027tUIEk4+XgmJu3\naWmapf+PWe9KPIP4/ReooMBx7KxvQADFkT3RcOE3OmuuAkg2pqX5ar/zzgT4oARb\np6q/IJFmKASh4AacfiJ0unepC9T+0IkAomaHxue3O2Z6sYXjCfNWY/1K9c5VqrhO\nzmLAkn+bSr4zg6/z3x0WzbVLbc35roq6jLGhUsh55wKBgQD+xceh506sPgek2b1O\nhDdGhhXuUUie/N8dKLRuKavDiUPf0wbW8r08ZyMEeLMDD7rdxKLRQ0QMUlQxkMzH\nJ34RtRCywDLnCnE3K+IRp0inyRzSmTokePbyBJFb+VIP0rf5w+DoLYOuAswEWrsI\nFgeYPCgfKagkSCDzC08a3RiqdwKBgQDzxyGYmuzrxE4Hlqg2xH019kXuKzl5t4kj\nrGZdy8DsRn5nalWjJyS2A++JUeEuvHY0USlwxYZSUyfQ0JkwvLYygjcpk30QgeL8\n90zFjdaBULVIsv1xE5fZS7s0J4yXehxvFXhMiqhbtCj8OL3k3oVyYmq+HvrSh6LH\nF+jdecTQowKBgQDtC7ZoBKBlkD1qe5EwqcIIYx+qooRwMRWiusnOKgV/pIq7iUw2\n2JmLxuaE9YyRj6QtTRS0oeKBmGRvzatKrYsWDKMhvcRexY97ZuArzrrCKlQf+qNn\nZglWOzvIGJzqzgORZ1gujpKTaFTMxGJ67oxYb7hg7lBcmaPWnzIV65tUlwKBgB/b\nAbTjadpVSK0NLuYZPxNyHylEVLpnFXCn8qiHG6rEe3ggGRi84Ls4QHD9ViO5VOj5\nQiUOasMPQsCywZHw1w46neK89zbVAkh0OIAITOORHF9npF7GZK1sjAYAtQqGVnjd\noV6/L8jr/f8XmxjxSxbrbW9ytOwV9Vt28GMgqmtpAoGBAMGhYnwf6DzMMiyrjpkz\naqCP7sixADAL8e47Ww6O+5pPS1wsXdUi3AmX6ZMfVOOvhmAS+4Zjtpe2T5t+fZz+\nEcpjXFkOZefjRNLxVChMf+ce94uSFLbNjU2ZTQ7Y8mHHL9DETzrugAI0fLseAE4x\n6bqWny/+unLkmBunfFPeCaLv\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@creative-creatives-v2.iam.gserviceaccount.com

# Google Cloud APIs (using same service account)
GOOGLE_CLOUD_PROJECT_ID=creative-creatives-v2
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDym+msO8Olp5og\nhz4876/KImjmzn7KMNxbqW/5NCDPwDSodpRv24juwJvGdHiErx5RaUJtDKtb1S1E\nld9iyoarjDNb/70SjFtR3GP8+qHZdEiIIjR+eUrIVx92FVQNBlJm2vZjeGdcHvr3\nGv2C1HjlSDzjjMbdSZ+dkpAoD4R4Nd0mPb/W7ATHFK5cRKfz66hHrrByi7JzeHRP\nmLSv5FBmEzt+37XpqdHbuRZuQi2F9W0YWdjpnBsuOeNU2Lc/urh+shHv4854EO7s\n3ZSCEXADM2ilRI2uhrKUJYAPM9nd6c/uzbhGOrQigX8iNypr4SzSUE12WqlsFz4D\nIe6TUTnFAgMBAAECggEAWueh2KfyKMWSwmJ6pyGWiFJ5ZRZ1urQxNWVZMBLgwod+\nE6uO9hTYC8H+/I8Sw4DMhuu+eJb5NGk904em0uEZMflQG0ZJpcQSyasfiiCteYoR\nTXUnn0Y6h7PhdYELY+/8+05LaT0p2YJAPkwONrH/dMYrDoZm027tUIEk4+XgmJu3\naWmapf+PWe9KPIP4/ReooMBx7KxvQADFkT3RcOE3OmuuAkg2pqX5ar/zzgT4oARb\np6q/IJFmKASh4AacfiJ0unepC9T+0IkAomaHxue3O2Z6sYXjCfNWY/1K9c5VqrhO\nzmLAkn+bSr4zg6/z3x0WzbVLbc35roq6jLGhUsh55wKBgQD+xceh506sPgek2b1O\nhDdGhhXuUUie/N8dKLRuKavDiUPf0wbW8r08ZyMEeLMDD7rdxKLRQ0QMUlQxkMzH\nJ34RtRCywDLnCnE3K+IRp0inyRzSmTokePbyBJFb+VIP0rf5w+DoLYOuAswEWrsI\nFgeYPCgfKagkSCDzC08a3RiqdwKBgQDzxyGYmuzrxE4Hlqg2xH019kXuKzl5t4kj\nrGZdy8DsRn5nalWjJyS2A++JUeEuvHY0USlwxYZSUyfQ0JkwvLYygjcpk30QgeL8\n90zFjdaBULVIsv1xE5fZS7s0J4yXehxvFXhMiqhbtCj8OL3k3oVyYmq+HvrSh6LH\nF+jdecTQowKBgQDtC7ZoBKBlkD1qe5EwqcIIYx+qooRwMRWiusnOKgV/pIq7iUw2\n2JmLxuaE9YyRj6QtTRS0oeKBmGRvzatKrYsWDKMhvcRexY97ZuArzrrCKlQf+qNn\nZglWOzvIGJzqzgORZ1gujpKTaFTMxGJ67oxYb7hg7lBcmaPWnzIV65tUlwKBgB/b\nAbTjadpVSK0NLuYZPxNyHylEVLpnFXCn8qiHG6rEe3ggGRi84Ls4QHD9ViO5VOj5\nQiUOasMPQsCywZHw1w46neK89zbVAkh0OIAITOORHF9npF7GZK1sjAYAtQqGVnjd\noV6/L8jr/f8XmxjxSxbrbW9ytOwV9Vt28GMgqmtpAoGBAMGhYnwf6DzMMiyrjpkz\naqCP7sixADAL8e47Ww6O+5pPS1wsXdUi3AmX6ZMfVOOvhmAS+4Zjtpe2T5t+fZz+\nEcpjXFkOZefjRNLxVChMf+ce94uSFLbNjU2ZTQ7Y8mHHL9DETzrugAI0fLseAE4x\n6bqWny/+unLkmBunfFPeCaLv\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_CLIENT_EMAIL=firebase-adminsdk-fbsvc@creative-creatives-v2.iam.gserviceaccount.com

# Google AI Platform APIs
GOOGLE_AI_API_KEY=AIzaSyB4CnhJ2DOlEaBkmEYBOKmB5MTE_37MRjs
VEO_API_ENDPOINT=https://us-central1-aiplatform.googleapis.com/v1/projects/creative-creatives-v2/locations/us-central1/publishers/google/models/veo-001:predict
IMAGEN_API_ENDPOINT=https://us-central1-aiplatform.googleapis.com/v1/projects/creative-creatives-v2/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict

# Hugging Face (for LLaMA) - CRITICAL FOR MARCUS AI
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
LLAMA_MODEL_ENDPOINT=https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct

# NextJS
NEXTAUTH_SECRET=b1e2f3a4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2
NEXTAUTH_URL=http://localhost:3000
```

## Important Notes

### 🔐 Security Considerations
1. **Private Key Formatting**: The private key must include the quotes and proper newline characters (`\n`)
2. **Environment Variables**: Never commit `.env.local` to version control
3. **Service Account**: You're using the same Firebase service account for both Firebase Admin and Google Cloud APIs

### 🔧 Service Account Permissions
Your service account `firebase-adminsdk-fbsvc@creative-creatives-v2.iam.gserviceaccount.com` needs these permissions in Google Cloud Console:

1. **Firebase Admin SDK Service Agent** (already has this)
2. **Vertex AI User** (for Veo and Imagen APIs)
3. **AI Platform Developer** (for AI services)
4. **Storage Object Admin** (for file uploads)

### ✅ Verification Steps

1. **Copy the above configuration** to your `.env.local` file
2. **Update Hugging Face token** with your own READ token
3. **Test all APIs**: Run `node test-simple.js`
4. **Verify 4/4 tests pass** before proceeding
5. **Restart your development server**: `npm run dev`
6. **Test Firebase Auth**: Try signing up/signing in
7. **Test Marcus Chat**: Try chatting with the creative expert
8. **Check Console**: Look for any authentication errors

### 🚨 Common Issues

1. **Newline Characters**: Make sure the private key has proper `\n` characters
2. **Quotes**: Private keys must be wrapped in double quotes
3. **Permissions**: Ensure your service account has Vertex AI permissions
4. **Project ID**: Verify the project ID matches everywhere

### ⚠️ Hugging Face Token Issues

**MOST COMMON ISSUE**: Invalid or expired Hugging Face API token

#### 🔍 Symptoms
- "An error occurred while fetching the blob"
- "Not Found%" when testing with curl
- Marcus creative expert not responding
- LLaMA API test failures

#### 🛠️ Solution: Create Fresh READ Token

1. **Visit**: https://huggingface.co/settings/tokens
2. **Create new token**:
   - **Name**: `Creative-Creatives-V2-LLaMA`
   - **Type**: **READ** (not write, not fine-grained)
3. **Copy token immediately** (only shown once!)
4. **Update .env.local**:
   ```env
   HUGGINGFACE_API_KEY=hf_your_new_token_here
   ```

#### 🧪 Test Your Token

```bash
# Test token validity
curl -H "Authorization: Bearer hf_your_token_here" \
     https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct

# Expected: JSON response with model info
# Error: "Not Found%" = invalid token
```

#### 📊 Token Requirements
- **✅ READ permissions**: Sufficient for Inference API
- **✅ Public model access**: LLaMA 3.1 8B Instruct is public
- **❌ Write permissions**: Not needed for inference
- **❌ Fine-grained permissions**: Overkill for basic API access

#### 🔄 Token Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| "An error occurred while fetching the blob" | Invalid/expired token | Create new READ token |
| "Not Found%" | Authentication failed | Verify token format (starts with `hf_`) |
| Empty response | Rate limiting | Wait 5 minutes or upgrade account |
| "Model not found" | Insufficient permissions | Ensure READ access enabled |
| Token works in browser but not in app | Environment variable not loaded | Restart dev server after updating `.env.local` |

### 🧪 Comprehensive Testing

#### API Integration Test (Recommended First)
```bash
# Test all APIs before starting development
node test-simple.js

# Expected output:
# 🎯 Overall: 4/4 tests passed
# 🎉 ALL TESTS PASSED! Your APIs are ready to go!
```

#### Individual Token Testing
```bash
# Test Hugging Face token specifically
curl -H "Authorization: Bearer $(grep HUGGINGFACE_API_KEY .env.local | cut -d'=' -f2)" \
     https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct
```

#### Application Testing
Once API tests pass, test the full application:

1. **Start Development Server**: `npm run dev`
2. **Open**: http://localhost:3000
3. **Sign Up**: Create new account
4. **Dashboard**: Access dashboard features
5. **Marcus Chat**: Test creative expert chatbot
6. **Check Console**: Verify no authentication errors

#### Test Results Interpretation

✅ **All tests pass**: Ready for development  
⚠️ **Hugging Face fails**: Create new READ token  
⚠️ **Firebase fails**: Check project configuration  
⚠️ **Google Cloud fails**: Verify service account permissions

If everything works, you'll see Marcus respond intelligently to your creative questions!
