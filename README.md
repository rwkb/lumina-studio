# Lumina Studio

AI-powered video generation wizard for fashion and cosmetics brands. Transform product images into stunning social media videos with elegant, premium aesthetics.

## Features

- **Multi-step Creation Wizard**: Guided 5-step workflow for video creation
- **Product Input**: Drag-and-drop image upload with platform selection
- **AI Script Generation**: Auto-generated scripts with hooks, body, and CTAs
- **Keyframe Selection**: AI-generated keyframe suggestions
- **Video Generation**: Mock AI video generation (BytePlus integration ready)
- **Video Library**: Manage and filter your created videos
- **Responsive Design**: Beautiful across desktop and mobile

### Supported Platforms

- TikTok
- Instagram Reels
- YouTube Shorts
- Instagram Feed
- Xiaohongshu
- Custom dimensions

### Style Presets

- Clean Luxury
- Soft Girl
- UGC Authentic
- Cinematic Product Hero
- Minimal Editorial

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **State Management**: Zustand (with persistence)
- **File Upload**: React Dropzone
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd lumina-studio

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── create/            # Wizard flow
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── shared/            # Shared components
│   └── wizard/            # Wizard step components
├── lib/
│   └── wizard/            # State, types, mock data
└── public/                # Static assets
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Deploy the .next folder to Netlify
```

## Future Integrations

This demo is prepared for integration with:

- **BytePlus APIs**: Seed LLM, Seedream, Seedance for AI generation
- **TikTok Shop**: Shoppable video functionality
- **CDN**: Video storage and delivery

Look for `// TODO: BACKEND` comments throughout the codebase for integration points.

## Design System

- Background: #F9F6F2 (Cream)
- Card Background: #FFFFFF
- Primary Accent: #E8B4B8 (Blush)
- Text Primary: #2C2C2C
- Border Radius: 2xl (16px)
- Soft shadows throughout

## License

MIT
