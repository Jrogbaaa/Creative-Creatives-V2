# Creative Creatives V2 🎬✨

**AI-Powered 30-Second Advertisement Creation Platform**

Transform your advertising with cutting-edge AI technology. Create professional 30-second advertisements using Google Veo video generation, Imagen image creation, and LLaMA-powered creative expertise.

![Creative Creatives V2](https://img.shields.io/badge/Next.js-14-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![Firebase](https://img.shields.io/badge/Firebase-10.7-orange) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-blue)

## 🚀 Features

### 🎥 AI Video Generation
- **Google Veo Integration**: Create stunning 30-second video advertisements
- **Professional Quality**: Cinematic effects with smooth camera movements
- **Custom Prompts**: AI-optimized prompts for maximum impact

### 🖼️ Smart Image Creation
- **Google Imagen**: High-quality image generation for ads
- **Brand Consistency**: Maintains visual identity across all assets
- **Multiple Formats**: Support for various aspect ratios and styles

### 🧠 Creative Expert AI (Marcus)
- **LLaMA 3.1 8B Instruct**: Powered by Meta's latest language model
- **25+ Years Experience**: Simulated expertise in creative direction
- **Brand Analysis**: Deep understanding of your brand and audience
- **Real-time Chat**: Interactive creative consultation

### 🎨 Brand Intelligence
- **Conversation-Based Setup**: Natural brand discovery process
- **Visual Identity**: Color palettes, fonts, and style preferences
- **Target Audience**: Demographic and psychographic profiling
- **Voice & Tone**: Brand personality analysis

### ⚡ Rapid Production
- **30-Second Focus**: Optimized for short-form advertisement content
- **End-to-End Generation**: Video, audio, and visual assets
- **Cloud Storage**: Firebase integration for asset management
- **Real-time Progress**: Live updates during generation process

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Radix UI**: Accessible component primitives

### AI & ML
- **Google Veo**: Video generation API
- **Google Imagen**: Image generation API
- **LLaMA 3.1 8B Instruct**: Creative expert chatbot
- **Google Cloud Text-to-Speech**: Audio generation

### Backend & Database
- **Firebase Authentication**: Secure user management
- **Cloud Firestore**: NoSQL database for projects and assets
- **Firebase Storage**: File and media storage
- **Firebase Functions**: Serverless backend logic

### Development Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality assurance

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- Firebase project with Authentication, Firestore, and Storage enabled
- Google Cloud Project with AI Platform APIs enabled
- Hugging Face API key for LLaMA access

### ✅ Current Project Status

🎉 **FULLY IMPLEMENTED AND READY FOR PRODUCTION**

All core features are complete and tested:
- ✅ Firebase Authentication & Database integration
- ✅ LLaMA 3.1 8B Creative Expert (Marcus) chatbot
- ✅ Google Veo & Imagen API integration
- ✅ Modern responsive UI with TailwindCSS
- ✅ Complete dashboard and project management
- ✅ Brand analysis and conversation system
- ✅ 30-second ad generation pipeline ready

### ⚠️ Setup Requirements

**Critical**: You must create a valid Hugging Face API token for the LLaMA creative expert:

1. Visit: https://huggingface.co/settings/tokens
2. Create a **READ TOKEN** (not write or fine-grained)
3. Name it: `Creative-Creatives-V2-LLaMA`
4. Update your `.env.local` file with the new token
5. Run `node test-simple.js` to verify all APIs are working

**API Status Check**: The project includes comprehensive API testing to verify all integrations are working properly.

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:Jrogbaaa/Creative-Creatives-V2.git
   cd Creative-Creatives-V2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```

4. **Configure environment variables**
   
   Copy the example environment file and configure with your API keys:
   
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your actual API keys and configuration. See `ENVIRONMENT_SETUP.md` for detailed instructions.

   **Required APIs:**
   - Firebase project configuration
   - Google Cloud service account credentials  
   - **Hugging Face READ TOKEN** for LLaMA access (see troubleshooting below)
   - Google AI Platform API access

   ⚠️ **Hugging Face Token Troubleshooting**:
   
   If you encounter "An error occurred while fetching the blob" or "Not Found" errors:
   
   ```bash
   # Test your token directly
   curl -H "Authorization: Bearer YOUR_TOKEN" https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct
   ```
   
   If this returns "Not Found%", your token is invalid. Create a new READ token at:
   https://huggingface.co/settings/tokens

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Test your API integrations**
   ```bash
   # Run comprehensive API tests
   node test-simple.js
   ```
   
   All tests should pass before proceeding. If Hugging Face API fails, see token troubleshooting above.

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Getting Started

1. **Sign Up/Sign In**: Create an account or sign in to existing account
2. **Brand Discovery**: Chat with Marcus to establish your brand identity
3. **Upload Assets**: Add existing brand materials (optional)
4. **Create Your First Ad**: Start a new project and follow the guided process

### Brand Analysis Workflow

1. **Initial Consultation**: Marcus asks about your industry, target audience, and goals
2. **Brand Values**: Define your brand's core values and personality
3. **Visual Identity**: Establish color palettes, style preferences, and visual direction
4. **Audience Targeting**: Identify demographics, interests, and behaviors
5. **Creative Direction**: Receive personalized recommendations for ad concepts

### Ad Creation Process

1. **Project Setup**: Define ad goals, duration, and target metrics
2. **Concept Development**: Work with Marcus to develop creative concepts
3. **Scene Planning**: Break down your 30-second ad into key scenes
4. **Asset Generation**: 
   - Generate images with Google Imagen
   - Create video content with Google Veo
   - Produce audio with Google Text-to-Speech
5. **Review & Refine**: Preview and make adjustments
6. **Export & Deploy**: Download final ad for your campaigns

### Creative Expert (Marcus) Tips

- **Be Specific**: Provide detailed information about your brand and goals
- **Ask Questions**: Marcus can help with creative challenges and industry insights
- **Iterate**: Don't hesitate to refine concepts based on Marcus's feedback
- **Upload References**: Share existing materials for better context

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── creative/         # AI creative tools
│   ├── dashboard/        # Dashboard components
│   ├── layout/           # Layout components
│   ├── providers/        # Context providers
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Firebase client config
│   ├── firebase-admin.ts # Firebase admin config
│   ├── google-ai.ts      # Google AI services
│   ├── llama.ts          # LLaMA integration
│   └── utils.ts          # Helper functions
└── types/                # TypeScript type definitions
    └── index.ts          # Main type definitions
```

## 🔧 API Integrations

### Google Veo Video Generation

```typescript
const videoRequest: VeoGenerationRequest = {
  prompt: "Create a professional 30-second advertisement...",
  duration: 30,
  aspectRatio: "16:9",
  style: "cinematic",
  camera: "smooth",
  lighting: "natural"
};

const { jobId } = await googleAI.generateVideo(videoRequest);
```

### Google Imagen Image Generation

```typescript
const imageRequest: ImagenGenerationRequest = {
  prompt: "Professional product photography...",
  aspectRatio: "16:9",
  style: "photographic",
  quality: "high"
};

const { imageUrl } = await googleAI.generateImage(imageRequest);
```

### LLaMA Creative Expert

```typescript
const response = await creativeExpert.chat(messages, {
  brand: brandInfo,
  currentGoal: 'concept_development',
  extractedInfo: userInputs
});
```

## 🎨 Customization

### Brand Colors

```typescript
// Update brand color palettes in lib/utils.ts
export const colorPalettes = {
  tech: ['#007bff', '#6f42c1', '#20c997', '#fd7e14'],
  healthcare: ['#28a745', '#17a2b8', '#6c757d', '#ffc107'],
  // Add your industry colors
};
```

### Creative Expert Personality

```typescript
// Customize Marcus's personality in lib/llama.ts
private systemPrompt = `You are Marcus, a creative director with expertise in...`;
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy**: Automatic deployment on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Docker containers

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.creative-creatives.com](https://docs.creative-creatives.com)
- **Issues**: [GitHub Issues](https://github.com/Jrogbaaa/Creative-Creatives-V2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Jrogbaaa/Creative-Creatives-V2/discussions)
- **Email**: support@creative-creatives.com

## 🙏 Acknowledgments

- **Google AI**: For Veo and Imagen APIs
- **Meta**: For LLaMA 3.1 model access
- **Firebase**: For backend infrastructure
- **Vercel**: For hosting and deployment
- **Open Source Community**: For the amazing tools and libraries

---

**Built with ❤️ by the Creative Creatives Team**

*Transform your advertising with AI - Create, Innovate, Captivate* ✨
